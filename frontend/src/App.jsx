import { Navigate, Route, Routes } from "react-router-dom";
import Victim from "./components/dashboard/Victim";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./pages/AdminLogin";
import HomePage from "./pages/HomePage";
import Settings from "./pages/Settings";
import AdminAtmosphere from "./components/AdminAtmosphere";
import PasswordSettings from "./pages/PasswordSettings";
import Documents from "./pages/Documents";
import { FiCloud } from "react-icons/fi";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { setConfiguredOrigin } from "./lib/socket";

function AdminLoadingScreen() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07070a] text-white">
      <AdminAtmosphere />
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-[0_0_32px_rgba(56,189,248,0.4)]"
          animate={{ scale: [1, 1.06, 1], rotate: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiCloud className="w-6 h-6" />
        </motion.div>
        <motion.p
          className="mt-5 text-[11px] uppercase tracking-[0.28em] text-zinc-500"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Loading panel
        </motion.p>
      </div>
    </div>
  );
}

function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/v1/rumman/auth/me");
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) return null;
          throw new Error(data.error || "An unknown error occurred");
        }
        return data;
      } catch (error) {
        console.log("Error fetching auth user:", error);
        return null;
      }
    },
    retry: false,
  });

  const {
    data: adminUser,
    isLoading: adminLoading,
  } = useQuery({
    queryKey: ["adminUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/v1/rumman/auth/admin/me");
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) return null;
          throw new Error(data.error || "Admin auth failed");
        }
        return data;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  const { data: siteDomain } = useQuery({
    queryKey: ["siteDomain"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/domain");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { domain: "" };
      return data;
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (siteDomain?.domain) setConfiguredOrigin(siteDomain.domain);
  }, [siteDomain]);

  const adminGate = (node) =>
    adminLoading ? (
      <AdminLoadingScreen />
    ) : adminUser ? (
      node
    ) : (
      <Navigate to="/admin" replace />
    );

  return (
    <MantineProvider>
      <div className="min-h-screen" style={{ background: "var(--page-bg)" }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage authUser={authUser} isLoading={isLoading} />
            }
          />

          <Route
            path="/admin"
            element={
              adminLoading ? (
                <AdminLoadingScreen />
              ) : adminUser ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <AdminLogin />
              )
            }
          />

          <Route
            path="/admin/dashboard"
            element={adminGate(<Victim />)}
          />

          <Route
            path="/admin/toggle"
            element={adminGate(<Settings />)}
          />

          <Route
            path="/admin/documents"
            element={adminGate(<Documents />)}
          />

          <Route
            path="/admin/settings"
            element={adminGate(<PasswordSettings />)}
          />

          <Route
            path="/watching/victim"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/cloud/login"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
        <Toaster
          position="top-center"
          gutter={10}
          containerStyle={{ top: 16 }}
          toastOptions={{
            duration: 3200,
            className: "app-toast",
            style: {
              background: "#ffffff",
              color: "#1d1d1f",
              borderRadius: "16px",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              boxShadow:
                "0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
            },
            success: {
              iconTheme: {
                primary: "#34c759",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ff3b30",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </div>
    </MantineProvider>
  );
}

export default App;
