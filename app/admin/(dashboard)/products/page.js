"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
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
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newHSN, setNewHSN] = useState("");
  const [newGST, setNewGST] = useState("");

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/admin/products");
      if (res.data.success) setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/admin/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, images: Array.from(e.target.files) }));
  };

  /* ================= ADD / EDIT PRODUCT ================= */
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
      toast.error("Failed to save product");
    }
  };

  /* ================= EDIT PRODUCT ================= */
  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setFormData({
      name: product.name,
      gstCategoryId: product.gstCategory?._id || "",
      websiteCategoryId: product.websiteCategory?._id || "",
      price: product.price,
      mrp: product.mrp,
      costPrice: product.costPrice,
      discount: product.discount,
      images: [], // Images will be replaced only if admin uploads new
      isActive: product.isActive,
    });
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async (productId) => {
    try {
      const res = await axios.put(`/api/admin/products/${productId}/toggle`);
      if (res.data.success) fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= ADD CATEGORY ================= */
  const handleAddCategory = async () => {
    if (!newCategoryName) return toast.error("Category name required");

    try {
      const payload = {
        name: newCategoryName,
        type: showAddCategoryModal.type,
        hsnCode: newHSN,
        gst: newGST,
      };

      const res = await axios.post("/api/admin/categories", payload);
      if (res.data.success) {
        toast.success("Category added");
        fetchCategories(); // Refresh dropdown
        setShowAddCategoryModal(null);
        setNewCategoryName("");
        setNewHSN("");
        setNewGST("");
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Products</h2>

      {/* ================= ADD / EDIT FORM ================= */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />

        {/* GST Category Dropdown */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <select
            name="gstCategoryId"
            value={formData.gstCategoryId}
            onChange={handleInputChange}
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
          <button type="button" onClick={() => setShowAddCategoryModal({ type: "gst" })}>
            + Add Category
          </button>
        </div>

        {/* Website Category Dropdown */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <select
            name="websiteCategoryId"
            value={formData.websiteCategoryId}
            onChange={handleInputChange}
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
          <button type="button" onClick={() => setShowAddCategoryModal({ type: "website" })}>
            + Add Category
          </button>
        </div>

        <input
          type="number"
          name="price"
          placeholder="Selling Price"
          value={formData.price}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="mrp"
          placeholder="MRP"
          value={formData.mrp}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="costPrice"
          placeholder="Cost Price"
          value={formData.costPrice}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="discount"
          placeholder="Discount %"
          value={formData.discount}
          onChange={handleInputChange}
        />

        <input type="file" multiple onChange={handleFileChange} />

        <label>
          Active:
          <input
            type="checkbox"
            checked={formData.isActive}
            name="isActive"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
          />
        </label>

        <button type="submit">{editingProductId ? "Update Product" : "Add Product"}</button>
      </form>

      {/* ================= PRODUCTS TABLE ================= */}
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
                {p.images?.[0] ? (
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

      {/* ================= ADD CATEGORY MODAL ================= */}
      {showAddCategoryModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 12, minWidth: 300 }}>
            <h3>Add {showAddCategoryModal.type === "gst" ? "GST" : "Website"} Category</h3>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            {showAddCategoryModal.type === "gst" && (
              <>
                <input
                  type="text"
                  placeholder="HSN Code"
                  value={newHSN}
                  onChange={(e) => setNewHSN(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="GST %"
                  value={newGST}
                  onChange={(e) => setNewGST(e.target.value)}
                />
              </>
            )}
            <div style={{ marginTop: 10 }}>
              <button onClick={handleAddCategory}>Add</button>
              <button onClick={() => setShowAddCategoryModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
