import { useState } from "react";
import { submitRebuttal } from "./useRebuttal";

export default function AuthorRebuttalForm({ paperId, onSubmitted }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Nội dung rebuttal không được để trống.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await submitRebuttal({ paperId, content });

      setContent("");

      // callback cho parent reload data (nếu có)
      if (typeof onSubmitted === "function") {
        onSubmitted();
      }
    } catch (err) {
      console.error("Submit rebuttal failed:", err);
      setError("Gửi rebuttal thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white border rounded-xl p-4 space-y-3">
      <h3 className="text-lg font-semibold">Rebuttal</h3>

      <textarea
        rows={6}
        className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write your rebuttal here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Rebuttal"}
        </button>
      </div>
    </section>
  );
}
