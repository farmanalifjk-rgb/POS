import authService from "../../../js/services/auth.service.js";
import apiService from "../../../js/services/api.service.js";

export const API_BASE_URL = apiService.baseURL;

window.Auth = authService;
export default authService;
