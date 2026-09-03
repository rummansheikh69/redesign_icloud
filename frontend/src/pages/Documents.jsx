import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiFileText, FiTrash2, FiUpload, FiCheck, FiSliders } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import AdminAtmosphere from "../components/AdminAtmosphere";

function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function BlurEditor({ doc, onClose, onSaved }) {
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const [blur, setBlur] = useState(doc.blur ?? 45);
  const [panX, setPanX] = useState(doc.panX ?? 0);
  const [panY, setPanY] = useState(doc.panY ?? 0);
  const [zoom, setZoom] = useState(doc.zoom ?? 110);
  const isImage = String(doc.mimeType || "").startsWith("image/");

  const level = Math.max(0, Math.min(100, Number(blur) || 0));
  const blurPx = 1.5 + (level / 100) * 20;

  const { mutate: save, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/v1/rumman/site/case-documents/${doc._id}/blur`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blur, panX, panY, zoom }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      return json;
    },
    onSuccess: (json) => {
      toast.success("Preview saved");
      onSaved(json);
    },
    onError: (err) => toast.error(err.message || "Save failed"),
  });

  const onPointerDown = (e) => {
    if (!isImage) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX,
      panY,
    };
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = ((e.clientX - d.x) / rect.width) * 100;
    const dy = ((e.clientY - d.y) / rect.height) * 100;
    setPanX(Math.max(-50, Math.min(50, Math.round(d.panX + dx))));
    setPanY(Math.max(-50, Math.min(50, Math.round(d.panY + dy))));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121218] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Privacy blur</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Drag image to frame · adjust blur & zoom
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] text-zinc-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="px-5 pb-4">
          {isImage ? (
            <div
              ref={frameRef}
              className="relative h-[260px] overflow-hidden rounded-xl bg-[#e8eef5] border border-white/10 cursor-grab active:cursor-grabbing touch-none select-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <img
                src={doc.url}
                alt=""
                draggable={false}
                className="absolute left-1/2 top-1/2 max-w-none pointer-events-none"
                style={{
                  width: `${zoom}%`,
                  height: "auto",
                  transform: `translate(calc(-50% + ${panX}%), calc(-50% + ${panY}%))`,
                  filter: `blur(${blurPx}px) saturate(1.12) brightness(1.03)`,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 55%, rgba(20,30,50,0.12) 100%)",
                  opacity: 0.3 + (level / 100) * 0.5,
                }}
              />
              <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                <span className="inline-block rounded-full bg-black/45 text-white/90 text-[10px] px-2.5 py-1">
                  Drag to position
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-10 text-center text-sm text-zinc-500">
              Framing is for images only.
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                <span>Blur light</span>
                <span className="text-zinc-200 font-medium tabular-nums">{blur}</span>
                <span>Heavy</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>
            {isImage && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                  <span>Zoom out</span>
                  <span className="text-zinc-200 font-medium tabular-nums">{zoom}%</span>
                  <span>In</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={220}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => save()}
              className="flex-1 rounded-lg bg-sky-500/90 hover:bg-sky-400 text-white text-sm font-medium py-2.5 disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Documents() {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(true);
  const [editorDoc, setEditorDoc] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["caseDocuments"],
    queryFn: async () => {
      const res = await fetch("/api/v1/rumman/site/case-documents", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load documents");
      return json;
    },
  });

  const docs = data?.documents || [];

  useEffect(() => {
    if (!data) return;
    setShowPreview(data.showPreview !== false);
  }, [data]);

  const { mutate: savePreviewMode, isPending: savingPreviewMode } = useMutation({
    mutationFn: async (next) => {
      const res = await fetch("/api/v1/rumman/site/case-documents/preview-mode", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showPreview: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not save");
      return json;
    },
    onSuccess: (json) => {
      setShowPreview(Boolean(json.showPreview));
      queryClient.setQueryData(["caseDocuments"], (prev) =>
        prev ? { ...prev, showPreview: Boolean(json.showPreview) } : prev
      );
      toast.success(
        json.showPreview ? "Image preview on case page" : "PDF icon only on case page"
      );
    },
    onError: (err) => toast.error(err.message || "Save failed"),
  });

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: async (file) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/rumman/site/case-documents", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      return json;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ["caseDocuments"] });
      toast.success("Document uploaded");
      if (String(doc.mimeType || "").startsWith("image/")) {
        setEditorDoc(doc);
      }
    },
    onError: (err) => toast.error(err.message || "Upload failed"),
  });

  const { mutate: activate, isPending: activating } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(
        `/api/v1/rumman/site/case-documents/${id}/activate`,
        { method: "POST", credentials: "include" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not set active");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caseDocuments"] });
      toast.success("Shown on case page");
    },
    onError: (err) => toast.error(err.message || "Failed"),
  });

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/v1/rumman/site/case-documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not delete");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caseDocuments"] });
      toast.success("Document removed");
    },
    onError: (err) => toast.error(err.message || "Delete failed"),
  });

  const onPick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) upload(file);
  };

  return (
    <div className="relative min-h-screen text-zinc-100 overflow-hidden">
      <AdminAtmosphere />
      <Sidebar />

      <div className="relative z-10 ml-64 min-h-screen">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#07070a]/55 backdrop-blur-xl px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">documents</h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Upload, pick active file, frame & blur preview
            </p>
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500/90 hover:bg-sky-400 text-white text-sm font-medium px-3.5 py-2 transition disabled:opacity-50"
          >
            <FiUpload className="w-3.5 h-3.5" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/*"
            className="hidden"
            onChange={onPick}
          />
        </header>

        <div className="p-6 max-w-2xl space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center">
                <FiFileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Case documents</p>
                <p className="text-[11px] text-zinc-500">
                  Click a file to show it · slider to frame & blur
                </p>
              </div>
            </div>

            <label className="mx-5 mt-4 mb-1 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 cursor-pointer hover:bg-white/[0.04] transition">
              <input
                type="checkbox"
                checked={showPreview}
                disabled={savingPreviewMode}
                onChange={(e) => savePreviewMode(e.target.checked)}
                className="mt-0.5 accent-sky-400"
              />
              <span className="min-w-0">
                <span className="block text-sm text-zinc-200">
                  Show blurred image preview on case page
                </span>
                <span className="block text-[11px] text-zinc-500 mt-0.5">
                  Off = classic PDF icon only (like before)
                </span>
              </span>
            </label>

            <div className="px-5 py-4">
              {isLoading ? (
                <p className="text-sm text-zinc-500">Loading…</p>
              ) : docs.length === 0 ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-10 text-center hover:bg-white/[0.04] transition"
                >
                  <FiUpload className="w-5 h-5 mx-auto text-zinc-500" />
                  <p className="mt-3 text-sm text-zinc-300">Drop a file or click to upload</p>
                  <p className="mt-1 text-[11px] text-zinc-600">
                    PDF, PNG, JPG, WebP
                  </p>
                </button>
              ) : (
                <ul className="space-y-2" role="radiogroup" aria-label="Active case document">
                  {docs.map((doc) => {
                    const isImage = String(doc.mimeType || "").startsWith("image/");
                    return (
                      <li key={doc._id}>
                        <div
                          role="radio"
                          aria-checked={doc.active}
                          tabIndex={0}
                          onClick={() => {
                            if (!doc.active && !activating) activate(doc._id);
                          }}
                          onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && !doc.active) {
                              e.preventDefault();
                              activate(doc._id);
                            }
                          }}
                          className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition cursor-pointer ${
                            doc.active
                              ? "border-sky-500/40 bg-sky-500/[0.08]"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                          }`}
                        >
                          <span
                            className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${
                              doc.active
                                ? "border-sky-400 bg-sky-400"
                                : "border-zinc-500"
                            }`}
                            aria-hidden="true"
                          >
                            {doc.active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </span>
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/30 border border-white/5 shrink-0 flex items-center justify-center">
                            {isImage ? (
                              <img
                                src={doc.url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiFileText className="w-5 h-5 text-rose-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              {formatSize(doc.size)}
                              {typeof doc.blur === "number" ? ` · blur ${doc.blur}` : ""}
                              {doc.active ? " · on case page" : ""}
                            </p>
                          </div>
                          {doc.active && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 text-emerald-300 px-2.5 py-1.5 text-[11px] shrink-0">
                              <FiCheck className="w-3 h-3" />
                              Active
                            </span>
                          )}
                          {isImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditorDoc(doc);
                              }}
                              className="p-2 rounded-lg text-zinc-400 hover:text-sky-300 hover:bg-white/5 shrink-0"
                              title="Edit frame & blur"
                            >
                              <FiSliders className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={removing}
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(doc._id);
                            }}
                            className="p-2 rounded-lg text-zinc-500 hover:text-rose-300 hover:bg-white/5 shrink-0"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {editorDoc && (
        <BlurEditor
          doc={editorDoc}
          onClose={() => setEditorDoc(null)}
          onSaved={(updated) => {
            queryClient.setQueryData(["caseDocuments"], (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                documents: (prev.documents || []).map((d) =>
                  d._id === updated._id ? { ...d, ...updated } : d
                ),
              };
            });
            setEditorDoc(null);
          }}
        />
      )}
    </div>
  );
}

export default Documents;
