async function saveWarehouse(){

  try{

    const res = await fetch("/api/admin/warehouse/create",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        name,
        location
      })
    })

    const data = await res.json()

    if(data.success){
      alert("Warehouse Added")

      setName("")
      setLocation("")

      loadWarehouses()   // ⭐ important
    }
    else{
      alert(data.message || "Save failed")
    }

  }catch(err){
    alert("Server error")
    console.log(err)
  }

}
