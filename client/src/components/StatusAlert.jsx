import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, Clock, Lock } from "lucide-react";

/**
 * StatusAlert Component
 * Hiển thị thông báo trạng thái khi không thể thao tác hoặc cần lưu ý
 * 
 * @param {string} type - "error" | "warning" | "info" | "success"
 * @param {string} title - Tiêu đề thông báo
 * @param {string|ReactNode} message - Nội dung thông báo
 * @param {boolean} showIcon - Hiển thị icon (default: true)
 * @param {string} className - CSS classes bổ sung
 */
export default function StatusAlert({
  type = "info",
  title,
  message,
  showIcon = true,
  className = "",
}) {
  const config = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: XCircle,
      iconColor: "text-red-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: AlertCircle,
      iconColor: "text-yellow-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: Info,
      iconColor: "text-blue-600",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: CheckCircle,
      iconColor: "text-green-600",
    },
    deadline: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      icon: Clock,
      iconColor: "text-orange-600",
    },
    locked: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      icon: Lock,
      iconColor: "text-gray-600",
    },
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      {showIcon && (
        <Icon className={`w-5 h-5 ${style.iconColor} mt-0.5 flex-shrink-0`} />
      )}
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold text-sm mb-1 ${style.text}`}>
            {title}
          </h4>
        )}
        {message && (
          <p className={`text-sm ${style.text} ${title ? "opacity-90" : ""}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
