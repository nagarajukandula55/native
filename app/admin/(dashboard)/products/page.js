"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gstCategoryId: "",
    websiteCategoryId: "",
    price: 0,
    mrp: 0,
    costPrice: 0,
    discount: 0,
    images: [],
    isActive: true,
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", hsn: "", gst: "" });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* =============== Fetch Products =============== */
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== Fetch Categories =============== */
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== Handle Input =============== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    setFormData((prev) => ({ ...prev, images: Array.from(e.target.files) }));
  };

  /* =============== Add/Edit Product =============== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gstCategoryId || !formData.websiteCategoryId) {
      return toast.error("Name and categories are required");
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "images") {
        value.forEach((file) => payload.append("images", file));
      } else {
        payload.append(key, value);
      }
    });

    try {
      let res;
      if (editingProductId) {
        res = await axios.put(`/api/admin/products/${editingProductId}`, payload);
      } else {
        res = await axios.post("/api/admin/products", payload);
      }

      if (res.data.success) {
        toast.success(editingProductId ? "Product updated" : "Product added");
        setFormData({
          name: "",
          description: "",
          gstCategoryId: "",
          websiteCategoryId: "",
          price: 0,
          mrp: 0,
          costPrice: 0,
          discount: 0,
          images: [],
          isActive: true,
        });
        setEditingProductId(null);
        fetchProducts();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving product");
    }
  };

  /* =============== Edit Product =============== */
  const handleEdit = (p) => {
    setEditingProductId(p._id);
    setFormData({
      name: p.name,
      description: p.description || "",
      gstCategoryId: p.gstCategory?._id || "",
      websiteCategoryId: p.websiteCategory?._id || "",
      price: p.price,
      mrp: p.mrp,
      costPrice: p.costPrice,
      discount: p.discount,
      images: [],
      isActive: p.isActive,
    });
  };

  /* =============== Toggle Active =============== */
  const toggleActive = async (id) => {
    try {
      await axios.put(`/api/admin/products/${id}/toggle`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  /* =============== Add Category =============== */
  const handleAddCategory = async () => {
    if (!newCategory.name) return toast.error("Category name required");

    try {
      const res = await axios.post("/api/admin/categories", {
        ...newCategory,
        type: showCategoryModal.type,
      });
      if (res.data.success) {
        toast.success("Category added");
        fetchCategories();
        setShowCategoryModal(null);
        setNewCategory({ name: "", hsn: "", gst: "" });
      } else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Products</h2>

      {/* ================= Product Form ================= */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />

        {/* GST Category */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <select
            name="gstCategoryId"
            value={formData.gstCategoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select GST Category</option>
            {categories
              .filter((c) => c.type === "gst")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.hsnCode} | {c.gst}%)
                </option>
              ))}
          </select>
          <button type="button" onClick={() => setShowCategoryModal({ type: "gst" })}>
            + Add GST
          </button>
        </div>

        {/* Website Category */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <select
            name="websiteCategoryId"
            value={formData.websiteCategoryId}
            onChange={handleChange}
            required
          >
            <option value="">Select Website Category</option>
            {categories
              .filter((c) => c.type === "website")
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
          <button type="button" onClick={() => setShowCategoryModal({ type: "website" })}>
            + Add Website
          </button>
        </div>

        <input
          type="number"
          name="price"
          placeholder="Selling Price"
          value={formData.price}
          onChange={handleChange}
        />
        <input
          type="number"
          name="mrp"
          placeholder="MRP"
          value={formData.mrp}
          onChange={handleChange}
        />
        <input
          type="number"
          name="costPrice"
          placeholder="Cost Price"
          value={formData.costPrice}
          onChange={handleChange}
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={formData.discount}
          onChange={handleChange}
        />

        <input type="file" multiple onChange={handleFiles} />
        <label>
          Active:
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
        </label>
        <button type="submit">{editingProductId ? "Update Product" : "Add Product"}</button>
      </form>

      {/* ================= Products Table ================= */}
      <table border="1" cellPadding={10} style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>GST Category</th>
            <th>Website Category</th>
            <th>Price</th>
            <th>MRP</th>
            <th>Cost Price</th>
            <th>Discount</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>
                {p.images?.length ? (
                  <Image src={p.images[0]} alt={p.name} width={50} height={50} />
                ) : (
                  "No Image"
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.gstCategory?.name}</td>
              <td>{p.websiteCategory?.name}</td>
              <td>{p.price}</td>
              <td>{p.mrp}</td>
              <td>{p.costPrice}</td>
              <td>{p.discount}</td>
              <td>
                <input
                  type="checkbox"
                  checked={p.isActive}
                  onChange={() => toggleActive(p._id)}
                />
              </td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= Add Category Modal ================= */}
      {showCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minWidth: 300 }}>
            <h3>Add {showCategoryModal.type === "gst" ? "GST" : "Website"} Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
            />
            {showCategoryModal.type === "gst" && (
              <>
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={newCategory.hsn}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, hsn: e.target.value }))}
                />
                <input
                  type="number"
                  placeholder="GST %"
                  value={newCategory.gst}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, gst: e.target.value }))}
                />
              </>
            )}
            <div style={{ marginTop: 10 }}>
              <button onClick={handleAddCategory}>Add</button>
              <button onClick={() => setShowCategoryModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
