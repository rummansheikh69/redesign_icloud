import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createSocket, setConfiguredOrigin } from "../lib/socket";
import { FiPower, FiSlash, FiPlus, FiTrash2, FiSend, FiMapPin, FiLink } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import AdminAtmosphere from "../components/AdminAtmosphere";

const COUNTRIES = [
  ["DE", "Germany"],
  ["AT", "Austria"],
  ["CH", "Switzerland"],
  ["NL", "Netherlands"],
  ["BE", "Belgium"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["PT", "Portugal"],
  ["GB", "United Kingdom"],
  ["IE", "Ireland"],
  ["PL", "Poland"],
  ["CZ", "Czechia"],
  ["SK", "Slovakia"],
  ["HU", "Hungary"],
  ["RO", "Romania"],
  ["BG", "Bulgaria"],
  ["GR", "Greece"],
  ["SE", "Sweden"],
  ["NO", "Norway"],
  ["DK", "Denmark"],
  ["FI", "Finland"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["TR", "Turkey"],
  ["UA", "Ukraine"],
  ["RU", "Russia"],
  ["SA", "Saudi Arabia"],
  ["AE", "United Arab Emirates"],
];

function Settings() {
  const queryClient = useQueryClient();
  const [banIp, setBanIp] = useState("");
  const [banNote, setBanNote] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [botToken, setBotToken] = useState("");
  const [domainInput, setDomainInput] = useState("");

  const { data: siteStatus, isLoading } = useQuery({
    queryKey: ["siteStatus"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load status");
      return data;
    },
    retry: false,
  });

  const online = Boolean(siteStatus?.online);

  const { data: domainData } = useQuery({
    queryKey: ["siteDomain"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/domain");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load domain");
      return data;
    },
  });

  useEffect(() => {
    if (domainData?.domain != null) setDomainInput(domainData.domain || "");
  }, [domainData]);

  const { mutate: saveDomain, isPending: savingDomain } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/site/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ domain: domainInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save domain");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["siteDomain"], data);
      setConfiguredOrigin(data.domain || "");
      toast.success(data.domain ? `Domain saved: ${data.domain}` : "Domain cleared");
    },
    onError: (err) => toast.error(err.message || "Save failed"),
  });

  const { mutate: setOnline, isPending } = useMutation({
    mutationFn: async (nextOnline) => {
      const res = await fetch("/api/v1/rumman/site/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: nextOnline }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update status");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["siteStatus"], data);
      toast.success(data.online ? "Page is Online" : "Page is Offline");
    },
    onError: (err) => toast.error(err.message || "Update failed"),
  });

  const { data: bans = [], isLoading: bansLoading } = useQuery({
    queryKey: ["bans"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/bans");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load bans");
      return data;
    },
  });

  const { mutate: addBan, isPending: addingBan } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/bans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: banIp.trim(), note: banNote.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not ban IP");
      return data;
    },
    onSuccess: () => {
      setBanIp("");
      setBanNote("");
      queryClient.invalidateQueries({ queryKey: ["bans"] });
      toast.success("IP banned");
    },
    onError: (err) => toast.error(err.message || "Ban failed"),
  });

  const { mutate: removeBan, isPending: removingBan } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/v1/rumman/bans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove ban");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bans"] });
      toast.success("Ban removed");
    },
    onError: (err) => toast.error(err.message || "Remove failed"),
  });

  const { data: countryData } = useQuery({
    queryKey: ["allowedCountries"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/countries", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load countries");
      return data;
    },
  });
  const selectedCountries = countryData?.countries || [];

  const { mutate: saveCountries, isPending: savingCountries } = useMutation({
    mutationFn: async (countries) => {
      const res = await fetch("/api/v1/rumman/site/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ countries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save countries");
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["allowedCountries"], data);
      toast.success(
        data.countries?.length
          ? `Allowed: ${data.countries.join(", ")}`
          : "All countries allowed"
      );
    },
    onError: (err) => toast.error(err.message || "Save failed"),
  });

  const toggleCountry = (code) => {
    const next = selectedCountries.includes(code)
      ? selectedCountries.filter((c) => c !== code)
      : [...selectedCountries, code];
    saveCountries(next);
  };

  const { data: telegram } = useQuery({
    queryKey: ["telegramBot"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/telegram", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load telegram");
      return data;
    },
  });

  const { mutate: saveTelegram, isPending: savingTelegram } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/site/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: botToken.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save token");
      return data;
    },
    onSuccess: () => {
      setBotToken("");
      queryClient.invalidateQueries({ queryKey: ["telegramBot"] });
      toast.success("Telegram bot connected");
    },
    onError: (err) => toast.error(err.message || "Save failed"),
  });

  const { mutate: clearTelegram, isPending: clearingTelegram } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/rumman/site/telegram", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not remove token");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegramBot"] });
      toast.success("Telegram bot removed");
    },
    onError: (err) => toast.error(err.message || "Remove failed"),
  });

  useEffect(() => {
    const socket = createSocket();
    socket.on("site_status_changed", (payload) => {
      queryClient.setQueryData(["siteStatus"], payload);
    });
    socket.on("bans_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["bans"] });
    });
    return () => socket.close();
  }, [queryClient]);

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <AdminAtmosphere />
      <Sidebar />
      <div className="relative z-10 ml-64 min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07070a]/55 backdrop-blur-xl px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">toggle</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Page, domain, access & alerts
          </p>
        </header>

        <div className="p-6 max-w-5xl space-y-4">
          {/* Top: availability + domain */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0">
                  <FiPower className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {isLoading ? "Loading…" : online ? "Page online" : "Page offline"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    {online
                      ? "Live and accepting visitors"
                      : "Redirects to icloud.com"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={online}
                disabled={isLoading || isPending}
                onClick={() => setOnline(!online)}
                className={`relative h-8 w-[52px] shrink-0 rounded-full transition disabled:opacity-50 ${
                  online
                    ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : "bg-zinc-700"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    online ? "translate-x-[20px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <form
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                saveDomain();
              }}
            >
              <div className="flex items-center gap-3 shrink-0 min-w-0 sm:w-[140px]">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center shrink-0">
                  <FiLink className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Domain</p>
                  <p className="text-[11px] text-zinc-500 truncate">Cloudflare</p>
                </div>
              </div>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="https://your-domain.com"
                autoComplete="off"
                spellCheck="false"
                className="flex-1 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-400/40"
              />
              <button
                type="submit"
                disabled={savingDomain}
                className="shrink-0 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium px-4 py-2.5 transition disabled:opacity-50"
              >
                {savingDomain ? "…" : "Save"}
              </button>
            </form>
          </div>

          {/* Middle: countries + telegram */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden flex flex-col min-h-[320px]">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center shrink-0">
                    <FiMapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Countries</p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {selectedCountries.length
                        ? selectedCountries.join(", ")
                        : "All allowed"}
                    </p>
                  </div>
                </div>
                {selectedCountries.length > 0 && (
                  <button
                    type="button"
                    disabled={savingCountries}
                    onClick={() => saveCountries([])}
                    className="text-[11px] text-zinc-400 hover:text-white shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="px-4 py-3 flex-1 flex flex-col gap-2 min-h-0">
                <input
                  value={countryQuery}
                  onChange={(e) => setCountryQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/40"
                />
                <div className="flex-1 max-h-[240px] overflow-y-auto rounded-lg border border-white/5 divide-y divide-white/5">
                  {COUNTRIES.filter(([code, name]) => {
                    const q = countryQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      code.toLowerCase().includes(q) ||
                      name.toLowerCase().includes(q)
                    );
                  }).map(([code, name]) => {
                    const on = selectedCountries.includes(code);
                    return (
                      <button
                        key={code}
                        type="button"
                        disabled={savingCountries}
                        onClick={() => toggleCountry(code)}
                        className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/5 disabled:opacity-50"
                      >
                        <img
                          src={`https://flagcdn.com/20x15/${code.toLowerCase()}.png`}
                          alt=""
                          className="w-[18px] h-[13px] rounded-[2px] object-cover"
                        />
                        <span className="flex-1 text-[13px] truncate">{name}</span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {code}
                        </span>
                        <span
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            on
                              ? "bg-emerald-500 border-emerald-400"
                              : "border-white/20"
                          }`}
                        >
                          {on ? (
                            <span className="text-[9px] text-black font-bold">✓</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden flex flex-col min-h-[320px]">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-300 flex items-center justify-center shrink-0">
                  <FiSend className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Telegram</p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {telegram?.configured
                      ? `Connected · ${telegram.preview}`
                      : "/online · /offline · /status"}
                  </p>
                </div>
              </div>
              <form
                className="px-5 py-4 flex-1 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (botToken.trim()) saveTelegram();
                }}
              >
                <p className="text-[12px] text-zinc-500 leading-relaxed">
                  Token from @BotFather. Commands control page on/off.
                </p>
                <input
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456:ABC-DEF…"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-sky-400/40"
                />
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={!botToken.trim() || savingTelegram}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500/90 hover:bg-sky-500 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50 transition"
                  >
                    <FiSend className="w-4 h-4" />
                    {savingTelegram ? "Saving…" : "Save token"}
                  </button>
                  {telegram?.configured ? (
                    <button
                      type="button"
                      disabled={clearingTelegram}
                      onClick={() => clearTelegram()}
                      className="text-[12px] text-rose-400 hover:text-rose-300"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>

          {/* Bottom: IP bans full width, compact */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-300 flex items-center justify-center shrink-0">
                <FiSlash className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">IP bans</p>
                <p className="text-[11px] text-zinc-500">
                  Banned IPs redirect to icloud.com
                </p>
              </div>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 border-b border-white/5">
              <input
                value={banIp}
                onChange={(e) => setBanIp(e.target.value)}
                placeholder="IP (e.g. 1.2.3.4)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-rose-400/40"
              />
              <input
                value={banNote}
                onChange={(e) => setBanNote(e.target.value)}
                placeholder="Note (optional)"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-rose-400/40"
              />
              <button
                type="button"
                disabled={!banIp.trim() || addingBan}
                onClick={() => banIp.trim() && addBan()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500/90 hover:bg-rose-500 px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition"
              >
                <FiPlus className="w-4 h-4" />
                Ban
              </button>
            </div>

            <div className="px-5 py-2">
              {bansLoading ? (
                <p className="text-xs text-zinc-500 py-3">Loading bans…</p>
              ) : !bans.length ? (
                <p className="text-xs text-zinc-500 py-3">No banned IPs yet.</p>
              ) : (
                <ul className="divide-y divide-white/5 max-h-[200px] overflow-y-auto">
                  {bans.map((ban) => (
                    <li
                      key={ban._id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium font-mono truncate">
                          {ban.ipAddress}
                        </p>
                        {ban.note ? (
                          <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                            {ban.note}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        disabled={removingBan}
                        onClick={() => removeBan(ban._id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove ban"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
