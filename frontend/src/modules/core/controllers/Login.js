/**
 * Login.js — Controller for LoginPage.js
 * Wires up Auth.login(), Auth.verifyOtp(), OTP resend.
 */
import Auth from "./Auth.js";
import { createIcons, icons } from "lucide";

let _otpToken = null;

window.initializeLogin = function () {
  createIcons({ icons });
  // Auto-focus username
  setTimeout(() => document.getElementById("login-username")?.focus(), 100);
};

window.doLogin = async function () {
  const username = document.getElementById("login-username")?.value.trim();
  const password = document.getElementById("login-password")?.value;

  if (!username || !password) {
    showLoginError("Please enter your username and password.");
    return;
  }

  setBtnLoading("login-btn", true, "Signing in…");
  hideLoginError();

  const result = await Auth.login(username, password);

  setBtnLoading("login-btn", false, `<i data-lucide="log-in" class="w-4 h-4"></i> Sign In`);

  if (!result.ok) {
    showLoginError(result.error);
    return;
  }

  if (result.requires_otp) {
    _otpToken = result.otp_token;
    showOtpForm();
    return;
  }

  // Logged in successfully
  window.location.hash = "#/dashboard";
  window.dispatchEvent(new Event("hashchange"));
};

window.doVerifyOtp = async function () {
  const code = document.getElementById("otp-code")?.value.trim();
  if (!code || code.length < 6) {
    showLoginError("Enter the 6-digit code.");
    return;
  }

  setBtnLoading("otp-btn", true, "Verifying…");
  hideLoginError();

  const result = await Auth.verifyOtp(_otpToken, code);

  setBtnLoading("otp-btn", false, `<i data-lucide="check-circle" class="w-4 h-4"></i> Verify Code`);

  if (!result.ok) {
    showLoginError(result.error);
    return;
  }

  window.location.hash = "#/dashboard";
  window.dispatchEvent(new Event("hashchange"));
};

window.doResendOtp = async function () {
  if (!_otpToken) return;
  const sent = await Auth.resendOtp(_otpToken);
  showLoginError(sent ? "Code resent successfully." : "Failed to resend. Try logging in again.", sent);
};

window.goBackToLogin = function () {
  _otpToken = null;
  document.getElementById("form-otp").classList.add("hidden");
  document.getElementById("form-login").classList.remove("hidden");
  hideLoginError();
};

window.togglePasswordVisibility = function () {
  const pw = document.getElementById("login-password");
  const eye = document.getElementById("pw-eye");
  if (!pw) return;
  const isHidden = pw.type === "password";
  pw.type = isHidden ? "text" : "password";
  if (eye) {
    eye.setAttribute("data-lucide", isHidden ? "eye-off" : "eye");
    createIcons({ icons });
  }
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function showOtpForm() {
  document.getElementById("form-login").classList.add("hidden");
  document.getElementById("form-otp").classList.remove("hidden");
  hideLoginError();
  createIcons({ icons });
  setTimeout(() => document.getElementById("otp-code")?.focus(), 100);
}

function showLoginError(msg, isSuccess = false) {
  const banner = document.getElementById("login-error");
  const text   = document.getElementById("login-error-text");
  if (!banner || !text) return;
  text.textContent = msg;
  banner.className = `mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
    isSuccess
      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
      : "bg-red-500/20 border border-red-500/30 text-red-300"
  }`;
  banner.classList.remove("hidden");
}

function hideLoginError() {
  document.getElementById("login-error")?.classList.add("hidden");
}

function setBtnLoading(id, loading, label) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>`
    : label;
  if (!loading) createIcons({ icons });
}
