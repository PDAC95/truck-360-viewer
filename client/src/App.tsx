// client/src/App.tsx - ARCHIVO COMPLETO
import React, { useState, useEffect, useRef } from "react";
import Viewer360 from "./components/Viewer360/Viewer360";
import VideoModal from "./components/VideoModal/VideoModal";
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
              title: "Engine Bay Beauty",
              duration: "2:30",
              type: "demo" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video1.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-1.png",
              description: "Check out this masterpiece under the hood",
            },
            {
              id: "video-2",
              title: "Rolling Thunder",
              duration: "3:15",
              type: "tutorial" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video2.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-2.png",
              description: "Listen to that custom exhaust roar",
            },
            {
              id: "video-3",
              title: "Night Prowler",
              duration: "1:45",
              type: "guide" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video3.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-3.png",
              description: "All lit up and ready to cruise",
            },
            {
              id: "video-4",
              title: "Highway Beast",
              duration: "4:20",
              type: "installation" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video4.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-4.png",
              description: "Power and performance on the open road",
            },
            {
              id: "video-5",
              title: "Custom Details",
              duration: "3:45",
              type: "demo" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video5.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-5.png",
              description: "Close-up of custom modifications",
            },
            {
              id: "video-6",
              title: "Performance Test",
              duration: "5:20",
              type: "tutorial" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video6.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-6.png",
              description: "Testing the truck's performance",
            },
            {
              id: "video-7",
              title: "Final Showcase",
              duration: "4:15",
              type: "guide" as const,
              videoUrl:
                "https://res.cloudinary.com/dzwmrurhg/video/upload/v1754496965/video7.mp4",
              thumbnailUrl:
                "https://res.cloudinary.com/dzwmrurhg/image/upload/v1754496797/thumbnail-7.png",
              description: "Complete showcase of the finished build",
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
      <header
        className="position-fixed top-0 w-100 glass-minimal"
        style={{ zIndex: 1000 }}
      >
        <div className="container-fluid py-3">
          <div className="row align-items-center">
            <div className="col-6">
              <img
                src="https://res.cloudinary.com/dzwmrurhg/image/upload/v1754398358/12logo.png"
                alt="12GA Customs Logo"
                className="h-auto"
                style={{
                  maxHeight: "45px",
                  maxWidth: "180px",
                  objectFit: "contain",
                }}
              />
            </div>
            <div className="col-6 text-end">
              <span className="badge bg-success me-2 px-3 py-1 rounded-pill">
                Project Complete
              </span>
              <span className="text-white small">Client Portfolio</span>
            </div>
          </div>
        </div>
      </header>

      {/* 🎨 Main Layout - TU DISEÑO ORIGINAL 2-COLUMNAS */}
      <main className="hero-section">
        <div className="product-showcase">
          <div className="product-main-layout">
            {/* 🖼️ IZQUIERDA - Visor 360° + Slider - MOSTRAR SOLO EN PESTAÑA 360 */}
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
              ) : (
                // Mostrar placeholder cuando no esté en pestaña 360°
                <div className="viewer-placeholder d-flex align-items-center justify-content-center text-center">
                  <div>
                    <h4 className="text-white mb-3">Mock-up Mode</h4>
                    <p className="text-secondary">
                      Switch to 360° tab to explore the interactive view
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 📋 DERECHA - Info Panel TU DISEÑO ORIGINAL */}
            <div className="product-info-panel">
              {/* 📋 Product Header */}
              <div className="product-header">
                <span className="status-badge">Custom Build Complete</span>

                <h1 className="product-title">Semi Casual Truck</h1>

                <p className="product-description">
                  Complete custom transformation showcasing premium
                  modifications and professional craftsmanship.
                </p>

                {/* 👤 Client Info */}
                <div className="client-info">
                  <div className="client-avatar">AT</div>
                  <div className="client-details">
                    <div className="client-name">ABC Transport Solutions</div>
                    <div className="project-date">January 2025</div>
                  </div>
                  <div className="status-indicator">Active</div>
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
                      document.querySelector(".video-section")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                  >
                    Videos
                  </button>
                </li>
              </ul>

              {/* 📄 Tab Content - NUEVA DINÁMICA */}
              <div className="tab-content">
                {/* 🔄 360° Tab - Mostrar el visor */}
                {activeTab === "360" && (
                  <div className="tab-pane tab-360-content">
                    <div className="text-center">
                      <h5 className="text-white mb-3">Interactive 360° View</h5>
                      <p className="text-secondary mb-3">
                        Drag to rotate and explore every angle of this custom
                        build.
                      </p>
                      <div className="d-flex justify-content-center gap-3">
                        <span className="badge bg-primary px-3 py-1 rounded-pill">
                          16 Views
                        </span>
                        <span className="badge bg-secondary px-3 py-1 rounded-pill">
                          High Resolution
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎬 Mock up 1 Tab - Mostrar video */}
                {activeTab === "mockup1" && (
                  <div className="tab-pane mockup-content">
                    <div className="text-center">
                      <h5 className="text-white mb-3">3D Model View</h5>
                      <p className="text-secondary mb-3">
                        See the original design concept and 3D visualization.
                      </p>

                      {/* Video del mockup */}
                      <div className="mockup-video-container">
                        <div className="ratio ratio-16x9">
                          <div className="d-flex align-items-center justify-content-center bg-dark rounded">
                            <div className="text-center">
                              <div className="mb-3">
                                <span className="display-1">🎨</span>
                              </div>
                              <h6 className="text-white mb-2">Mock-up Video</h6>
                              <button className="btn btn-primary btn-lg rounded-pill px-4">
                                <span className="me-2">▶️</span>
                                Play Mock-up
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🎬 VIDEO CAROUSEL - HORIZONTAL */}
          <div className="video-section">
            <div className="section-title">
              <h3>My Custom Truck</h3>
              <p>Check out these awesome shots of my ride</p>
            </div>

            <div className="video-carousel">
              <div className="video-carousel-container">
                <div
                  className="video-carousel-track"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`,
                  }}
                >
                  {product.videos.map((video, index) => (
                    <div
                      key={video.id}
                      className="video-carousel-item"
                      onClick={() => handleVideoSelect(video)}
                    >
                      <div className="video-thumbnail">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="thumbnail-image"
                        />
                      </div>

                      <div className="video-overlay">
                        <div className="play-button"></div>
                      </div>

                      <div className="video-info">
                        <h6 className="video-title">{video.title}</h6>
                        <div className="video-duration">{video.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles del carrusel */}
                <button className="carousel-btn carousel-btn-prev">
                  <span>‹</span>
                </button>
                <button className="carousel-btn carousel-btn-next">
                  <span>›</span>
                </button>
              </div>

              {/* Indicadores */}
              <div className="carousel-indicators">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`carousel-indicator ${
                      currentSlide === index ? "active" : ""
                    }`}
                    onClick={() => goToSlide(index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
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
