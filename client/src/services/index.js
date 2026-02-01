/**
 * Services Index
 * Central export point for all API services
 */

import authService from "./authService";
import conferenceService from "./conferenceService";
import userService from "./userService";
import submissionService from "./submissionService";
import reviewService from "./reviewService";
import decisionService from "./decisionService";
import adminService from "./adminService";
import trackService from "./trackService";
import auditLogService from "./auditLogService";
import cameraReadyService from "./cameraReadyService";
import reportsService from "./reportsService";
import emailTemplateService from "./emailTemplateService";
import aiService from "./aiService";
import scheduleService from "./scheduleService";
import notificationService from "./notificationService";
import tenantService from "./tenantService";
import reviewQuestionService from "./reviewQuestionService";

// Named exports
export {
  authService,
  conferenceService,
  userService,
  submissionService,
  reviewService,
  decisionService,
  adminService,
  trackService,
  auditLogService,
  cameraReadyService,
  reportsService,
  emailTemplateService,
  aiService,
  scheduleService,
  notificationService,
  tenantService,
  reviewQuestionService,
};

// Default export with all services
const services = {
  authService,
  conferenceService,
  userService,
  submissionService,
  reviewService,
  decisionService,
  adminService,
  trackService,
  auditLogService,
  cameraReadyService,
  reportsService,
  emailTemplateService,
  aiService,
  scheduleService,
  notificationService,
  tenantService,
  reviewQuestionService,
};

export default services;