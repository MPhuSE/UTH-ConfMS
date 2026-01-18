import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { toast } from "react-hot-toast";

export default function SmtpConfigPage() {
  const [form, setForm] = useState({
    host: "",
    port: "",
    user: "",
    password: "",
    from_email: "",
    from_name: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminService.getSMTPConfig();
        setForm({
          host: data.host || "",
          port: data.port || "",
          user: data.user || "",
          password: "",
          from_email: data.from_email || "",
          from_name: data.from_name || "",
        });
      } catch (err) {
        toast.error("Không thể tải SMTP config");
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
      await adminService.updateSMTPConfig({
        host: form.host,
        port: Number(form.port),
        user: form.user,
        password: form.password,
        from_email: form.from_email,
        from_name: form.from_name,
      });
      toast.success("Đã lưu SMTP config");
    } catch (err) {
      toast.error("Không thể lưu SMTP config");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6">SMTP Configuration</h2>
      <div className="space-y-4">
        <Input label="SMTP Host" name="host" value={form.host} onChange={handleChange} />
        <Input label="Port" name="port" value={form.port} onChange={handleChange} />
        <Input label="Username" name="user" value={form.user} onChange={handleChange} />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <Input label="From Email" name="from_email" value={form.from_email} onChange={handleChange} />
        <Input label="From Name" name="from_name" value={form.from_name} onChange={handleChange} />
      </div>
      <div className="flex gap-3 mt-6">
        <Button onClick={handleSave} loading={loading}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
