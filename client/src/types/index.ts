// client/src/types/index.ts

// 📦 Product Data Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  totalImages: number;
  images360: string[];
  videos: ProductVideo[];
  createdAt?: string;
  updatedAt?: string;
}

// 🎬 Video Data Types
export interface ProductVideo {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  type: VideoType;
  description?: string;
}

export type VideoType =
  | "tutorial"
  | "demo"
  | "guide"
  | "installation"
  | "maintenance";

// 🔄 Viewer 360° Types
export interface Viewer360State {
  currentFrame: number;
  totalFrames: number;
  isLoading: boolean;
  isAutoRotating: boolean;
  isDragging: boolean;
  imagesLoaded: boolean[];
}

export interface Viewer360Props {
  productId: string;
  totalImages: number;
  currentFrame?: number;
  onFrameChange?: (frame: number) => void;
  autoRotateSpeed?: number;
  dragSensitivity?: number;
  className?: string;
}

// 🎚️ Slider Control Types
export interface SliderControlProps {
  currentValue: number;
  maxValue: number;
  minValue?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

// 🎥 Video Modal Types
export interface VideoModalProps {
  isOpen: boolean;
  video: ProductVideo | null;
  onClose: () => void;
}

export interface VideoGalleryProps {
  videos: ProductVideo[];
  onVideoSelect: (video: ProductVideo) => void;
  className?: string;
}

// 🌐 API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ProductsResponse extends ApiResponse<Product[]> {}
export interface ProductResponse extends ApiResponse<Product> {}

// 📱 UI State Types
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

// 🎨 Theme Types
export type ThemeMode = "dark" | "light";
export type ColorScheme = "red" | "blue" | "green" | "purple";

// 🔧 Utility Types
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  folder: string;
}

export interface ImageTransformation {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "png" | "jpg" | "webp";
}

// 📊 Analytics Types (para futuras funcionalidades)
export interface ViewerAnalytics {
  productId: string;
  totalViews: number;
  averageViewTime: number;
  mostViewedFrame: number;
  interactionType: "drag" | "slider" | "auto";
}
