// client/src/App.tsx
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

  const viewerRef = useRef<any>(null);
  const totalFrames = product?.totalImages || 40;

  // Cargar datos del producto (mock por ahora debido a CORS)
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // TODO: Arreglar CORS y usar API real
        // const products = await productApi.getAllProducts();
        // if (products.length > 0) {
        //   setProduct(products[0]);
        // }

        // Usar mock data por ahora
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simular delay
        setProduct(mockProductData);
      } catch (error) {
        console.error("Error loading product:", error);
        // Fallback a mock data si falla API
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

  // Loading state mientras carga el producto
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
      {/* 🎯 Minimal Header */}
      <header
        className="position-fixed top-0 w-100 glass-minimal"
        style={{ zIndex: 1000 }}
      >
        <div className="container-fluid py-3">
          <div className="row align-items-center">
            <div className="col-6">
              <h1 className="h5 text-white mb-0 fw-semibold">Truck 360°</h1>
            </div>
            <div className="col-6 text-end">
              <span className="badge bg-primary px-3 py-1 rounded-pill">
                Demo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 🎨 Main Hero Layout - Apple Style */}
      <main className="hero-section">
        <div className="product-showcase">
          {/* 📋 Product Title Section */}
          <div className="text-center mb-5">
            <h2 className="display-3 text-white fw-bold mb-3">
              {product.name}
            </h2>
            <p
              className="fs-4 text-secondary mb-4"
              style={{ maxWidth: "600px", margin: "0 auto" }}
            >
              {product.description}
            </p>
            <div className="d-flex justify-content-center gap-3">
              <span className="badge bg-dark border-subtle px-4 py-2 rounded-pill">
                SKU: {product.sku}
              </span>
              <span className="badge bg-primary px-4 py-2 rounded-pill">
                Premium Quality
              </span>
            </div>
          </div>

          {/* 🖼️ 360° Viewer - Centerpiece */}
          <div className="viewer-360-main">
            <Viewer360
              ref={viewerRef}
              productId={product.id}
              totalImages={product.totalImages}
              currentFrame={currentFrame}
              onFrameChange={handleFrameChange}
            />
          </div>

          {/* 🎚️ Apple-Style Rotation Slider */}
          <div className="rotation-control">
            <div className="control-label">
              <h4>Rotate to explore</h4>
              <div className="frame-info">
                Frame {currentFrame} of {totalFrames}
              </div>
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

          {/* 🎬 Minimal Video Gallery */}
          <div className="video-section">
            <div className="section-title">
              <h3>Learn more</h3>
              <p>Installation guides and product demonstrations</p>
            </div>

            <div className="video-grid">
              {product.videos.map((video, index) => (
                <div
                  key={video.id}
                  className="video-card"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="video-thumbnail">
                    <span className="video-icon">
                      {video.type === "installation"
                        ? "🔧"
                        : video.type === "demo"
                        ? "🎯"
                        : video.type === "maintenance"
                        ? "⚙️"
                        : "🎬"}
                    </span>
                  </div>

                  <div className="video-overlay">
                    <div className="play-button"></div>
                  </div>

                  <div className="video-info">
                    <h6 className="video-title">{video.title}</h6>
                    <div className="video-meta d-flex justify-content-between align-items-center">
                      <span className="video-duration">{video.duration}</span>
                      <span className="video-type">{video.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 📱 Technical Specs - Apple Style */}
          <div className="mt-6 pt-5 border-top border-subtle">
            <div className="row g-4 text-center">
              <div className="col-6 col-md-3">
                <div className="mb-2">
                  <span className="fs-4">📸</span>
                </div>
                <h6 className="text-white fw-medium mb-1">Resolution</h6>
                <p className="text-secondary small mb-0">4K Ultra HD</p>
              </div>
              <div className="col-6 col-md-3">
                <div className="mb-2">
                  <span className="fs-4">🔄</span>
                </div>
                <h6 className="text-white fw-medium mb-1">Frames</h6>
                <p className="text-secondary small mb-0">
                  {product.totalImages} Images
                </p>
              </div>
              <div className="col-6 col-md-3">
                <div className="mb-2">
                  <span className="fs-4">🎨</span>
                </div>
                <h6 className="text-white fw-medium mb-1">Format</h6>
                <p className="text-secondary small mb-0">PNG Alpha</p>
              </div>
              <div className="col-6 col-md-3">
                <div className="mb-2">
                  <span className="fs-4">⚡</span>
                </div>
                <h6 className="text-white fw-medium mb-1">Loading</h6>
                <p className="text-secondary small mb-0">Optimized</p>
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

      {/* 🦶 Minimal Footer */}
      <footer className="border-top border-subtle py-4 mt-6">
        <div className="container-fluid">
          <div className="text-center">
            <p className="text-secondary small mb-0">
              © 2025 Truck 360° Platform. Built for modern visualization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
