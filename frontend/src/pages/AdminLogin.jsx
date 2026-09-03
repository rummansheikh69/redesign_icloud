import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiArrowRight, FiAlertCircle, FiCloud } from "react-icons/fi";
import AdminAtmosphere from "../components/AdminAtmosphere";

function AdminLogin() {
  const [formData, setFormData] = useState({
    fullName: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: async ({ fullName, password }) => {
      const res = await fetch("/api/v1/rumman/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Invalid credentials");
      }
      return data;
    },
    onSuccess: async () => {
      setErrorMsg("");
      await queryClient.invalidateQueries({ queryKey: ["adminUser"] });
      navigate("/admin/select");
    },
    onError: (err) => {
      setErrorMsg(err.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden text-white px-4">
      <AdminAtmosphere />

      <motion.form
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_0_30px_rgba(56,189,248,0.4)]"
          >
            <FiCloud className="h-7 w-7" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="text-2xl font-semibold tracking-tight text-white"
          >
            Admin Panel
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-1 text-sm text-zinc-400"
          >
            Sign in to manage your dashboard
          </motion.p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-sky-300">
              <FiUser className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              autoComplete="username"
              required
              placeholder="Username"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>

          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-sky-300">
              <FiLock className="h-5 w-5" />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
              placeholder="Password"
              className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-white placeholder:text-zinc-500 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <FiAlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          disabled={isPending}
          type="submit"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-3 font-medium text-white shadow-[0_8px_30px_rgba(56,189,248,0.25)] transition hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <FiArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Authorized personnel only
        </p>
      </motion.form>
    </div>
  );
}

export default AdminLogin;
