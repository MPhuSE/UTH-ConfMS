import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from infrastructure.databases.postgres import test_connection
from api.controllers import (
    auth_controller, user_controller, audit_log_controller, 
    conference_controller, submission_controller, review_controller,
    track_controller, decision_controller, camera_ready_controller,
    reports_controller, email_template_controller, ai_controller,
    admin_controller, schedule_controller, notification_controller,
    tenant_controller, pc_controller,
    discussion_controller, rebuttal_controller, proceedings_controller,
    role_controller
)

from infrastructure.models import (
    user_model,
    submission_model,  
    conference_model,
    review_model,
    audit_log_model,
    system_model,
    tenant_model,
    pc_model,
    discussion_model,
    rebuttal_model
)


# Cấu hình logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(title="UTH-ConfMS API")




@app.on_event("startup")
async def on_startup():
    await test_connection()

# CORS MUST be added FIRST (will execute LAST) to wrap all responses including errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

from api.middleware.last_login_middleware import LastLoginMiddleware
from api.middleware.jwt_middleware import JWTAuthMiddleware

# JWT Authentication Middleware - xác thực JWT và gắn user vào request state
app.add_middleware(JWTAuthMiddleware)

# Last Login Middleware - cập nhật last_login khi user đăng nhập
app.add_middleware(LastLoginMiddleware)



#router

app.include_router(auth_controller.router)
app.include_router(user_controller.router)
app.include_router(audit_log_controller.router)
app.include_router(conference_controller.router)
app.include_router(submission_controller.router)
app.include_router(review_controller.router)
app.include_router(track_controller.router)
app.include_router(decision_controller.router)
app.include_router(camera_ready_controller.router)
app.include_router(reports_controller.router)
app.include_router(email_template_controller.router)
app.include_router(ai_controller.router)
app.include_router(admin_controller.router)
app.include_router(schedule_controller.router)
app.include_router(notification_controller.router)
app.include_router(tenant_controller.router)
app.include_router(pc_controller.router)
app.include_router(discussion_controller.router)
app.include_router(rebuttal_controller.router)
app.include_router(proceedings_controller.router)
app.include_router(role_controller.router)



@app.get("/")
def root():
    return {"message": "Hello World"}
