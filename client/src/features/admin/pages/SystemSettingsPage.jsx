import React, { useEffect, useState } from "react";
import {
    Mail,
    Shield,
    Database,
    Send,
    RefreshCw,
    Save,
    AlertCircle,
    CheckCircle2,
    Trello,
    Settings,
    HardDrive
} from "lucide-react";
import { adminService } from "../../../services/adminService";
import { toast } from "react-hot-toast";

const SystemSettingsPage = () => {
    const [activeTab, setActiveTab] = useState("smtp");
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [config, setConfig] = useState({
        smtp: {
            smtp_host: "",
            smtp_port: 587,
            smtp_user: "",
            smtp_password: "",
            smtp_from_email: "",
            smtp_from_name: "",
            mail_quota_daily: 500,
            mail_sent_today: 0,
            last_quota_reset: null,
            frontend_url: ""
        },
        quotas: {
            max_submissions_per_user: 10,
            max_reviews_per_reviewer: 20,
            max_file_size_mb: 10
        }
    });

    const [testEmail, setTestEmail] = useState("");

    useEffect(() => {
        loadAllConfig();
    }, []);

    const loadAllConfig = async () => {
        setLoading(true);
        try {
            const smtpRes = await adminService.getSMTPConfig();
            const quotaRes = await adminService.getQuotas();

            setConfig({
                smtp: {
                    ...smtpRes,
                    smtp_password: "" // Don't show password
                },
                quotas: quotaRes
            });
        } catch (err) {
            console.error("Error loading config:", err);
            toast.error("Không thể tải cấu hình hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleSmtpChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            smtp: { ...prev.smtp, [name]: value }
        }));
    };

    const handleQuotaChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            quotas: { ...prev.quotas, [name]: Number(value) }
        }));
    };

    const saveSmtpConfig = async () => {
        setLoading(true);
        try {
            await adminService.updateSMTPConfig(config.smtp);
            toast.success("Đã cập nhật cấu hình SMTP");
            loadAllConfig(); // Reload to get updated quota status
        } catch (err) {
            toast.error("Lỗi khi lưu cấu hình SMTP");
        } finally {
            setLoading(false);
        }
    };

    const saveQuotaConfig = async () => {
        setLoading(true);
        try {
            await adminService.updateQuotas(config.quotas);
            toast.success("Đã cập nhật hạn mức hệ thống");
        } catch (err) {
            toast.error("Lỗi khi lưu hạn mức");
        } finally {
            setLoading(false);
        }
    };

    const testSmtp = async () => {
        if (!testEmail) {
            toast.error("Vui lòng nhập email người nhận để test");
            return;
        }
        setTesting(true);
        try {
            await adminService.testSMTPConfig({ to_email: testEmail });
            toast.success("Email test đã được gửi!");
        } catch (err) {
            toast.error("Gửi email test thất bại. Kiểm tra logs hoặc cấu hình.");
        } finally {
            setTesting(false);
        }
    };

    const quotaPercentage = Math.min(100, (config.smtp.mail_sent_today / (config.smtp.mail_quota_daily || 500)) * 100);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Settings className="w-8 h-8 text-[#1A365D]" />
                    Cấu hình Hệ thống
                </h1>
                <p className="text-gray-600 mt-2">Quản lý hạ tầng, bảo mật và hạn mức vận hành</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {[
                        { id: "smtp", label: "Cấu hình Email & Quota", icon: Mail },
                        { id: "quotas", label: "Hạn mức Hệ thống", icon: Database },
                        { id: "security", label: "Bảo mật & SSO", icon: Shield },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id
                                ? "bg-[#1A365D] text-white shadow-lg shadow-[#1A365D]/20 mt-2"
                                : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {activeTab === "smtp" && (
                            <div className="p-8 space-y-8">
                                {/* Mail Quota Card */}
                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-blue-900 flex items-center gap-2">
                                            <Send className="w-5 h-5" />
                                            Hạn mức Gửi Email Hàng ngày
                                        </h3>
                                        <span className="text-sm font-medium text-blue-700">
                                            {config.smtp.mail_sent_today} / {config.smtp.mail_quota_daily} (Gửi hôm nay)
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${quotaPercentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                                            style={{ width: `${quotaPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Hạn mức sẽ tự động reset vào lúc 00:00 hàng ngày (UTC).
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">SMTP Host</label>
                                        <input
                                            name="smtp_host"
                                            value={config.smtp.smtp_host}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="smtp.gmail.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">SMTP Port</label>
                                        <input
                                            name="smtp_port"
                                            type="number"
                                            value={config.smtp.smtp_port}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="587"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Username / Client ID</label>
                                        <input
                                            name="smtp_user"
                                            value={config.smtp.smtp_user}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Password / Secret</label>
                                        <input
                                            name="smtp_password"
                                            type="password"
                                            value={config.smtp.smtp_password}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">From Email</label>
                                        <input
                                            name="smtp_from_email"
                                            value={config.smtp.smtp_from_email}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">From Name (Display)</label>
                                        <input
                                            name="smtp_from_name"
                                            value={config.smtp.smtp_from_name}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Frontend URL (Lưu ý: Không có dấu / ở cuối)</label>
                                        <input
                                            name="frontend_url"
                                            value={config.smtp.frontend_url}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="http://localhost:5173"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="email"
                                            value={testEmail}
                                            onChange={(e) => setTestEmail(e.target.value)}
                                            placeholder="Email nhận test"
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                                        />
                                        <button
                                            onClick={testSmtp}
                                            disabled={testing}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Gửi Test
                                        </button>
                                    </div>
                                    <button
                                        onClick={saveSmtpConfig}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu SMTP
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "quotas" && (
                            <div className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Trello className="w-5 h-5 text-purple-500" />
                                            Giới hạn Nộp bài
                                        </h3>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Số bài báo tối đa mỗi người dùng</label>
                                            <input
                                                name="max_submissions_per_user"
                                                type="number"
                                                value={config.quotas.max_submissions_per_user}
                                                onChange={handleQuotaChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            Giới hạn Phản biện
                                        </h3>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Số bài phản biện tối đa mỗi reviewer</label>
                                            <input
                                                name="max_reviews_per_reviewer"
                                                type="number"
                                                value={config.quotas.max_reviews_per_reviewer}
                                                onChange={handleQuotaChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <HardDrive className="w-5 h-5 text-orange-500" />
                                            Giới hạn File
                                        </h3>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-600">Dung lượng file tối đa (MB)</label>
                                            <input
                                                name="max_file_size_mb"
                                                type="number"
                                                value={config.quotas.max_file_size_mb}
                                                onChange={handleQuotaChange}
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={saveQuotaConfig}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1A365D] text-white rounded-lg font-bold hover:bg-[#2C5282] transition-all shadow-md"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu Hạn mức
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="p-8 space-y-8">
                                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 flex gap-4">
                                    <Shield className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800">Cấu hình SSO (Google OAuth)</h4>
                                        <p className="text-sm text-yellow-700 mt-1">
                                            Cấu hình này thay thế các giá trị trong file .env nếu được thiết lập.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Google Client ID</label>
                                        <input
                                            name="google_client_id"
                                            value={config.smtp.google_client_id || ""}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="xxxxx.apps.googleusercontent.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Google Client Secret</label>
                                        <input
                                            name="google_client_secret"
                                            type="password"
                                            value={config.smtp.google_client_secret || ""}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Google Redirect URI</label>
                                        <input
                                            name="google_redirect_uri"
                                            value={config.smtp.google_redirect_uri || ""}
                                            onChange={handleSmtpChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            placeholder="http://localhost:5173/auth/google/callback"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={saveSmtpConfig}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1A365D] text-white rounded-lg font-bold hover:bg-[#2C5282] transition-all shadow-md"
                                    >
                                        <Save className="w-4 h-4" />
                                        Lưu Cấu hình SSO
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsPage;
