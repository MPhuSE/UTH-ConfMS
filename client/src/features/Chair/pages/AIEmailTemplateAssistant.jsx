import { useState } from "react";
import { useParams } from "react-router-dom";
import { aiService, emailTemplateService } from "../../../services";
import { toast } from "react-hot-toast";
import { Sparkles, Loader2, Save, X } from "lucide-react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";

/**
 * AI Email Template Assistant for Chairs
 * Generates email template drafts using AI
 */
export default function AIEmailTemplateAssistant({ onTemplateGenerated }) {
  const { conferenceId } = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    template_type: "notification",
    context: "",
  });
  const [generatedTemplate, setGeneratedTemplate] = useState(null);

  const handleGenerate = async () => {
    if (!formData.context.trim()) {
      toast.error("Vui lòng nhập context để tạo template");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await aiService.generateEmailTemplate({
        template_type: formData.template_type,
        context: formData.context,
        conference_id: parseInt(conferenceId),
      });
      
      setGeneratedTemplate(response);
      toast.success("Đã tạo email template thành công!");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Không thể tạo email template");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedTemplate) return;

    try {
      await emailTemplateService.create({
        conference_id: parseInt(conferenceId),
        name: `${formData.template_type} - AI Generated`,
        subject: generatedTemplate.subject || "",
        body: generatedTemplate.body || "",
        template_type: formData.template_type,
      });
      
      toast.success("Đã lưu email template");
      setShowModal(false);
      setGeneratedTemplate(null);
      setFormData({ template_type: "notification", context: "" });
      
      if (onTemplateGenerated) {
        onTemplateGenerated();
      }
    } catch (error) {
      toast.error("Không thể lưu email template");
      console.error(error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
      >
        <Sparkles size={16} />
        <span>AI Email Assistant</span>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setGeneratedTemplate(null);
          setFormData({ template_type: "notification", context: "" });
        }}
        title="AI Email Template Assistant"
        size="large"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type *
            </label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="notification">Notification</option>
              <option value="acceptance">Acceptance</option>
              <option value="rejection">Rejection</option>
              <option value="reminder">Reminder</option>
              <option value="invitation">Invitation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context *
            </label>
            <textarea
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              rows={5}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Mô tả nội dung email bạn muốn tạo, ví dụ: 'Thông báo kết quả chấp nhận bài báo với lời cảm ơn và thông tin về camera-ready deadline'"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mô tả chi tiết nội dung email bạn muốn tạo
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.context.trim()}
            className="w-full flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Đang tạo template...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Tạo Email Template</span>
              </>
            )}
          </Button>

          {generatedTemplate && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Template đã tạo</h3>
                <button
                  onClick={() => setGeneratedTemplate(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  value={generatedTemplate.subject || ""}
                  readOnly
                  className="bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body
                </label>
                <textarea
                  value={generatedTemplate.body || ""}
                  readOnly
                  rows={10}
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>Lưu Template</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setGeneratedTemplate(null);
                    setFormData({ template_type: "notification", context: "" });
                  }}
                  className="flex-1"
                >
                  Tạo lại
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
