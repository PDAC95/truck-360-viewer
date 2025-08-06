// client/src/components/VideoGallery/VideoGallery.tsx
import React from "react";
import { ProductVideo } from "../../types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../styles/VideoGallery.scss";

interface VideoGalleryProps {
  videos: ProductVideo[];
  onVideoSelect: (video: ProductVideo) => void;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({
  videos,
  onVideoSelect,
}) => {
  return (
    <div className="video-gallery-container">
      <div className="gallery-header">
        <h3 className="gallery-title">Video Gallery</h3>
        <p className="gallery-subtitle">Click to watch</p>
      </div>

      <div className="swiper-container-wrapper">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={3}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={videos.length > 3}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 30,
            },
          }}
          className="video-swiper"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id}>
              <div
                className="video-card-slide"
                onClick={() => onVideoSelect(video)}
              >
                <div className="video-thumbnail-wrapper">
                  <div className="video-thumbnail">
                    {/* THUMBNAIL DE CLOUDINARY */}
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="thumbnail-image"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget.nextElementSibling;
                        if (fallback) {
                          (fallback as HTMLElement).style.display = "flex";
                        }
                      }}
                    />
                    {/* Fallback icon */}
                    <div
                      className="video-icon-fallback"
                      style={{ display: "none" }}
                    >
                      <span className="video-icon">🎬</span>
                    </div>

                    {/* Play overlay */}
                    <div className="play-overlay">
                      <div className="play-button">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* SOLO TÍTULO, SIN INFORMACIÓN EXTRA */}
                <div className="video-info-simple">
                  <h5 className="video-title">{video.title}</h5>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botones de navegación */}
        <button
          className="swiper-button-prev-custom"
          aria-label="Previous video"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="swiper-button-next-custom" aria-label="Next video">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoGallery;
