"use client";

import { useState } from "react";

export default function AssetsManager() {
  const [files, setFiles] = useState([]);
  const [uploaded, setUploaded] = useState([]);

  const handleFiles = (e) => setFiles(e.target.files);

  const uploadFiles = async () => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("files", files[i]);

    const res = await fetch("/api/branding/assets", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.success) setUploaded(data.files);
  };

  return (
    <div>
      <h1>Assets / Logo Manager</h1>
      <input type="file" multiple onChange={handleFiles} />
      <button onClick={uploadFiles}>Upload</button>

      <div style={{ marginTop: 20 }}>
        <h3>Uploaded Files:</h3>
        {uploaded.map((f, i) => (
          <div key={i}>{f.name}</div>
        ))}
      </div>
    </div>
  );
}
