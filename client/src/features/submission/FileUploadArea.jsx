import { useRef } from "react";

export default function FileUploadArea({ files, setFiles, disabled }) {
  const inputRef = useRef(null);

  const handleAddFiles = (e) => {
    const selected = Array.from(e.target.files);

    if (files.length + selected.length > 50) {
      alert("Tối đa 50 file");
      return;
    }

    setFiles([...files, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-lg">Upload file</h3>

      <p className="text-sm text-gray-500">
        Tối đa 100MB / file – tối đa 50 file – PDF, Word, PPT, ZIP
      </p>

      {/* INPUT FILE ẨN */}
      <input
        ref={inputRef}
        type="file"
        multiple
        disabled={disabled}
        onChange={handleAddFiles}
        className="hidden"
      />

      {/* BUTTONS */}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current.click()}
          className={`px-4 py-2 rounded text-white ${
            disabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Choose file
        </button>

        <button
          type="button"
          disabled={disabled || files.length >= 50}
          onClick={() => inputRef.current.click()}
          className={`px-4 py-2 rounded text-white ${
            disabled || files.length >= 50
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Thêm
        </button>
      </div>

      {/* FILE LIST */}
      {files.length > 0 && (
        <ul className="text-sm text-gray-700 space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex justify-between items-center border px-3 py-2 rounded"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
