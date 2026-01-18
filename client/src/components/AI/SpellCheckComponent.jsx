import { useState } from "react";
import { Sparkles, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { aiService } from "../../services";
import { toast } from "react-hot-toast";
import Button from "../Button";

/**
 * Spell and Grammar Check Component
 * Provides on-demand spell/grammar checking with suggestions
 */
export default function SpellCheckComponent({ text, onTextChange, label = "Check Spelling & Grammar" }) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleCheck = async () => {
    if (!text || !text.trim()) {
      toast.error("Vui lòng nhập text để kiểm tra");
      return;
    }

    try {
      setIsChecking(true);
      const response = await aiService.checkSpellGrammar(text);
      setResult(response);
      setShowSuggestions(true);
      
      if (!response.has_errors) {
        toast.success("Không tìm thấy lỗi chính tả hoặc ngữ pháp!");
      } else {
        toast.info(`Tìm thấy ${response.suggestions?.length || 0} gợi ý`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Không thể kiểm tra chính tả");
      console.error(error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplySuggestion = (suggestion) => {
    if (onTextChange && suggestion) {
      onTextChange(suggestion);
      toast.success("Đã áp dụng gợi ý");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={handleCheck}
          disabled={isChecking || !text}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isChecking ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Đang kiểm tra...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>{label}</span>
            </>
          )}
        </button>
        
        {result && (
          <button
            onClick={() => {
              setResult(null);
              setShowSuggestions(false);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {result && showSuggestions && (
        <div className={`p-4 rounded-lg border ${
          result.has_errors 
            ? "bg-amber-50 border-amber-200" 
            : "bg-green-50 border-green-200"
        }`}>
          <div className="flex items-start gap-3">
            {result.has_errors ? (
              <AlertCircle className="text-amber-600 mt-0.5" size={20} />
            ) : (
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
            )}
            <div className="flex-1">
              <div className="font-medium mb-2">
                {result.has_errors 
                  ? "Tìm thấy lỗi chính tả hoặc ngữ pháp" 
                  : "Không có lỗi nào được tìm thấy"}
              </div>
              
              {result.has_errors && result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Độ tin cậy: {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                      >
                        <span className="text-sm text-gray-700">{suggestion}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="!px-2 !py-1 text-xs"
                        >
                          Áp dụng
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
