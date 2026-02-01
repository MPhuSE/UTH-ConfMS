import { useState } from "react";
import { FileText, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { aiService } from "../../services";
import { toast } from "react-hot-toast";
import Button from "../Button";

/**
 * Summary Generation Component
 * Generates neutral summaries (150-250 words) for abstracts/texts
 */
export default function SummaryComponent({ text, maxWords = 200, onSummaryGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState(null); // Changed from summary to data
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!text || !text.trim()) {
      toast.error("Vui lòng nhập text để tạo tóm tắt");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await aiService.getReviewSupport(text, maxWords);
      setData(response);

      if (onSummaryGenerated && response.summary) {
        onSummaryGenerated(response.summary);
      }

      toast.success("Đã tạo tóm tắt thành công!");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Không thể tạo tóm tắt");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (data?.summary) {
      navigator.clipboard.writeText(data.summary);
      setCopied(true);
      toast.success("Đã sao chép tóm tắt");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || !text}
        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Đang phân tích bài báo...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>AI tóm tắt & trích xuất ý chính</span>
          </>
        )}
      </button>

      {data && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              <span>Tóm tắt nội dung (AI)</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Sao chép</span>
                </>
              )}
            </button>
          </div>

          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
            {data.summary}
          </div>

          {data.key_points && data.key_points.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Các ý chính:</div>
              <ul className="list-disc list-inside space-y-1">
                {data.key_points.map((point, i) => (
                  <li key={i} className="text-sm text-gray-600">{point}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-400">
            Phân tích bởi Gemini AI • {data.summary?.split(/\s+/).length || 0} từ
          </div>
        </div>
      )}
    </div>
  );
}
