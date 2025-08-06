// client/src/services/api.ts
import axios, { AxiosResponse } from "axios";
import { Product, ProductsResponse, ProductResponse } from "../types";

// 🌐 Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Crear instancia de axios con configuración
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔄 Interceptores para manejo de errores
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("❌ API Request Error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "❌ API Response Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// 📦 Product API Functions
export const productApi = {
  // Obtener todos los productos
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get<ProductsResponse>("/api/products");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }
  },

  // Obtener producto específico por ID
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get<ProductResponse>(
        `/api/products/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product ${id}`);
    }
  },

  // Crear nuevo producto (para admin futuro)
  createProduct: async (
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> => {
    try {
      const response = await apiClient.post<ProductResponse>(
        "/api/products",
        productData
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Failed to create product");
    }
  },
};

// 🔧 Health Check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};

// 🖼️ Cloudinary Helper Functions (actualizado para datos reales)
export const cloudinaryHelpers = {
  // Generar URL de imagen 360° real
  getImage360Url: (
    productId: string,
    frameNumber: number,
    transformations?: string
  ): string => {
    const paddedFrame = String(frameNumber).padStart(3, "0");
    // Por ahora placeholder, después usaremos Cloudinary real
    return `https://via.placeholder.com/800x600/1f2937/ffffff?text=Frame+${paddedFrame}`;
  },

  // Generar URL de thumbnail de video
  getVideoThumbnailUrl: (
    productId: string,
    videoId: string,
    transformations?: string
  ): string => {
    return `https://via.placeholder.com/400x225/374151/ffffff?text=Video+Thumb`;
  },

  // Generar URL de video
  getVideoUrl: (
    productId: string,
    videoId: string,
    transformations?: string
  ): string => {
    return `https://via.placeholder.com/800x450/1f2937/ffffff?text=Video+Player`;
  },
};

// 🎯 Data de prueba (temporal mientras arreglamos CORS)
export const mockProductData: Product = {
  id: "grille-001",
  name: "Custom Round Grille",
  sku: "12GA-GRL-R001",
  description:
    "Classic round openings for traditional styling and optimal airflow. Perfect for operators who prefer timeless design.",
  totalImages: 16,
  images360: Array.from(
    { length: 16 },
    (_, i) => `https://picsum.photos/800/600?random=${i + 1}`
  ),
  videos: [
    {
      id: "installation-guide",
      title: "Installation Guide",
      duration: "4:32",
      type: "installation",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: "https://picsum.photos/400/225?random=101",
      description: "Step-by-step installation process",
    },
    {
      id: "product-demo",
      title: "Product Demo",
      duration: "2:15",
      type: "demo",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl: "https://picsum.photos/400/225?random=102",
      description: "Features and benefits demonstration",
    },
    {
      id: "maintenance-tips",
      title: "Maintenance Tips",
      duration: "3:48",
      type: "maintenance",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://picsum.photos/400/225?random=103",
      description: "Care and maintenance guidelines",
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// 🧪 Helper para simular delay de red
export const simulateNetworkDelay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default apiClient;
