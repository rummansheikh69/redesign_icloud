import { io } from "socket.io-client";

let configuredOrigin = null;

/** Optional domain from admin toggle settings (e.g. https://mydomain.com). */
export function setConfiguredOrigin(origin) {
  const v = (origin || "").trim().replace(/\/$/, "");
  configuredOrigin = v || null;
}

export function getConfiguredOrigin() {
  return configuredOrigin;
}

/** Dev: Vite → :4000. Prod: saved domain, else same origin. */
export function createSocket(opts = {}) {
  if (import.meta.env.DEV) {
    return io("http://localhost:4000", opts);
  }
  return io(configuredOrigin || undefined, opts);
}
