// client/src/App.tsx - ARCHIVO COMPLETO
import React, { useState, useEffect, useRef } from "react";
import Viewer360 from "./components/Viewer360/Viewer360";
import VideoModal from "./components/VideoModal/VideoModal";
import VideoGallery from "./components/VideoGallery/VideoGallery";
import { productApi, mockProductData } from "./services/api";
import { Product, ProductVideo } from "./types";

function App() {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<ProductVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("360");
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 3; // Mostrar 3 videos por página
  const totalSlides = Math.ceil((product?.videos.length || 0) / itemsPerPage);

  const viewerRef = useRef<any>(null);
  const totalFrames = product?.totalImages || 16;

  // Cargar datos del producto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const updatedMockData = {
          ...mockProductData,
          name: "Semi Casual Truck",
          sku: "SCT-2025-001",
          description:
            "Complete custom transformation showcasing premium modifications and professional craftsmanship.",
          videos: [
            {
              id: "video-1",
              title: "Video 1",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video1.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-1.png",
            },
            {
              id: "video-2",
              title: "Video 2",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video2.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-2.png",
            },
            {
              id: "video-3",
              title: "Video 3",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video3.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-3.png",
            },
            {
              id: "video-4",
              title: "Video 4",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video4.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-4.png",
            },
            {
              id: "video-5",
              title: "Video 5",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video5.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-5.png",
            },
            {
              id: "video-6",
              title: "Video 6",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video6.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-6.png",
            },
            {
              id: "video-7",
              title: "Video 7",
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video7.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-7.png",
            },
          ],
        };

        setProduct(updatedMockData);
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(mockProductData);
      }
    };

    loadProduct();
  }, []);

  const handleFrameChange = (frame: number) => {
    setCurrentFrame(frame);
  };

  const handleVideoSelect = (video: ProductVideo) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  // Funciones del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 < 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  // Loading state
  if (!product) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-black">
        <div className="text-center">
          <div className="loading-indicator mb-3"></div>
          <h4 className="text-white fw-semibold">Loading Product...</h4>
          <p className="text-secondary">Preparing 360° experience</p>
        </div>
      </div>
    );
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setCurrentFrame(value);
  };

  const progressPercentage = ((currentFrame - 1) / (totalFrames - 1)) * 100;

  return (
    <div className="App">
      {/* 🎯 Header Original */}
      <header className="app-header glass-minimal">
        <div className="container-fluid py-3">
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <img
                src="https://res.cloudinary.com/dzwmrurhg/image/upload/v1754398358/12logo.png"
                alt="12GA Customs Logo"
                className="header-logo"
              />
            </div>
          </div>
        </div>
      </header>

      {/* 🎨 Main Layout - TU DISEÑO ORIGINAL 2-COLUMNAS */}
      <main className="hero-section">
        <div className="product-showcase">
          <div className="product-main-layout">
            {/* 🖼️ IZQUIERDA - Visor 360° + Slider */}
            <div className="viewer-main-area">
              {activeTab === "360" ? (
                <>
                  <Viewer360
                    ref={viewerRef}
                    productId={product.id}
                    totalImages={product.totalImages}
                    currentFrame={currentFrame}
                    onFrameChange={handleFrameChange}
                  />

                  {/* 🎚️ Rotation Slider - TU ESTILO ORIGINAL */}
                  <div className="rotation-control">
                    <div className="control-label">
                      <h4>Rotate to explore</h4>
                    </div>

                    <div className="slider-wrapper">
                      <div className="slider-track">
                        <div
                          className="slider-progress"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max={totalFrames}
                        value={currentFrame}
                        onChange={handleSliderChange}
                        className="slider-input"
                      />

                      <div
                        className="slider-thumb-visual"
                        style={{ left: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              ) : activeTab === "mockup1" ? (
                // Mostrar video 360 cuando esté en pestaña 3D Model
                <div className="video-3d-container">
                  <video
                    controls
                    autoPlay
                    loop
                    muted
                    className="video-3d-player"
                  >
                    <source
                      src="https://res.cloudinary.com/dzwmrurhg/video/upload/v1754503797/360video.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                // Placeholder para otros tabs
                <div className="viewer-placeholder d-flex align-items-center justify-content-center text-center">
                  <div>
                    <h4 className="text-white mb-3">Select a View</h4>
                    <p className="text-secondary">
                      Choose 360° or 3D Model to explore
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 📋 DERECHA - Info Panel TU DISEÑO ORIGINAL */}
            <div className="product-info-panel">
              {/* 📋 Product Header */}
              <div className="product-header">
                <h1 className="product-title">Semi Casual Truck</h1>

                <p className="product-description">
                  Complete custom transformation showcasing premium
                  modifications and professional craftsmanship.
                </p>

                {/* 👤 Client Info */}
                <div className="client-info">
                  <div className="client-avatar">SC</div>
                  <div className="client-details">
                    <div className="client-name">Semi Casual Show</div>
                    <div className="project-date">January 2025</div>
                  </div>
                </div>
              </div>

              {/* 🎯 Navigation Tabs - NUEVA DINÁMICA */}
              <ul className="nav nav-tabs nav-tabs-custom">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "360" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("360")}
                  >
                    360°
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "mockup1" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("mockup1")}
                  >
                    3D Model
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link"
                    onClick={() => {
                      // Scroll hacia los videos
                      document
                        .querySelector(".video-gallery-container")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    Videos
                  </button>
                </li>
              </ul>

              {/* 📄 Tab Content - SIMPLIFICADO */}
              <div className="tab-content">
                {/* 🔄 360° Tab */}
                {activeTab === "360" && (
                  <div className="tab-pane tab-360-content">
                    <div className="text-center">
                      <h5 className="text-white mb-3">Interactive 360° View</h5>
                      <p className="text-secondary">
                        Drag to rotate and explore every angle
                      </p>
                    </div>
                  </div>
                )}

                {/* 🎬 3D Model Tab */}
                {activeTab === "mockup1" && (
                  <div className="tab-pane mockup-content">
                    <div className="text-center">
                      <h5 className="text-white mb-3">3D Model View</h5>
                      <p className="text-secondary">360° video visualization</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🎬 VIDEO GALLERY - ABAJO DEL LAYOUT */}
          <VideoGallery
            videos={product.videos}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      </main>

      {/* 🎬 Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        video={selectedVideo}
        onClose={handleCloseVideoModal}
      />

      {/* 🦶 Footer */}
      <footer className="border-top border-subtle py-4 mt-6">
        <div className="container-fluid">
          <div className="text-center">
            <p className="text-secondary small mb-0">
              © 2025 12GA Customs. Professional truck customization and
              modifications.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
