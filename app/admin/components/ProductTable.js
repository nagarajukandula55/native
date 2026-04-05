"use client";

export default function ProductTable({ products, onEdit, onDelete }) {
  async function remove(id) {
    if (!confirm("Delete?")) return;

    await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });

    onDelete();
  }

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">All Products</h2>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>₹{p.sellingPrice}</td>
              <td>{p.status}</td>
              <td className="space-x-2">
                <button onClick={() => onEdit(p)}>Edit</button>
                <button onClick={() => remove(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
