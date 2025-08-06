// client/src/components/VideoModal/VideoModal.tsx
import React, { useEffect, useRef } from "react";
import { ProductVideo } from "../../types";
import "../../styles/Viewer.scss"; // Importar los estilos

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
      className="video-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="video-modal-content">
        {/* 🔴 Close Button */}
        <button className="video-modal-close" onClick={onClose}>
          <span className="close-icon">×</span>
        </button>

        {/* 🎬 Video Player SOLO */}
        <div className="video-player-wrapper">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="video-modal-player"
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
