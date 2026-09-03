import { NavLink } from "react-router-dom";
import { HiOutlineViewGrid, HiOutlineCog } from "react-icons/hi";
import { FiCloud, FiLock, FiFileText } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";

function Sidebar() {
  const { data: siteStatus } = useQuery({
    queryKey: ["siteStatus"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      return data;
    },
    refetchInterval: 15000,
  });

  const online = siteStatus?.online !== false;

  return (
    <>
    <aside className="w-64 h-screen fixed left-0 top-0 z-30 text-white border-r border-white/5 flex flex-col bg-[#0b0b0f]/80 backdrop-blur-xl">
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.35)]">
            <FiCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">iCloud Panel</p>
            <p className="text-[11px] text-zinc-500">Control Center</p>
          </div>
        </div>
      </div>

      <nav className="px-3 mt-2 flex flex-col gap-1">
        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`
          }
          to="/admin/dashboard"
        >
          <HiOutlineViewGrid className="w-4 h-4" />
          Sessions
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`
          }
          to="/admin/toggle"
        >
          <HiOutlineCog className="w-4 h-4" />
          toggle
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`
          }
          to="/admin/documents"
        >
          <FiFileText className="w-4 h-4" />
          documents
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              isActive
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`
          }
          to="/admin/settings"
        >
          <FiLock className="w-4 h-4" />
          settings
        </NavLink>
      </nav>

      <div className="mt-auto p-4 space-y-3">
        <div
          className={`relative overflow-hidden rounded-lg px-2.5 py-2 ${
            online
              ? "border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent"
              : "border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.12] via-amber-500/[0.04] to-transparent"
          }`}
        >
          <div className="relative flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
              {online ? (
                <>
                  <span className="status-dot-ring absolute inset-0 rounded-full bg-emerald-400/35" />
                  <span className="status-dot-online relative block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </>
              ) : (
                <span className="status-dot-offline relative block h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1.5">
                <p className="text-[10px] font-medium tracking-wide text-zinc-200">
                  Page status
                </p>
                <span
                  className={`text-[8px] font-semibold uppercase tracking-[0.1em] ${
                    online ? "text-emerald-300" : "text-amber-300"
                  }`}
                >
                  {online ? "Online" : "Offline"}
                </span>
              </div>
              <p className="mt-0.5 text-[9px] leading-snug text-zinc-500">
                {online
                  ? "Site is live and reachable"
                  : "Site appears offline right now"}
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span className="text-[10px] leading-none text-zinc-400">
            Logged in as <span className="text-rose-400 font-medium">admin</span>
          </span>
        </div>
      </div>
    </aside>
    </>
  );
}

export default Sidebar;
