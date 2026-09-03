/** Animated dark atmosphere — shared by admin login + dashboard */
function AdminAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 0% 0%, rgba(56,189,248,0.10), transparent 50%), radial-gradient(700px 400px at 100% 100%, rgba(99,102,241,0.08), transparent 45%), #07070a",
        }}
      />

      <div
        className="absolute -top-24 -left-16 h-[420px] w-[420px] rounded-full blur-[100px] opacity-40"
        style={{
          background: "rgba(56,189,248,0.35)",
          animation: "admin-orb-a 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-32 -right-20 h-[480px] w-[480px] rounded-full blur-[110px] opacity-30"
        style={{
          background: "rgba(59,130,246,0.3)",
          animation: "admin-orb-b 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[280px] w-[280px] rounded-full blur-[90px] opacity-20"
        style={{
          background: "rgba(125,211,252,0.35)",
          animation: "admin-orb-c 12s ease-in-out infinite",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />

      <div
        className="absolute inset-x-0 h-px opacity-30"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(125,211,252,0.8), transparent)",
          animation: "admin-scan 7s linear infinite",
        }}
      />

      <style>{`
        @keyframes admin-orb-a {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes admin-orb-b {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -25px) scale(1.1); }
        }
        @keyframes admin-orb-c {
          0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.2; }
          50% { transform: translate(-50%, 20px) scale(1.15); opacity: 0.35; }
        }
        @keyframes admin-scan {
          0% { top: -5%; }
          100% { top: 105%; }
        }
      `}</style>
    </div>
  );
}

export default AdminAtmosphere;
