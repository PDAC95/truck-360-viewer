// client/src/hooks/useImagePreloader.ts
import { useState, useEffect, useCallback } from "react";

interface UseImagePreloaderProps {
  imageUrls: string[];
  preloadAll?: boolean;
  preloadBatch?: number;
}

interface UseImagePreloaderReturn {
  loadedImages: boolean[];
  loadingProgress: number;
  isAllLoaded: boolean;
  preloadedImages: HTMLImageElement[];
  loadSpecificImage: (index: number) => Promise<void>;
  resetPreloader: () => void;
}

// 🖼️ Hook personalizado para precargar imágenes del visor 360°
export const useImagePreloader = ({
  imageUrls,
  preloadAll = true,
  preloadBatch = 5,
}: UseImagePreloaderProps): UseImagePreloaderReturn => {
  const [loadedImages, setLoadedImages] = useState<boolean[]>(
    new Array(imageUrls.length).fill(false)
  );
  const [preloadedImages, setPreloadedImages] = useState<HTMLImageElement[]>(
    []
  );

  // 📊 Calcular progreso de carga
  const loadingProgress =
    loadedImages.length > 0
      ? (loadedImages.filter(Boolean).length / loadedImages.length) * 100
      : 0;

  const isAllLoaded = loadedImages.every(Boolean);

  // 🔄 Función para precargar una imagen específica
  const loadSpecificImage = useCallback(
    (index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (index < 0 || index >= imageUrls.length) {
          reject(new Error(`Invalid image index: ${index}`));
          return;
        }

        if (loadedImages[index]) {
          resolve();
          return;
        }

        const img = new Image();

        img.onload = () => {
          setLoadedImages((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });

          setPreloadedImages((prev) => {
            const newImages = [...prev];
            newImages[index] = img;
            return newImages;
          });

          resolve();
        };

        img.onerror = (error) => {
          console.error(`❌ Error loading image ${index}:`, error);
          reject(new Error(`Failed to load image at index ${index}`));
        };

        img.src = imageUrls[index];
      });
    },
    [imageUrls, loadedImages]
  );

  // 📦 Función para precargar imágenes en lotes
  const preloadImageBatch = useCallback(
    async (startIndex: number, batchSize: number) => {
      const endIndex = Math.min(startIndex + batchSize, imageUrls.length);
      const promises: Promise<void>[] = [];

      for (let i = startIndex; i < endIndex; i++) {
        if (!loadedImages[i]) {
          promises.push(loadSpecificImage(i));
        }
      }

      try {
        await Promise.allSettled(promises);
        console.log(`✅ Batch loaded: ${startIndex}-${endIndex - 1}`);
      } catch (error) {
        console.error(
          `❌ Error loading batch ${startIndex}-${endIndex - 1}:`,
          error
        );
      }
    },
    [imageUrls.length, loadedImages, loadSpecificImage]
  );

  // 🚀 Estrategia de precarga inteligente
  useEffect(() => {
    if (imageUrls.length === 0) return;

    const preloadImages = async () => {
      console.log(`🖼️ Starting preload of ${imageUrls.length} images...`);

      if (preloadAll) {
        // Estrategia 1: Precargar las primeras imágenes inmediatamente
        await preloadImageBatch(0, Math.min(3, imageUrls.length));

        // Estrategia 2: Precargar el resto en lotes para no bloquear la UI
        for (let i = 3; i < imageUrls.length; i += preloadBatch) {
          // Pequeño delay entre lotes para mejor UX
          await new Promise((resolve) => setTimeout(resolve, 100));
          await preloadImageBatch(i, preloadBatch);
        }
      } else {
        // Solo precargar las primeras imágenes críticas
        await preloadImageBatch(0, preloadBatch);
      }
    };

    preloadImages();
  }, [imageUrls, preloadAll, preloadBatch, preloadImageBatch]);

  // 🔄 Reset function
  const resetPreloader = useCallback(() => {
    setLoadedImages(new Array(imageUrls.length).fill(false));
    setPreloadedImages([]);
  }, [imageUrls.length]);

  // 🧹 Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Limpiar referencias de imágenes
      setPreloadedImages([]);
    };
  }, []);

  return {
    loadedImages,
    loadingProgress,
    isAllLoaded,
    preloadedImages,
    loadSpecificImage,
    resetPreloader,
  };
};

// 🎯 Hook simplificado para un solo producto
export const useProductImagePreloader = (
  productId: string,
  totalImages: number
) => {
  const imageUrls = Array.from({ length: totalImages }, (_, index) => {
    const paddedFrame = String(index + 1).padStart(3, "0");
    // Usar tus imágenes reales de Cloudinary
    return `https://res.cloudinary.com/dzwmruhg/image/upload/c_fit,w_800,h_600,q_auto,f_auto/360/Truck_${paddedFrame}.png`;
  });

  return useImagePreloader({
    imageUrls,
    preloadAll: true,
    preloadBatch: 8,
  });
};

export default useImagePreloader;
