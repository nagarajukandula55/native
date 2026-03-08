"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {

  const emptyForm = {
    name: "",
    price: "",
    image: "",
    description: "",
    category: "",
    stock: ""
  };

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // IMAGE UPLOAD
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        image: data.url
      }));

    } catch (err) {
      console.error("Upload error:", err);
    }

    setLoading(false);
  };

  // ADD PRODUCT
  const addProduct = async () => {

    if (!form.name || !form.price) {
      alert("Name and price required");
      return;
    }

    setLoading(true);

    await fetch("/api/admin/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0)
      })
    });

    setForm(emptyForm);
    await fetchProducts();
    setLoading(false);
  };

  // EDIT
  const startEdit = (p) => {

    setEditingId(p.id);

    setForm({
      name: p.name,
      price: p.price,
      image: p.image || "",
      description: p.description || "",
      category: p.category || "",
      stock: p.stock || ""
    });

  };

  // UPDATE
  const updateProduct = async () => {

    setLoading(true);

    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: editingId,
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0)
      })
    });

    setEditingId(null);
    setForm(emptyForm);
    await fetchProducts();
    setLoading(false);
  };

  // DELETE
  const deleteProduct = async (id) => {

    if (!confirm("Delete product?")) return;

    setLoading(true);

    await fetch("/api/admin/products", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    await fetchProducts();
    setLoading(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div style={{ padding: 40, fontFamily: "Georgia, serif" }}>

      <h1 style={{ fontSize: 36 }}>Admin Dashboard</h1>

      {/* SEARCH */}
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        style={{ padding:10, margin:"20px 0", width:"300px"}}
      />

      {/* PRODUCT FORM */}
      <div style={{
        maxWidth:500,
        display:"flex",
        flexDirection:"column",
        gap:10,
        marginBottom:40
      }}>

        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

        <input
          name="category"
          placeholder="Category (Pickles, Snacks...)"
          value={form.category}
          onChange={handleChange}
        />

        <input
          name="stock"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {form.image && (
          <img
            src={form.image}
            style={{ width:120, borderRadius:8 }}
          />
        )}

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        {editingId ? (

          <button
            onClick={updateProduct}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Product"}
          </button>

        ) : (

          <button
            onClick={addProduct}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>

        )}

      </div>

      {/* PRODUCT TABLE */}

      <table style={{ width:"100%", borderCollapse:"collapse" }}>

        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredProducts.map((p)=>(
            <tr key={p.id}>

              <td>{p.name}</td>
              <td>₹{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.category}</td>

              <td>
                {p.image && (
                  <img
                    src={p.image}
                    style={{width:50}}
                  />
                )}
              </td>

              <td>

                <button onClick={()=>startEdit(p)}>
                  Edit
                </button>

                <button
                  onClick={()=>deleteProduct(p.id)}
                  style={{marginLeft:10}}
                >
                  Delete
                </button>

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}
