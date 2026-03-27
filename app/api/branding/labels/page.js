"use client";

import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import Barcode from "react-barcode";

export default function LabelSaaS() {
  const [front, setFront] = useState([]);
  const [back, setBack] = useState([]);
  const [side, setSide] = useState("front");
  const [selected, setSelected] = useState(null);
  const [labels, setLabels] = useState([]);
  const [name, setName] = useState("");

  const elements = side === "front" ? front : back;
  const setElements = side === "front" ? setFront : setBack;

  useEffect(() => { fetchLabels(); }, []);

  const fetchLabels = async () => {
    const res = await fetch("/api/branding/labels");
    const data = await res.json();
    if (data.success) setLabels(data.labels);
  };

  /* ADD ELEMENTS */
  const addText = () => setElements(p => [...p, {
    id: Date.now(),
    type: "text",
    text: "Text",
    x: 100, y: 100,
    width: 150, height: 40,
    fontSize: 18,
    color: "#000",
  }]);

  const addImage = (src="/logo.png") => setElements(p => [...p, {
    id: Date.now(),
    type: "image",
    src,
    x: 120, y: 120,
    width: 120, height: 80,
  }]);

  const addQR = () => setElements(p => [...p, {
    id: Date.now(),
    type: "qr",
    value: "QR",
    x: 100, y: 100,
    width: 80, height: 80,
  }]);

  const addBarcode = () => setElements(p => [...p, {
    id: Date.now(),
    type: "barcode",
    value: "123456",
    x: 100, y: 100,
    width: 150, height: 60,
  }]);

  /* AI */
  const generateAI = async () => {
    const res = await fetch("/api/branding/ai-label", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ productName: name || "Product" })
    });

    const data = await res.json();
    if(data.success){
      setFront(data.front);
      setBack(data.back);
    }
  };

  /* SAVE */
  const save = async () => {
    await fetch("/api/branding/labels", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, front, back })
    });
    fetchLabels();
    alert("Saved");
  };

  const load = (l) => {
    setFront(l.front);
    setBack(l.back);
    setName(l.name);
  };

  const updateElement = (id, data) => {
    setElements(p => p.map(el => el.id === id ? {...el,...data}:el));
  };

  const selectedEl = elements.find(el => el.id === selected);

  const exportImage = async () => {
    const canvas = document.getElementById("canvas");
    const img = await html2canvas(canvas);
    const link = document.createElement("a");
    link.download = "label.png";
    link.href = img.toDataURL();
    link.click();
  };

  return (
    <div style={{ display:"flex", height:"100vh" }}>

      <div style={{ width:220, background:"#111", color:"#fff", padding:10 }}>
        <button onClick={()=>setSide("front")}>Front</button>
        <button onClick={()=>setSide("back")}>Back</button>

        <button onClick={addText}>Text</button>
        <button onClick={()=>addImage()}>Image</button>
        <button onClick={addQR}>QR</button>
        <button onClick={addBarcode}>Barcode</button>

        <button onClick={generateAI}>🤖 AI</button>

        <input value={name} onChange={(e)=>setName(e.target.value)} />
        <button onClick={save}>Save</button>
        <button onClick={exportImage}>Export</button>

        <hr />
        {labels.map(l=>(
          <div key={l._id} onClick={()=>load(l)}>{l.name}</div>
        ))}
      </div>

      <div id="canvas" style={{ flex:1, background:"#f5f5f5", position:"relative" }}>
        {elements.map(el=>(
          <Rnd key={el.id}
            size={{width:el.width,height:el.height}}
            position={{x:el.x,y:el.y}}
            onDragStop={(e,d)=>updateElement(el.id,{x:d.x,y:d.y})}
            onResizeStop={(e,dir,ref,delta,pos)=>updateElement(el.id,{
              width:parseInt(ref.style.width),
              height:parseInt(ref.style.height),
              ...pos
            })}
            onClick={()=>setSelected(el.id)}
          >
            {el.type==="text" && (
              <div contentEditable suppressContentEditableWarning
                onBlur={(e)=>updateElement(el.id,{text:e.target.innerText})}>
                {el.text}
              </div>
            )}

            {el.type==="image" && <img src={el.src} style={{width:"100%"}}/>}
            {el.type==="qr" && <QRCodeCanvas value={el.value} />}
            {el.type==="barcode" && <Barcode value={el.value} />}
          </Rnd>
        ))}
      </div>

      <div style={{ width:200, background:"#eee", padding:10 }}>
        {selectedEl && selectedEl.type==="text" && (
          <>
            <input type="number" value={selectedEl.fontSize}
              onChange={(e)=>updateElement(selectedEl.id,{fontSize:Number(e.target.value)})}/>
            <input type="color" value={selectedEl.color}
              onChange={(e)=>updateElement(selectedEl.id,{color:e.target.value})}/>
          </>
        )}
      </div>
    </div>
  );
}
