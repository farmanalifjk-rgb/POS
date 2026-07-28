/**
 * LoginPage.js — Login + OTP verification screen
 */
export function LoginPage() {
  return `
<div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">

  <!-- Animated background blobs -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
    <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
  </div>

  <div class="relative w-full max-w-md">

    <!-- Logo / Brand -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-lg mb-4">
        <i data-lucide="monitor-dot" class="w-8 h-8 text-white"></i>
      </div>
      <h1 class="text-2xl font-bold text-white">POS System</h1>
      <p class="text-slate-400 text-sm mt-1">Sign in to your workspace</p>
    </div>

    <!-- Login Card -->
    <div id="login-card" class="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-2xl">

      <!-- Error banner -->
      <div id="login-error" class="hidden mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm items-center gap-2">
        <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
        <span id="login-error-text"></span>
      </div>

      <!-- Login Form -->
      <div id="form-login">
        <h2 class="text-lg font-semibold text-white mb-6">Welcome back</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
            <div class="relative">
              <i data-lucide="user" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                class="w-full h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                onkeydown="if(event.key==='Enter') document.getElementById('login-password').focus()"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div class="relative">
              <i data-lucide="lock" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                class="w-full h-11 pl-10 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                onkeydown="if(event.key==='Enter') window.doLogin()"
              />
              <button type="button" onclick="window.togglePasswordVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                <i id="pw-eye" data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>

        <button
          onclick="window.doLogin()"
          id="login-btn"
          class="mt-6 w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <i data-lucide="log-in" class="w-4 h-4"></i>
          Sign In
        </button>
      </div>

      <!-- OTP Form (hidden until needed) -->
      <div id="form-otp" class="hidden">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 mb-3">
            <i data-lucide="shield-check" class="w-6 h-6 text-indigo-400"></i>
          </div>
          <h2 class="text-lg font-semibold text-white">Two-Factor Verification</h2>
          <p class="text-sm text-slate-400 mt-1">Enter the 6-digit code sent to your email/phone</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Verification Code</label>
          <input
            id="otp-code"
            type="text"
            placeholder="000000"
            maxlength="6"
            class="w-full h-14 text-center text-2xl font-bold tracking-[0.4em] bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            onkeydown="if(event.key==='Enter') window.doVerifyOtp()"
          />
        </div>

        <button
          onclick="window.doVerifyOtp()"
          id="otp-btn"
          class="mt-4 w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          Verify Code
        </button>

        <div class="mt-4 flex items-center justify-between text-sm">
          <button onclick="window.goBackToLogin()" class="text-slate-400 hover:text-white transition flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back
          </button>
          <button onclick="window.doResendOtp()" class="text-indigo-400 hover:text-indigo-300 transition">Resend code</button>
        </div>
      </div>

    </div>

    <p class="text-center text-slate-600 text-xs mt-6">
      Point of Sale Management System
    </p>
  </div>
</div>
`;
}
