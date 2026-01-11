import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export default function Alert({ type = "info", title, message, onClose }) {
  const configs = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: CheckCircle,
      iconColor: "text-green-400",
      titleColor: "text-green-800",
      textColor: "text-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: XCircle,
      iconColor: "text-red-400",
      titleColor: "text-red-800",
      textColor: "text-red-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: AlertCircle,
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: Info,
      iconColor: "text-blue-400",
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`rounded-md p-4 ${config.bg} ${config.border} border`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleColor}`}>{title}</h3>
          )}
          {message && (
            <div className={`mt-2 text-sm ${config.textColor}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex ${config.textColor} hover:opacity-75`}
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}