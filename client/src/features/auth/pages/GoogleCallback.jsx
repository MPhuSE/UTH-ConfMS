import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../app/store/useAuthStore";

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = searchParams.get("code");
        if (!code) {
            setError("No authorization code found");
            return;
        }

        const authenticate = async () => {
            try {
                const res = await api.get(`/auth/sso/google/callback?code=${code}`);
                const { access_token, refresh_token, user } = res.data;

                if (access_token) {
                    const { setAuthState } = useAuthStore.getState();
                    setAuthState({ user, access_token, refresh_token });

                    // Redirect to dashboard using window.location to ensure state is clear
                    window.location.href = "/dashboard";
                } else {
                    setError("Failed to retrieve access token");
                }
            } catch (err) {
                console.error("SSO Error:", err);
                setError(err.response?.data?.detail || "Authentication failed");
            }
        };

        authenticate();
    }, [searchParams, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                {!error ? (
                    <>
                        <div className="relative w-16 h-16 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đang xác thực...</h2>
                        <p className="text-gray-500">Đang kết nối an toàn với Google</p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">!</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập thất bại</h2>
                        <p className="text-red-500 mb-8 px-4">{error}</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Quay lại trang Đăng nhập
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default GoogleCallback;
