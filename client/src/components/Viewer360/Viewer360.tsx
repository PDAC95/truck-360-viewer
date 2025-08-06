// client/src/components/Viewer360/Viewer360.tsx
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import { Viewer360Props } from "../../types";

interface Viewer360Handle {
  setFrame: (frame: number) => void;
  getCurrentFrame: () => number;
}

const Viewer360 = forwardRef<
  Viewer360Handle,
  Viewer360Props & { currentFrame?: number }
>(
  (
    { productId, totalImages = 16, currentFrame: externalFrame, onFrameChange },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const texturesRef = useRef<THREE.Texture[]>([]);
    const frameRef = useRef<number>(0);
    const animationIdRef = useRef<number | null>(null);

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

    // 🔗 Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
      setFrame: (frame: number) => {
        changeFrame(frame - 1);
      },
      getCurrentFrame: () => frameRef.current + 1,
    }));

    // 🔧 Generar URL correcta de Cloudinary
    const getImageUrl = useCallback((index: number): string => {
      const paddedFrame = String(index + 1).padStart(3, "0");
      return `https://res.cloudinary.com/dzwmrurhg/image/upload/v1754484517/Truck_${paddedFrame}.png`;
    }, []);

    // 🎬 Inicializar Three.js Scene
    const initThreeJS = useCallback(() => {
      if (!mountRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      console.log("🎯 Initializing Three.js:", { width, height });

      // Scene con el mismo gris que el panel
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x111827);
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

      // Canvas styling mínimo necesario
      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.zIndex = "1";
      canvas.style.display = "block";

      // Crear geometría del camión
      const geometry = new THREE.PlaneGeometry(3, 2);
      const material = new THREE.MeshBasicMaterial({
        transparent: true,
        alphaTest: 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      meshRef.current = mesh;

      mountRef.current.appendChild(canvas);
      console.log("✅ Canvas added to DOM");

      // Render loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    }, []);

    // 🖼️ Precargar todas las texturas
    const loadTextures = useCallback(async () => {
      setIsLoading(true);
      const loader = new THREE.TextureLoader();
      const loadPromises: Promise<THREE.Texture>[] = [];

      console.log(`🖼️ Loading ${totalImages} textures...`);

      for (let i = 0; i < totalImages; i++) {
        const promise = new Promise<THREE.Texture>((resolve, reject) => {
          loader.load(
            getImageUrl(i),
            (texture) => {
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              texture.format = THREE.RGBAFormat;

              setLoadedTextures((prev) => {
                const newState = [...prev];
                newState[i] = true;
                return newState;
              });

              console.log(`✅ Texture ${i + 1}/${totalImages} loaded`);
              resolve(texture);
            },
            undefined,
            (error) => {
              console.error(`❌ Error loading texture ${i + 1}:`, error);
              reject(error);
            }
          );
        });
        loadPromises.push(promise);
      }

      try {
        const textures = await Promise.all(loadPromises);
        texturesRef.current = textures;

        if (meshRef.current && textures[0]) {
          (meshRef.current.material as THREE.MeshBasicMaterial).map =
            textures[0];
          (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate =
            true;
        }

        setIsLoading(false);
        console.log("🎉 All textures loaded successfully");
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
          onFrameChange(newFrame + 1);
        }
      },
      [onFrameChange]
    );

    // 📡 Sincronizar con frame externo
    useEffect(() => {
      if (
        externalFrame !== undefined &&
        externalFrame !== frameRef.current + 1 &&
        !isDragging
      ) {
        changeFrame(externalFrame - 1);
      }
    }, [externalFrame, isDragging, changeFrame]);

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

        const sensitivity = 4;
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

        const sensitivity = 3;
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
      if (!mountRef.current || !rendererRef.current || !cameraRef.current)
        return;

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

        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }

        if (rendererRef.current && mountRef.current) {
          mountRef.current.removeChild(rendererRef.current.domElement);
          rendererRef.current.dispose();
        }

        texturesRef.current.forEach((texture) => texture.dispose());
      };
    }, [initThreeJS, loadTextures, handleResize]);

    // 📊 Calcular progreso de carga
    const loadingProgress =
      (loadedTextures.filter(Boolean).length / totalImages) * 100;

    return (
      <div className="viewer-360-component">
        <div
          ref={mountRef}
          className="viewer-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Loading Overlay */}
          {isLoading ? (
            <div className="viewer-loading-overlay">
              <div className="loading-content">
                <div className="loading-indicator"></div>
                <h3>Loading 3D Viewer</h3>
                <p>Preparing {totalImages} high-resolution textures...</p>
                <div className="loading-progress-container">
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <small className="loading-percentage">
                    {Math.round(loadingProgress)}% loaded
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Frame Counter */}
              <div className="viewer-frame-counter">
                <span className="frame-current">
                  {String(currentFrame + 1).padStart(2, "0")}
                </span>
                <span className="frame-separator">/</span>
                <span className="frame-total">{totalImages}</span>
              </div>

              {/* Controls */}
              <div className="viewer-controls">
                <div className="controls-container">
                  <button
                    className="btn btn-sm btn-outline-light rounded-pill px-3 control-reset"
                    onClick={() => changeFrame(0)}
                  >
                    🔄 Reset
                  </button>
                  <small className="control-hint">
                    Drag to rotate • 3D Control
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);

export default Viewer360;
