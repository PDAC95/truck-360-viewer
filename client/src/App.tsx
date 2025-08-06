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
  const [activeTab, setActiveTab] = useState("overview");

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
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=201",
              description: "Check out this masterpiece under the hood",
            },
            {
              id: "video-2",
              title: "Rolling Thunder",
              duration: "3:15",
              type: "tutorial" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=202",
              description: "Listen to that custom exhaust roar",
            },
            {
              id: "video-3",
              title: "Night Prowler",
              duration: "1:45",
              type: "guide" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=203",
              description: "All lit up and ready to cruise",
            },
            {
              id: "video-4",
              title: "Highway Beast",
              duration: "4:20",
              type: "installation" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=204",
              description: "Power and performance on the open road",
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
            {/* 🖼️ IZQUIERDA - Visor 360° + Slider */}
            <div className="viewer-main-area">
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

              {/* 🎯 Navigation Tabs - TU DISEÑO ORIGINAL */}
              <ul className="nav nav-tabs nav-tabs-custom">
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "overview" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("overview")}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "installed" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("installed")}
                  >
                    Installed
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${
                      activeTab === "videos" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("videos")}
                  >
                    Videos
                  </button>
                </li>
              </ul>

              {/* 📄 Tab Content */}
              <div className="tab-content">
                {/* 📊 Overview Tab */}
                {activeTab === "overview" && (
                  <div className="tab-pane overview-content">
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-number">5</span>
                        <span className="stat-label">Modifications</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">4</span>
                        <span className="stat-label">Videos</span>
                      </div>
                    </div>

                    <div className="description">
                      This is my pride and joy - a completely custom truck build
                      showcasing premium modifications and professional
                      craftsmanship. Every detail has been carefully planned and
                      executed to perfection.
                    </div>

                    <div className="project-details">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-secondary">Build Type:</span>
                        <span className="text-white fw-medium">
                          Complete Custom
                        </span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-secondary">Status:</span>
                        <span className="text-success fw-medium">
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🔧 Installed Tab */}
                {activeTab === "installed" && (
                  <div className="tab-pane installed-content">
                    <div className="modification-list">
                      <div className="modification-item">
                        <div className="modification-info">
                          <div className="modification-name">
                            Custom Round Grille
                          </div>
                          <div className="modification-details">
                            Premium airflow design
                          </div>
                        </div>
                        <div className="status-badge">✓ Installed</div>
                      </div>

                      <div className="modification-item">
                        <div className="modification-info">
                          <div className="modification-name">LED Light Bar</div>
                          <div className="modification-details">
                            High-performance lighting
                          </div>
                        </div>
                        <div className="status-badge">✓ Installed</div>
                      </div>

                      <div className="modification-item">
                        <div className="modification-info">
                          <div className="modification-name">Custom Bumper</div>
                          <div className="modification-details">
                            Heavy-duty protection
                          </div>
                        </div>
                        <div className="status-badge">✓ Installed</div>
                      </div>

                      <div className="modification-item">
                        <div className="modification-info">
                          <div className="modification-name">
                            Chrome Accents
                          </div>
                          <div className="modification-details">
                            Premium finish details
                          </div>
                        </div>
                        <div className="status-badge">✓ Installed</div>
                      </div>

                      <div className="modification-item">
                        <div className="modification-info">
                          <div className="modification-name">
                            Performance Exhaust
                          </div>
                          <div className="modification-details">
                            Enhanced sound & performance
                          </div>
                        </div>
                        <div className="status-badge">✓ Installed</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎬 Videos Tab */}
                {activeTab === "videos" && (
                  <div className="tab-pane videos-content">
                    <div className="video-list-compact">
                      {product.videos.map((video) => (
                        <div
                          key={video.id}
                          className="video-item-compact"
                          onClick={() => handleVideoSelect(video)}
                        >
                          <div className="video-thumbnail-small">
                            <span className="video-icon-small">🎬</span>
                          </div>
                          <div className="video-details-compact">
                            <div className="video-title-compact">
                              {video.title}
                            </div>
                            <div className="video-duration-compact">
                              {video.duration}
                            </div>
                          </div>
                          <div className="play-indicator">▶️</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🎬 VIDEO GALLERY - ABAJO DEL LAYOUT */}
          <div className="video-section">
            <div className="section-title">
              <h3>My Custom Truck</h3>
              <p>Check out these awesome shots of my ride</p>
            </div>

            <div className={`video-grid videos-${product.videos.length}`}>
              {product.videos.map((video) => (
                <div
                  key={video.id}
                  className="video-card"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="video-thumbnail">
                    <span className="video-icon">🎬</span>
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
