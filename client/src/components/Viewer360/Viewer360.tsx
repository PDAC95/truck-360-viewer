// client/src/components/Viewer360/Viewer360.tsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cloudinaryHelpers } from "../../services/api";
import { Viewer360Props } from "../../types";
import { useProductImagePreloader } from "../../hooks/useImagePreloader";

interface Viewer360Handle {
  setFrame: (frame: number) => void;
  getCurrentFrame: () => number;
}

const Viewer360 = forwardRef<
  Viewer360Handle,
  Viewer360Props & { currentFrame?: number }
>(
  (
    { productId, totalImages = 40, currentFrame: externalFrame, onFrameChange },
    ref
  ) => {
    const [currentImage, setCurrentImage] = useState(externalFrame || 1);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

    // 🔗 Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
      setFrame: (frame: number) => {
        setCurrentImage(frame);
        setIsAutoRotating(false); // Detener auto-rotate al cambiar manualmente
      },
      getCurrentFrame: () => currentImage,
    }));

    // 📡 Sincronizar con frame externo (del slider)
    useEffect(() => {
      if (
        externalFrame !== undefined &&
        externalFrame !== currentImage &&
        !isDragging
      ) {
        setCurrentImage(externalFrame);
      }
    }, [externalFrame, currentImage, isDragging]);

    // 🖼️ Usar hook de precarga
    const { loadedImages, loadingProgress, isAllLoaded, loadSpecificImage } =
      useProductImagePreloader(productId, totalImages);

    // Generar URL de imagen usando tus fotos reales de Cloudinary
    const getImageUrl = useCallback((imageIndex: number): string => {
      const paddedFrame = String(imageIndex).padStart(3, "0");
      return `https://res.cloudinary.com/dzwmruhg/image/upload/c_fit,w_800,h_600,q_auto,f_auto/360/Truck_${paddedFrame}.png`;
    }, []);

    // Precargar imagen actual cuando cambie
    useEffect(() => {
      loadSpecificImage(currentImage - 1);
    }, [currentImage, loadSpecificImage]);

    // Precargar imágenes adyacentes para rotación suave
    useEffect(() => {
      const preloadAdjacent = async () => {
        const prev = currentImage === 1 ? totalImages : currentImage - 1;
        const next = currentImage === totalImages ? 1 : currentImage + 1;

        try {
          await Promise.all([
            loadSpecificImage(prev - 1),
            loadSpecificImage(next - 1),
          ]);
        } catch (error) {
          console.error("Error preloading adjacent images:", error);
        }
      };

      if (loadedImages[currentImage - 1]) {
        preloadAdjacent();
      }
    }, [currentImage, totalImages, loadSpecificImage, loadedImages]);

    // Auto rotación
    useEffect(() => {
      if (isAutoRotating) {
        autoRotateRef.current = setInterval(() => {
          setCurrentImage((prev) => (prev % totalImages) + 1);
        }, 150); // 150ms entre frames para rotación suave
      } else {
        if (autoRotateRef.current) {
          clearInterval(autoRotateRef.current);
          autoRotateRef.current = null;
        }
      }

      return () => {
        if (autoRotateRef.current) {
          clearInterval(autoRotateRef.current);
        }
      };
    }, [isAutoRotating, totalImages]);

    // Notificar cambio de frame al componente padre
    useEffect(() => {
      if (onFrameChange) {
        onFrameChange(currentImage);
      }
    }, [currentImage, onFrameChange]);

    // Manejo de mouse/touch para rotación manual
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.clientX);
      setIsAutoRotating(false); // Detener auto rotación al iniciar drag
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const sensitivity = 8; // Ajustar sensibilidad de rotación

        if (Math.abs(deltaX) > sensitivity) {
          const direction = deltaX > 0 ? 1 : -1;
          setCurrentImage((prev) => {
            let newImage = prev + direction;
            if (newImage > totalImages) newImage = 1;
            if (newImage < 1) newImage = totalImages;
            return newImage;
          });
          setStartX(e.clientX);
        }
      },
      [isDragging, startX, totalImages]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // Touch events para móviles
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(true);
      setStartX(e.touches[0].clientX);
      setIsAutoRotating(false);
    }, []);

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (!isDragging) return;

        const deltaX = e.touches[0].clientX - startX;
        const sensitivity = 6; // Más sensible en móviles

        if (Math.abs(deltaX) > sensitivity) {
          const direction = deltaX > 0 ? 1 : -1;
          setCurrentImage((prev) => {
            let newImage = prev + direction;
            if (newImage > totalImages) newImage = 1;
            if (newImage < 1) newImage = totalImages;
            return newImage;
          });
          setStartX(e.touches[0].clientX);
        }
      },
      [isDragging, startX, totalImages]
    );

    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    const toggleAutoRotate = () => {
      setIsAutoRotating(!isAutoRotating);
    };

    const resetToStart = () => {
      setCurrentImage(1);
      setIsAutoRotating(false);
    };

    return (
      <div className="viewer-360-component">
        <div
          ref={containerRef}
          className="viewer-container position-relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          <div className="viewer-image-area">
            {!isAllLoaded ? (
              <div className="placeholder-content">
                <div className="loading-indicator"></div>
                <h3>Loading 360° View</h3>
                <p>Preparing {totalImages} high-resolution frames...</p>
                <div className="mt-3">
                  <div
                    className="progress"
                    style={{
                      height: "4px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      className="progress-bar bg-primary"
                      style={{
                        width: `${loadingProgress}%`,
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                  <small className="text-secondary mt-2 d-block">
                    {Math.round(loadingProgress)}% loaded
                  </small>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={getImageUrl(currentImage)}
                  alt={`360° view frame ${currentImage}`}
                  className="viewer-image w-100 h-100"
                  style={{
                    objectFit: "contain",
                    transition: isDragging ? "none" : "opacity 0.1s ease",
                    opacity: loadedImages[currentImage - 1] ? 1 : 0.7,
                  }}
                  draggable={false}
                />

                {/* Indicador de frame en la esquina */}
                <div className="position-absolute top-0 end-0 m-3">
                  <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
                    <span className="text-white fw-medium">
                      {String(currentImage).padStart(2, "0")}
                    </span>
                    <span className="text-secondary mx-1">/</span>
                    <span className="text-secondary">{totalImages}</span>
                  </span>
                </div>

                {/* Controles flotantes */}
                <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                  <div className="glass-minimal rounded-pill px-4 py-2">
                    <div className="d-flex align-items-center gap-3">
                      <button
                        className={`btn btn-sm ${
                          isAutoRotating ? "btn-primary" : "btn-outline-light"
                        } rounded-pill px-3`}
                        onClick={toggleAutoRotate}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {isAutoRotating ? "⏸️ Pause" : "▶️ Auto"}
                      </button>

                      <button
                        className="btn btn-sm btn-outline-light rounded-pill px-3"
                        onClick={resetToStart}
                        style={{ fontSize: "0.75rem" }}
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>
                </div>

                {/* Indicador de drag */}
                {isDragging && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="bg-dark bg-opacity-75 rounded-pill px-3 py-2">
                      <small className="text-white fw-medium">
                        🔄 Rotating...
                      </small>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default Viewer360;
