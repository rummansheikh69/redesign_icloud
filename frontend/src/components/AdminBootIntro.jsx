import { AnimatePresence, motion } from "framer-motion";
import { FiCloud } from "react-icons/fi";

/**
 * Cinematic boot overlay for the admin dashboard.
 */
function AdminBootIntro({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="admin-boot"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#07070a]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          {/* soft orbs */}
          <motion.div
            className="absolute -top-24 left-1/4 h-[380px] w-[380px] rounded-full blur-[100px]"
            style={{ background: "rgba(56,189,248,0.28)" }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.55, scale: 1 }}
            transition={{ duration: 0.9 }}
          />
          <motion.div
            className="absolute -bottom-32 right-1/5 h-[420px] w-[420px] rounded-full blur-[110px]"
            style={{ background: "rgba(37,99,235,0.22)" }}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
          />

          {/* grid */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage:
                "radial-gradient(ellipse at center, black 25%, transparent 72%)",
            }}
          />

          {/* scan sweep */}
          <motion.div
            className="absolute inset-x-0 h-24 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(125,211,252,0.12), transparent)",
            }}
            initial={{ top: "-20%" }}
            animate={{ top: "120%" }}
            transition={{ duration: 1.35, ease: "easeInOut", delay: 0.15 }}
          />

          <div className="relative z-10 flex flex-col items-center px-6">
            <motion.div
              className="relative"
              initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.45)]">
                <FiCloud className="w-8 h-8 text-white" />
              </div>
              <motion.span
                className="absolute -inset-3 rounded-[22px] border border-sky-400/30"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 1, 0], scale: [0.9, 1.15, 1.35] }}
                transition={{ duration: 1.4, delay: 0.25, ease: "easeOut" }}
              />
            </motion.div>

            <motion.p
              className="mt-6 text-[13px] uppercase tracking-[0.35em] text-sky-300/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              Control Center
            </motion.p>

            <motion.h1
              className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-white"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.45 }}
            >
              iCloud Panel
            </motion.h1>

            <motion.div
              className="mt-7 h-[2px] w-40 overflow-hidden rounded-full bg-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-300"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.div>

            <motion.p
              className="mt-4 text-[11px] text-zinc-500 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ delay: 0.7, duration: 1.1, times: [0, 0.2, 0.75, 1] }}
            >
              Booting sessions…
            </motion.p>
          </div>

          {/* corner brackets */}
          <motion.span
            className="absolute left-6 top-6 h-8 w-8 border-l border-t border-sky-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
          <motion.span
            className="absolute right-6 top-6 h-8 w-8 border-r border-t border-sky-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          />
          <motion.span
            className="absolute left-6 bottom-6 h-8 w-8 border-l border-b border-sky-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          />
          <motion.span
            className="absolute right-6 bottom-6 h-8 w-8 border-r border-b border-sky-400/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AdminBootIntro;
