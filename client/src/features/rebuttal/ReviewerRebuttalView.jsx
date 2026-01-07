import { useEffect, useState } from "react";
import { getRebuttalByPaper } from "./useRebuttal";

export default function ReviewerRebuttalView({ paperId }) {
  const [rebuttal, setRebuttal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paperId) return;

    const fetchRebuttal = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getRebuttalByPaper(paperId);
        setRebuttal(data);
      } catch (err) {
        // 404 = chưa có rebuttal → trạng thái hợp lệ
        if (err?.response?.status === 404) {
          setRebuttal(null);
        } else {
          console.error("Load rebuttal failed:", err);
          setError("Không thể tải rebuttal.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRebuttal();
  }, [paperId]);

  // ===== UI STATES =====
  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải rebuttal...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!rebuttal) {
    return (
      <p className="text-sm text-gray-500">
        Tác giả chưa gửi rebuttal cho bài báo này.
      </p>
    );
  }

  // ===== VIEW =====
  return (
    <section className="bg-white border rounded-xl p-4 space-y-2">
      <h3 className="text-lg font-semibold">Author Rebuttal</h3>
      <p className="whitespace-pre-line text-sm text-gray-800">
        {rebuttal.content}
      </p>
    </section>
  );
}
