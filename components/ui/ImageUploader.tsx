"use client";

// components/ui/ImageUploader.tsx

import { useState, useRef, useCallback, useEffect } from "react";

interface ImageUploaderProps {
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

interface PreviewFile {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  uploadedUrl?: string;
  error?: string;
}

export default function ImageUploader({
  onChange,
  maxImages = 6,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);


  // Notify parent whenever previews change — done outside setPreviews to avoid setState-during-render
  useEffect(() => {
    const doneUrls = previews
      .filter((p) => p.status === "done" && p.uploadedUrl)
      .map((p) => p.uploadedUrl!);
    onChange(doneUrls);
  }, [previews]);

  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const MAX_SIZE_MB = 5;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, WebP allowed`;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `${file.name}: Exceeds ${MAX_SIZE_MB}MB limit`;
    }
    return null;
  };

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setGlobalError(null);

      const remaining = maxImages - previews.length;
      if (remaining <= 0) {
        setGlobalError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const filesToAdd = newFiles.slice(0, remaining);
      if (newFiles.length > remaining) {
        setGlobalError(`Only ${remaining} more image(s) can be added.`);
      }

      const validFiles: PreviewFile[] = [];
      for (const file of filesToAdd) {
        const err = validateFile(file);
        if (err) {
          setGlobalError(err);
          continue;
        }
        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (validFiles.length === 0) return;

      setPreviews((prev) => [...prev, ...validFiles]);
      uploadFiles(validFiles);
    },
    [previews, maxImages]
  );

  const uploadFiles = async (files: PreviewFile[]) => {
    setIsUploading(true);

    // Mark as uploading
    setPreviews((prev) =>
      prev.map((p) =>
        files.find((f) => f.id === p.id) ? { ...p, status: "uploading" } : p
      )
    );

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f.file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const urls: string[] = data.urls;

      // Map uploaded URLs back to the preview items (onChange fires via useEffect)
      setPreviews((prev) => {
        const updated = [...prev];
        files.forEach((f, i) => {
          const idx = updated.findIndex((p) => p.id === f.id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              status: "done",
              uploadedUrl: urls[i],
            };
          }
        });
        return updated;
      });
    } catch (err: any) {
      setGlobalError(err.message || "Upload failed. Please try again.");
      setPreviews((prev) =>
        prev.map((p) =>
          files.find((f) => f.id === p.id)
            ? { ...p, status: "error", error: err.message }
            : p
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (id: string) => {
    // onChange fires via useEffect watching previews
    setPreviews((prev) => prev.filter((p) => p.id !== id));
    setGlobalError(null);
  };

  const retryUpload = (id: string) => {
    const preview = previews.find((p) => p.id === id);
    if (!preview) return;
    setPreviews((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "pending", error: undefined } : p))
    );
    uploadFiles([preview]);
  };

  // Drag handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length > 0) addFiles(files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const canAddMore = previews.length < maxImages;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Error */}
      {globalError && (
        <div
          style={{
            background: "#FEF2F2",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "#FECACA",
            color: "#DC2626",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          {globalError}
        </div>
      )}

      {/* Drop zone — only shown if can still add more */}
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: isDragging ? "#1A1A2E" : "#D1D5DB",
            borderRadius: 16,
            padding: "32px 24px",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "#F5F5FD" : "#FAFAFA",
            transition: "all 0.2s ease",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!isDragging)
              (e.currentTarget as HTMLElement).style.borderColor = "#9CA3AF";
          }}
          onMouseLeave={(e) => {
            if (!isDragging)
              (e.currentTarget as HTMLElement).style.borderColor = "#D1D5DB";
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>
            {isDragging ? "📂" : "🖼️"}
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1A1A2E",
              marginBottom: 4,
            }}
          >
            {isDragging ? "Drop images here" : "Drag & drop images here"}
          </p>
          <p style={{ fontSize: 12, color: "#9CA3AF" }}>
            or{" "}
            <span
              style={{
                color: "#2D5BE3",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              click to browse
            </span>
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#C4C4C4",
              marginTop: 10,
            }}
          >
            JPEG, PNG, WebP · Max {MAX_SIZE_MB}MB each ·{" "}
            {maxImages - previews.length} remaining
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* Previews grid */}
      {previews.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                aspectRatio: "4/3",
                background: "#F3F4F6",
                borderWidth: 2,
                borderStyle: "solid",
                borderColor:
                  preview.status === "error"
                    ? "#FECACA"
                    : preview.status === "done"
                    ? "#BBF7D0"
                    : "#E5E7EB",
              }}
            >
              {/* Image */}
              <img
                src={preview.previewUrl}
                alt={`Property image ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity:
                    preview.status === "uploading"
                      ? 0.5
                      : preview.status === "error"
                      ? 0.4
                      : 1,
                  transition: "opacity 0.2s",
                }}
              />

              {/* First image badge */}
              {index === 0 && preview.status === "done" && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 6,
                    left: 6,
                    background: "rgba(0,0,0,0.7)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.04em",
                  }}
                >
                  COVER
                </div>
              )}

              {/* Uploading overlay */}
              {preview.status === "uploading" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.6)",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      border: "3px solid #E5E7EB",
                      borderTopColor: "#1A1A2E",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "#6B7280", fontWeight: 500 }}>
                    Uploading...
                  </span>
                </div>
              )}

              {/* Done checkmark */}
              {preview.status === "done" && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    width: 20,
                    height: 20,
                    background: "#059669",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}

              {/* Error overlay */}
              {preview.status === "error" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(254,242,242,0.85)",
                    gap: 6,
                    padding: 6,
                  }}
                >
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span
                    style={{
                      fontSize: 9,
                      color: "#DC2626",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    Upload failed
                  </span>
                  <button
                    onClick={() => retryUpload(preview.id)}
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 9,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => removeImage(preview.id)}
                title="Remove image"
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  transition: "background 0.15s",
                  zIndex: 10,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(220,38,38,0.85)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(0,0,0,0.65)")
                }
              >
                ×
              </button>
            </div>
          ))}

          {/* Add more tile — shown inside grid if there's room */}
          {!canAddMore ? null : previews.length > 0 ? null : null}
        </div>
      )}

      {/* Status row */}
      {previews.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#9CA3AF",
          }}
        >
          <span>
            {previews.filter((p) => p.status === "done").length} of{" "}
            {previews.length} uploaded
          </span>
          {isUploading && (
            <span style={{ color: "#2D5BE3", fontWeight: 500 }}>
              Uploading...
            </span>
          )}
          {!isUploading &&
            previews.every((p) => p.status === "done") &&
            previews.length > 0 && (
              <span style={{ color: "#059669", fontWeight: 500 }}>
                ✓ All images ready
              </span>
            )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}