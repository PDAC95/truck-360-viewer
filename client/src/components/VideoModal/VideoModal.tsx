// client/src/components/VideoModal/VideoModal.tsx
import React, { useEffect, useRef } from "react";
import { ProductVideo } from "../../types";

interface VideoModalProps {
  isOpen: boolean;
  video: ProductVideo | null;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, video, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevenir scroll del body
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Pausar video al cerrar modal
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  // Cerrar al hacer clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !video) return null;

  return (
    <div
      ref={modalRef}
      className="modal-backdrop position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        zIndex: 9999,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="modal-content position-relative"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "800px",
        }}
      >
        {/* 🔴 Close Button */}
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          onClick={onClose}
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            zIndex: 10,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220, 38, 38, 0.8)";
            e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.6)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "18px",
              fontWeight: "bold",
              lineHeight: 1,
            }}
          >
            ×
          </span>
        </button>

        {/* 📺 Video Container */}
        <div className="video-container glass-minimal rounded-4 overflow-hidden border-subtle">
          {/* 📋 Video Header */}
          <div className="video-header p-4 border-bottom border-subtle">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4 className="text-white fw-semibold mb-2">{video.title}</h4>
                <div className="d-flex align-items-center gap-3">
                  <span className="badge bg-primary px-3 py-1 rounded-pill">
                    {video.type}
                  </span>
                  <span className="text-secondary small">
                    Duration: {video.duration}
                  </span>
                </div>
                {video.description && (
                  <p className="text-secondary mt-2 mb-0 small">
                    {video.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 🎬 Video Player */}
          <div className="video-player-wrapper position-relative">
            <div className="ratio ratio-16x9">
              {/* Por ahora placeholder, después video real */}
              <div className="d-flex align-items-center justify-content-center bg-dark">
                <div className="text-center">
                  <div className="mb-3">
                    <span className="display-1">
                      {video.type === "installation"
                        ? "🔧"
                        : video.type === "demo"
                        ? "🎯"
                        : video.type === "maintenance"
                        ? "⚙️"
                        : "🎬"}
                    </span>
                  </div>
                  <h5 className="text-white fw-semibold mb-2">Video Player</h5>
                  <p className="text-secondary mb-3">Playing: {video.title}</p>
                  <button className="btn btn-primary btn-lg rounded-pill px-4">
                    <span className="me-2">▶️</span>
                    Play Video ({video.duration})
                  </button>
                  <div className="mt-3">
                    <small className="text-secondary">
                      Next: Integrate real video player
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* 🎮 Video Controls Overlay (para futuro) */}
            <div className="position-absolute bottom-0 start-0 end-0 p-3">
              <div className="glass-minimal rounded-pill px-4 py-2">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-light rounded-circle p-1"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <span style={{ fontSize: "12px" }}>▶️</span>
                    </button>
                    <span className="text-white small fw-medium">
                      00:00 / {video.duration}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-light rounded-circle p-1"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <span style={{ fontSize: "12px" }}>🔊</span>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-light rounded-circle p-1"
                      style={{ width: "32px", height: "32px" }}
                    >
                      <span style={{ fontSize: "12px" }}>⛶</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
