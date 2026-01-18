import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { toast } from "react-hot-toast";

export default function QuotaConfigPage() {
  const [form, setForm] = useState({
    max_submissions_per_user: "",
    max_reviews_per_reviewer: "",
    max_file_size_mb: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminService.getQuotas();
        setForm({
          max_submissions_per_user: data.max_submissions_per_user ?? "",
          max_reviews_per_reviewer: data.max_reviews_per_reviewer ?? "",
          max_file_size_mb: data.max_file_size_mb ?? "",
        });
      } catch (err) {
        toast.error("Không thể tải quota config");
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminService.updateQuotas({
        max_submissions_per_user: Number(form.max_submissions_per_user),
        max_reviews_per_reviewer: Number(form.max_reviews_per_reviewer),
        max_file_size_mb: Number(form.max_file_size_mb),
      });
      toast.success("Đã lưu quota config");
    } catch (err) {
      toast.error("Không thể lưu quota config");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">Quota Configuration</h2>
      <div className="space-y-4">
        <Input
          label="Max submissions per user"
          name="max_submissions_per_user"
          value={form.max_submissions_per_user}
          onChange={handleChange}
        />
        <Input
          label="Max reviews per reviewer"
          name="max_reviews_per_reviewer"
          value={form.max_reviews_per_reviewer}
          onChange={handleChange}
        />
        <Input
          label="Max file size (MB)"
          name="max_file_size_mb"
          value={form.max_file_size_mb}
          onChange={handleChange}
        />
      </div>
      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} loading={loading}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
