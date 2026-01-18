import { useState } from "react";
import { Tag, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { aiService } from "../../services";
import { toast } from "react-hot-toast";

/**
 * Keywords Extraction Component
 * Extracts keywords from text with AI assistance
 */
export default function KeywordsComponent({ text, onKeywordsExtracted }) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (!text || !text.trim()) {
      toast.error("Vui lòng nhập text để trích xuất keywords");
      return;
    }

    try {
      setIsExtracting(true);
      const response = await aiService.extractKeywords(text);
      setKeywords(response.keywords || []);
      
      if (onKeywordsExtracted) {
        onKeywordsExtracted(response.keywords);
      }
      
      toast.success(`Đã trích xuất ${response.keywords?.length || 0} keywords`);
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Không thể trích xuất keywords");
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    if (keywords.length > 0) {
      const keywordsText = keywords.join(", ");
      navigator.clipboard.writeText(keywordsText);
      setCopied(true);
      toast.success("Đã sao chép keywords");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleExtract}
        disabled={isExtracting || !text}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isExtracting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            <span>Đang trích xuất...</span>
          </>
        ) : (
          <>
            <Sparkles size={16} />
            <span>Trích xuất Keywords</span>
          </>
        )}
      </button>

      {keywords.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag size={16} />
              <span>Keywords đã trích xuất ({keywords.length})</span>
            </div>
            <button
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
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
