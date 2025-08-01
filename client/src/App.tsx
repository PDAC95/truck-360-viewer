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

        // Usar mock data actualizado
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simular delay

        const updatedMockData = {
          ...mockProductData,
          name: "Semi Casual Truck",
          sku: "SCT-2025-001",
          description:
            "Experience our premium truck collection with interactive 360° viewing technology. Drag to explore every angle and detail of our carefully crafted vehicles.",
          videos: [
            {
              id: "video-1",
              title: "Video 1",
              duration: "2:30",
              type: "demo" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=201",
              description: "First demonstration video",
            },
            {
              id: "video-2",
              title: "Video 2",
              duration: "3:15",
              type: "tutorial" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=202",
              description: "Second tutorial video",
            },
            {
              id: "video-3",
              title: "Video 3",
              duration: "1:45",
              type: "guide" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=203",
              description: "Third guide video",
            },
            {
              id: "video-4",
              title: "Video 4",
              duration: "4:20",
              type: "installation" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=204",
              description: "Fourth installation video",
            },
            {
              id: "video-5",
              title: "Video 5",
              duration: "2:55",
              type: "maintenance" as const,
              videoUrl:
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              thumbnailUrl: "https://picsum.photos/400/225?random=205",
              description: "Fifth maintenance video",
            },
          ],
        };

        setProduct(updatedMockData);
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
              <img
                src="https://res.cloudinary.com/dzwmrurhg/image/upload/v1754074682/logo.png"
                alt="Company Logo"
                className="h-auto"
                style={{
                  maxHeight: "40px",
                  maxWidth: "200px",
                  objectFit: "contain",
                }}
              />
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
              Semi Casual Truck
            </h2>
            <p
              className="fs-4 text-secondary mb-4"
              style={{ maxWidth: "700px", margin: "0 auto" }}
            >
              Experience our premium truck collection with interactive 360°
              viewing technology. Drag to explore every angle and detail of our
              carefully crafted vehicles.
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

          {/* 🎬 Video Gallery con 5 videos */}
          <div className="video-section">
            <div className="section-title">
              <h3>Learn more</h3>
              <p>Comprehensive guides and demonstrations</p>
            </div>

            <div className="video-grid">
              {product.videos.map((video, index) => (
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
                    <div className="video-meta d-flex justify-content-between align-items-center">
                      <span className="video-duration">{video.duration}</span>
                    </div>
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

      {/* 🦶 Minimal Footer */}
      <footer className="border-top border-subtle py-4 mt-6">
        <div className="container-fluid">
          <div className="text-center">
            <p className="text-secondary small mb-0">
              © 2025 Semi Casual Truck Platform. Built for modern visualization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
