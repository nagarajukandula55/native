"use client";

import Modal from "../ui/Modal";

export default function CategoryModals({
  showCatModal,
  setShowCatModal,
  showSubModal,
  setShowSubModal,
  showGstModal,
  setShowGstModal,

  newCategory,
  setNewCategory,
  newSubcategory,
  setNewSubcategory,
  newGst,
  setNewGst,

  handleCreateCategory,
  handleCreateSubcategory,
  handleCreateGst,
}) {
  return (
    <>
      {/* CATEGORY */}
      <Modal open={showCatModal} onClose={() => setShowCatModal(false)} title="Add Category">
        <input
          placeholder="Category Name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleCreateCategory}>Save</button>
      </Modal>

      {/* SUBCATEGORY */}
      <Modal open={showSubModal} onClose={() => setShowSubModal(false)} title="Add Subcategory">
        <input
          placeholder="Subcategory Name"
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
        />
        <button onClick={handleCreateSubcategory}>Save</button>
      </Modal>

      {/* GST */}
      <Modal open={showGstModal} onClose={() => setShowGstModal(false)} title="Add GST">
        <input
          placeholder="Name"
          value={newGst.name}
          onChange={(e) => setNewGst({ ...newGst, name: e.target.value })}
        />
        <input
          placeholder="GST %"
          value={newGst.gst}
          onChange={(e) => setNewGst({ ...newGst, gst: e.target.value })}
        />
        <input
          placeholder="HSN"
          value={newGst.hsn}
          onChange={(e) => setNewGst({ ...newGst, hsn: e.target.value })}
        />

        <button onClick={handleCreateGst}>Save</button>
      </Modal>
    </>
  );
}
