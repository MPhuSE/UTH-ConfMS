from typing import Optional
from config import settings


class EmailTemplates:

    @staticmethod
    def verify_email(token: str) -> str:
        url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        return f"""
        <html>
            <body>
                <h2>Xác thực tài khoản</h2>
                <p>Cảm ơn bạn đã đăng ký hệ thống <b>UTH-ConfMS</b>.</p>
                <p>Nhấn nút bên dưới để xác thực email:</p>
                <p>
                    <a href="{url}"
                       style="padding:10px 16px;
                              background:#2563eb;
                              color:white;
                              text-decoration:none;
                              border-radius:6px;">
                        Xác thực tài khoản
                    </a>
                </p>
                <p>Link sẽ hết hạn sau 15 phút.</p>
            </body>
        </html>
        """

    @staticmethod
    def reset_password(token: str) -> str:
        url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        return f"""
        <html>
            <body>
                <h2>Đặt lại mật khẩu</h2>
                <p>Nhấn link bên dưới để đặt lại mật khẩu:</p>
                <a href="{url}">{url}</a>
            </body>
        </html>
        """

    @staticmethod
    def notification(content: str) -> str:
        return f"<p>{content}</p>"

    @staticmethod
    def _format_scores_section(avg_score: Optional[float], final_score: Optional[float]) -> str:
        """Helper method to format scores section in email."""
        if avg_score is None and final_score is None:
            return ""
        
        score_lines = []
        if avg_score is not None:
            score_lines.append(f'<p style="margin: 5px 0;"><strong>Điểm trung bình:</strong> {avg_score:.2f}</p>')
        if final_score is not None:
            score_lines.append(f'<p style="margin: 5px 0;"><strong>Điểm cuối cùng:</strong> <span style="color: #059669; font-weight: bold;">{final_score:.2f}</span></p>')
        
        if score_lines:
            return f'''
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                {''.join(score_lines)}
                            </div>
                            '''
        return ""

    @staticmethod
    def _format_reviews_section(reviews: Optional[list]) -> str:
        """Helper method to format reviews section in email."""
        if not reviews:
            return ""

        review_items = []
        for i, review in enumerate(reviews, 1):
            comment = review.get('comment', '').strip()
            strengths = review.get('strengths', '').strip()
            weaknesses = review.get('weaknesses', '').strip()

            if not any([comment, strengths, weaknesses]):
                continue

            review_content = f'<div style="background: white; border: 1px solid #e5e7eb; padding: 15px; margin-bottom: 10px; border-radius: 4px;">'
            review_content += f'<h4 style="margin: 0 0 10px 0; color: #4b5563;">Reviewer #{i}</h4>'
            
            if comment:
                review_content += f'<p style="margin: 5px 0;"><strong>Nhận xét chung:</strong><br>{comment}</p>'
            if strengths:
                review_content += f'<p style="margin: 5px 0;"><strong>Điểm mạnh:</strong><br>{strengths}</p>'
            if weaknesses:
                review_content += f'<p style="margin: 5px 0;"><strong>Điểm yếu:</strong><br>{weaknesses}</p>'
            
            review_content += '</div>'
            review_items.append(review_content)
        
        if review_items:
            return f'''
            <div style="margin-top: 20px;">
                <h3 style="color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Chi tiết đánh giá (Anonymous Reviews)</h3>
                <div style="background: #f9fafb; padding: 10px; border-radius: 4px;">
                    {''.join(review_items)}
                </div>
            </div>
            '''
        return ""

    @staticmethod
    def decision_notification(
        submission_title: str,
        decision: str,
        decision_notes: Optional[str] = None,
        conference_name: Optional[str] = None,
        avg_score: Optional[float] = None,
        final_score: Optional[float] = None,
        reviews: Optional[list] = None
    ) -> str:
        """Template email thông báo quyết định cho tác giả."""
        decision_labels = {
            "accepted": ("Chấp nhận", "green", "✅"),
            "rejected": ("Từ chối", "red", "❌"),
            "minor_revision": ("Sửa nhỏ", "orange", "⚠️"),
            "major_revision": ("Sửa lớn", "orange", "⚠️")
        }
        
        decision_info = decision_labels.get(decision.lower(), ("Quyết định", "gray", "📋"))
        label, color, icon = decision_info
        
        frontend_url = settings.FRONTEND_URL
        view_results_url = f"{frontend_url}/dashboard/results"
        
        return f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 800px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #2C7A7B 0%, #1A365D 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                    .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
                    .decision-box {{ background: white; border-left: 4px solid #{color}; padding: 20px; margin: 20px 0; border-radius: 4px; }}
                    .button {{ display: inline-block; padding: 12px 24px; background: #2C7A7B; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                    .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">UTH-ConfMS</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Thông báo quyết định bài nộp</p>
                    </div>
                    <div class="content">
                        <h2>Kính gửi Tác giả,</h2>
                        <p>Chúng tôi xin thông báo về quyết định đối với bài nộp của bạn:</p>
                        
                        <div class="decision-box">
                            <h3 style="margin-top: 0; display: flex; align-items: center; gap: 10px;">
                                {icon} <span>Quyết định: <strong>{label}</strong></span>
                            </h3>
                            <p style="margin: 10px 0;"><strong>Tiêu đề bài nộp:</strong> {submission_title}</p>
                            {f'<p style="margin: 10px 0;"><strong>Hội nghị:</strong> {conference_name}</p>' if conference_name else ''}
                            {EmailTemplates._format_scores_section(avg_score, final_score)}
                        </div>
                        
                        {f'<div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;"><p style="margin: 0;"><strong>Ghi chú từ Ban tổ chức:</strong></p><p style="margin: 10px 0 0 0;">{decision_notes}</p></div>' if decision_notes else ''}
                        
                        {EmailTemplates._format_reviews_section(reviews)}

                        <p>Bạn có thể xem chi tiết quyết định và reviews tại:</p>
                        <a href="{view_results_url}" class="button">Xem kết quả & Reviews</a>
                        
                        {f'<p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;"><strong>Lưu ý:</strong> Bài nộp của bạn cần được sửa đổi. Vui lòng xem chi tiết trong hệ thống và nộp lại bản đã sửa.</p>' if decision.lower() in ("minor_revision", "major_revision") else ''}
                    </div>
                    <div class="footer">
                        <p>Trân trọng,<br>Ban tổ chức UTH-ConfMS</p>
                        <p style="margin-top: 10px;">Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.</p>
                    </div>
                </div>
            </body>
        </html>
        """
