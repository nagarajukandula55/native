const uploadImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      addElement({
        id: Date.now(),
        type: "image",
        src: data.url, // 🔥 CLOUDINARY URL
        x: 100,
        y: 100,
        width: 150,
        height: 100
      });
    } else {
      alert("Upload failed");
    }

  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
};
