import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getErrorMessage } from "../../../utils/errors";
import Button from "../../../components/Button";
import api from "../../../lib/axios";

export default function BulkNotificationsPage() {
  const { conferenceId } = useParams();
  const confIdNum = useMemo(() => Number(conferenceId), [conferenceId]);
  const [hideReviewer, setHideReviewer] = useState(true);
  const [onlyDecided, setOnlyDecided] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSend = async () => {
    if (!confIdNum || isNaN(confIdNum) || confIdNum <= 0) {
      toast.error("ID hội nghị không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        `/notifications/send-results/conferences/${confIdNum}?hide_reviewer=${hideReviewer}&only_decided=${onlyDecided}`
      );
      setResult(res.data);
      toast.success(`Đã gửi: ${res.data.sent}, lỗi: ${res.data.failed}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gửi email hàng loạt thất bại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk email to Authors</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gửi email kết quả (decision + reviews) cho toàn bộ submissions của conference
        </p>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-3">
        <div className="text-sm text-gray-700">
          Conference: <span className="font-semibold">#{confIdNum}</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={hideReviewer} onChange={(e) => setHideReviewer(e.target.checked)} />
          Hide reviewer identity (Reviewer #1, #2…)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={onlyDecided} onChange={(e) => setOnlyDecided(e.target.checked)} />
          Only decided submissions (accepted/rejected/…)
        </label>
        <div className="flex justify-end">
          <Button onClick={handleSend} disabled={loading} className="!w-auto">
            {loading ? "Sending..." : "Send emails"}
          </Button>
        </div>
      </div>

      {result && (
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-semibold mb-2">Result</div>
          <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

