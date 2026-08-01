/**
 * hr.service.js — Service layer for Employees, Attendance, Shifts, Leave, and Payroll
 */
import apiService from "./api.service.js";

class HrService {
  async getEmployees() {
    return apiService.get("/hr/employees/");
  }

  async createEmployee(data) {
    return apiService.post("/hr/employees/", data);
  }

  async getAttendance() {
    return apiService.get("/hr/attendance/");
  }

  async getShifts() {
    return apiService.get("/hr/shifts/");
  }

  async getLeaveRequests() {
    return apiService.get("/hr/leave/");
  }

  async getPayroll() {
    return apiService.get("/hr/payroll/");
  }
}

export const hrService = new HrService();
export default hrService;
