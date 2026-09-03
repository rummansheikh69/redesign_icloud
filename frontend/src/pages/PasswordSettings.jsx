import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiLock } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import AdminAtmosphere from "../components/AdminAtmosphere";

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate: changePassword, isPending: changingPassword } = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match");
      }

      const res = await fetch("/api/v1/rumman/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password");
      return data;
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    },
    onError: (err) => toast.error(err.message || "Password change failed"),
  });

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <AdminAtmosphere />
      <Sidebar />

      <div className="relative z-10 ml-64 min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07070a]/55 backdrop-blur-xl px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">settings</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Change the admin login password
          </p>
        </header>

        <div className="p-6 max-w-xl space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center">
                <FiLock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Change password</p>
                <p className="text-[11px] text-zinc-500">
                  Update the admin login password
                </p>
              </div>
            </div>

            <form
              className="px-5 py-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                changePassword();
              }}
            >
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/40"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min. 6 characters)"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/40"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-amber-400/40"
              />

              <button
                type="submit"
                disabled={
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  changingPassword
                }
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500/90 hover:bg-amber-500 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50 transition"
              >
                <FiLock className="w-4 h-4" />
                {changingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordSettings;

