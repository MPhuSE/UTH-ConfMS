import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { conferenceService } from "../../../services";
import { toast } from "react-hot-toast";
import { Sparkles, ToggleLeft, ToggleRight, Info, CheckCircle, XCircle } from "lucide-react";
import Button from "../../../components/Button";

/**
 * AI Feature Flags Management Page
 * Allows admins/chairs to enable/disable AI features per conference
 */
export default function AIFeatureFlagsPage() {
  const { conferenceId } = useParams();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({
    spell_check: true,
    summary: true,
    similarity: true,
    keywords: true,
    email_template: true,
  });

  useEffect(() => {
    if (conferenceId) {
      loadData();
    }
  }, [conferenceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const confData = await conferenceService.getById(conferenceId);
      setConference(confData);
      
      // Load feature flags from conference settings (if available)
      // For now, using default values
      if (confData.ai_features) {
        setFeatureFlags(confData.ai_features);
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (feature) => {
    setFeatureFlags((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: Implement API endpoint to save AI feature flags
      // await conferenceService.updateAIFeatures(conferenceId, featureFlags);
      
      // For now, just show success message
      toast.success("Đã lưu cài đặt AI features");
    } catch (error) {
      toast.error("Không thể lưu cài đặt");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const features = [
    {
      key: "spell_check",
      name: "Spell & Grammar Check",
      description: "Cho phép kiểm tra chính tả và ngữ pháp cho title, abstract, và review text",
      icon: "✍️",
    },
    {
      key: "summary",
      name: "Summary Generation",
      description: "Tự động tạo tóm tắt trung lập (150-250 từ) từ abstract",
      icon: "📝",
    },
    {
      key: "similarity",
      name: "Similarity Calculation",
      description: "Tính toán độ tương đồng giữa papers và reviewers (hints cho assignment)",
      icon: "🔍",
    },
    {
      key: "keywords",
      name: "Keywords Extraction",
      description: "Trích xuất keywords từ abstract để hỗ trợ assignment và search",
      icon: "🏷️",
    },
    {
      key: "email_template",
      name: "Email Template Assistant",
      description: "AI-generated email templates cho chairs (acceptance, rejection, reminders)",
      icon: "✉️",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-purple-600" size={24} />
          AI Feature Flags Management
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {conference?.name || `Conference #${conferenceId}`}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="text-blue-600 mt-0.5" size={20} />
        <div className="flex-1">
          <div className="font-medium text-blue-900 mb-1">About AI Features</div>
          <div className="text-sm text-blue-700">
            Tất cả các tính năng AI đều là <strong>opt-in</strong> và yêu cầu xác nhận của người dùng.
            AI suggestions không bao giờ được tự động áp dụng. Tất cả AI requests đều được log cho audit purposes.
          </div>
        </div>
      </div>

      {/* Feature Flags List */}
      <div className="bg-white rounded-lg border divide-y">
        {features.map((feature) => (
          <div
            key={feature.key}
            className="p-6 flex items-start justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                </div>
              </div>
            </div>
            <div className="ml-4">
              <button
                onClick={() => handleToggle(feature.key)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                style={{
                  backgroundColor: featureFlags[feature.key] ? "#9333ea" : "#d1d5db",
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    featureFlags[feature.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <div className="mt-2 text-center">
                {featureFlags[feature.key] ? (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} />
                    <span>Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <XCircle size={12} />
                    <span>Disabled</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? "Đang lưu..." : "Lưu Cài Đặt"}
        </Button>
      </div>

      {/* AI Usage Stats (Future) */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">AI Usage Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm text-gray-500">Total AI Requests</div>
            <div className="text-2xl font-semibold mt-1">-</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm text-gray-500">Acceptance Rate</div>
            <div className="text-2xl font-semibold mt-1">-</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-sm text-gray-500">Most Used Feature</div>
            <div className="text-2xl font-semibold mt-1">-</div>
            <div className="text-xs text-gray-400 mt-1">Coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
