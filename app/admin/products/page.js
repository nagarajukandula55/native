// ------------------------
// Upload image to Cloudinary API
// ------------------------
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!data.success) throw new Error(data.message || "Image upload failed");

  return data.url; // only return the URL for storing in DB
};

// ------------------------
// Add or Update Product
// ------------------------
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let imageUrl = form.image || "";
    if (form.imageFile) {
      imageUrl = await uploadImage(form.imageFile);
    }

    const payload = {
      ...form,
      price: Number(form.price),
      image: imageUrl,
    };

    if (editingId) {
      await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId }),
      });
    } else {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setForm({
      name: "",
      price: "",
      description: "",
      image: "",
      stock: 100,
      category: "General",
      featured: false,
      imageFile: null,
    });
    setPreview(null);
    setEditingId(null);

    await loadProducts();
    alert(editingId ? "Product updated!" : "Product added!");
  } catch (err) {
    console.error("Error saving product:", err);
    alert("Error saving product. See console.");
  } finally {
    setLoading(false);
  }
};
