"use client";

import { useState } from "react";

export default function AssetsPage() {
  const [files, setFiles] = useState([]);

  const handleUpload = (e) => {
    const uploaded = Array.from(e.target.files);
    setFiles([...files, ...uploaded]);
  };

  return (
    <div>
      <h1>Assets</h1>
      <input type="file" multiple onChange={handleUpload} />
      <ul>
        {files.map((file, idx) => <li key={idx}>{file.name}</li>)}
      </ul>
    </div>
  );
}
