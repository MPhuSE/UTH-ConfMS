// src/components/FileUploadArea.jsx
export default function FileUploadArea({ files, setFiles, disabled }) {
  const MAX_FILES = 50;
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);

    if (files.length + selected.length > MAX_FILES) {
      alert("Tối đa 50 file");
      return;
    }

    for (let f of selected) {
      if (f.size > MAX_SIZE) {
        alert(`File ${f.name} vượt quá 100MB`);
        return;
      }
    }

    setFiles([...files, ...selected]);
  };

  return (
    <div className="border rounded-xl p-4 space-y-2">
      <p className="font-medium">
        📎 Tải file (PDF / Word / PPT / Link)
      </p>
      <p className="text-sm text-gray-500">
        Tối đa 100MB / file – tối đa 50 file
      </p>

      <input
        type="file"
        multiple
        disabled={disabled}
        onChange={handleChange}
      />

      <ul className="text-sm">
        {files.map((f, i) => (
          <li key={i}>• {f.name}</li>
        ))}
      </ul>
    </div>
  );
}
