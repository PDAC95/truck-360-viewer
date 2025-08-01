// client/src/components/Viewer360/Viewer360ThreeJS.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

interface Viewer360ThreeJSProps {
  productId: string;
  totalImages: number;
  onFrameChange?: (frame: number) => void;
  className?: string;
}

const Viewer360ThreeJS: React.FC<Viewer360ThreeJSProps> = ({
  productId,
  totalImages = 40,
  onFrameChange,
  className = "",
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const frameRef = useRef<number>(0);

  // Estados de interacción
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedTextures, setLoadedTextures] = useState<boolean[]>(
    new Array(totalImages).fill(false)
  );
  const [currentFrame, setCurrentFrame] = useState(0);

  // Mouse/Touch control
  const mouseRef = useRef({ x: 0, y: 0 });
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  // 🔧 Generar URL correcta de Cloudinary
  const getImageUrl = useCallback((index: number): string => {
    const paddedFrame = String(index + 1).padStart(3, "0");
    return `https://res.cloudinary.com/dzwmrurhg/image/upload/v1754074682/Truck_${paddedFrame}.png`;
  }, []);

  // 🎬 Inicializar Three.js Scene
  const initThreeJS = useCallback(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Crear geometría del camión (plano que rotará)
    const geometry = new THREE.PlaneGeometry(3, 2);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    mountRef.current.appendChild(renderer.domElement);

    // Iniciar render loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (meshRef.current && !isDragging) {
        // Rotación suave automática muy lenta (opcional)
        // meshRef.current.rotation.y += 0.001;
      }

      renderer.render(scene, camera);
    };
    animate();
  }, [isDragging]);

  // 🖼️ Precargar todas las texturas
  const loadTextures = useCallback(async () => {
    setIsLoading(true);
    const loader = new THREE.TextureLoader();
    const loadPromises: Promise<THREE.Texture>[] = [];

    for (let i = 0; i < totalImages; i++) {
      const promise = new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(
          getImageUrl(i),
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.format = THREE.RGBAFormat;

            // Marcar como cargada
            setLoadedTextures((prev) => {
              const newState = [...prev];
              newState[i] = true;
              return newState;
            });

            resolve(texture);
          },
          undefined,
          (error) => {
            console.error(`Error loading texture ${i}:`, error);
            reject(error);
          }
        );
      });
      loadPromises.push(promise);
    }

    try {
      const textures = await Promise.all(loadPromises);
      texturesRef.current = textures;

      // Aplicar primera textura
      if (meshRef.current && textures[0]) {
        (meshRef.current.material as THREE.MeshBasicMaterial).map = textures[0];
        (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate =
          true;
      }

      setIsLoading(false);
      console.log("✅ All textures loaded successfully");
    } catch (error) {
      console.error("❌ Error loading textures:", error);
      setIsLoading(false);
    }
  }, [totalImages, getImageUrl]);

  // 🔄 Cambiar frame/textura
  const changeFrame = useCallback(
    (newFrame: number) => {
      if (!meshRef.current || !texturesRef.current[newFrame]) return;

      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.map = texturesRef.current[newFrame];
      material.needsUpdate = true;

      frameRef.current = newFrame;
      setCurrentFrame(newFrame);

      if (onFrameChange) {
        onFrameChange(newFrame + 1); // +1 para índice basado en 1
      }
    },
    [onFrameChange]
  );

  // 🖱️ Controles de Mouse
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    const rect = mountRef.current?.getBoundingClientRect();
    if (rect) {
      prevMouseRef.current.x = event.clientX - rect.left;
      prevMouseRef.current.y = event.clientY - rect.top;
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !mountRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;

      const deltaX = mouseRef.current.x - prevMouseRef.current.x;

      // Convertir movimiento horizontal a frame
      const sensitivity = 3; // Ajustar sensibilidad
      const frameChange = Math.floor(Math.abs(deltaX) / sensitivity);

      if (frameChange > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        let newFrame = frameRef.current + direction * frameChange;

        // Wrap around
        if (newFrame >= totalImages) newFrame = 0;
        if (newFrame < 0) newFrame = totalImages - 1;

        changeFrame(newFrame);
        prevMouseRef.current = { ...mouseRef.current };
      }
    },
    [isDragging, totalImages, changeFrame]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 📱 Controles Touch
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    const rect = mountRef.current?.getBoundingClientRect();
    if (rect && event.touches[0]) {
      prevMouseRef.current.x = event.touches[0].clientX - rect.left;
      prevMouseRef.current.y = event.touches[0].clientY - rect.top;
    }
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!isDragging || !mountRef.current || !event.touches[0]) return;

      event.preventDefault();
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = event.touches[0].clientX - rect.left;
      mouseRef.current.y = event.touches[0].clientY - rect.top;

      const deltaX = mouseRef.current.x - prevMouseRef.current.x;

      const sensitivity = 2; // Más sensible en móvil
      const frameChange = Math.floor(Math.abs(deltaX) / sensitivity);

      if (frameChange > 0) {
        const direction = deltaX > 0 ? 1 : -1;
        let newFrame = frameRef.current + direction * frameChange;

        if (newFrame >= totalImages) newFrame = 0;
        if (newFrame < 0) newFrame = totalImages - 1;

        changeFrame(newFrame);
        prevMouseRef.current = { ...mouseRef.current };
      }
    },
    [isDragging, totalImages, changeFrame]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 🔧 Manejar resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // 🚀 Efectos de inicialización
  useEffect(() => {
    initThreeJS();
    loadTextures();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      // Cleanup
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }

      // Dispose textures
      texturesRef.current.forEach((texture) => texture.dispose());
    };
  }, [initThreeJS, loadTextures, handleResize]);

  // 📊 Calcular progreso de carga
  const loadingProgress =
    (loadedTextures.filter(Boolean).length / totalImages) * 100;

  return (
    <div className={`viewer-360-threejs ${className}`}>
      <div
        ref={mountRef}
        className="viewer-container position-relative"
        style={{
          width: "100%",
          height: "500px",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          overflow: "hidden",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(0,0,0,0.8)",
              zIndex: 10,
              borderRadius: "16px",
            }}
          >
            <div className="text-center text-white">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="fw-semibold mb-2">Loading 3D Viewer</h5>
              <p className="text-secondary mb-3">
                Preparing {totalImages} high-resolution textures...
              </p>
              <div
                className="progress"
                style={{ width: "300px", height: "4px" }}
              >
                <div
                  className="progress-bar bg-primary"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <small className="text-secondary mt-2 d-block">
                {Math.round(loadingProgress)}% loaded
              </small>
            </div>
          </div>
        )}

        {/* Frame Counter */}
        {!isLoading && (
          <div
            className="position-absolute top-0 end-0 m-3"
            style={{ zIndex: 5 }}
          >
            <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
              <span className="text-white fw-medium">
                {String(currentFrame + 1).padStart(2, "0")}
              </span>
              <span className="text-secondary mx-1">/</span>
              <span className="text-secondary">{totalImages}</span>
            </span>
          </div>
        )}

        {/* Controls */}
        {!isLoading && (
          <div
            className="position-absolute bottom-0 start-50 translate-middle-x mb-3"
            style={{ zIndex: 5 }}
          >
            <div className="glass-minimal rounded-pill px-4 py-2">
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-sm btn-outline-light rounded-pill px-3"
                  onClick={() => changeFrame(0)}
                  style={{ fontSize: "0.75rem" }}
                >
                  🔄 Reset
                </button>
                <small className="text-white">
                  Drag to rotate • Smooth control
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Drag Indicator */}
        {isDragging && !isLoading && (
          <div
            className="position-absolute top-50 start-50 translate-middle"
            style={{ zIndex: 5 }}
          >
            <div className="bg-primary bg-opacity-75 rounded-pill px-3 py-2">
              <small className="text-white fw-medium">
                🔄 Rotating 3D Model...
              </small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Viewer360ThreeJS;
