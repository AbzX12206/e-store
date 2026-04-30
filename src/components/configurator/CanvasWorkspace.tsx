import { useEffect, useRef } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import { CanvasEngine } from '../../engine/CanvasEngine';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../data/translations';

/**
 * Key insight: Fabric.js wraps the <canvas> element in its own DOM nodes.
 * If React also manages that canvas element, React's reconciler crashes on
 * view-switch with "insertBefore: node is not a child" errors.
 *
 * Fix: we give Fabric a dedicated <div ref={fabricHostRef}> and create the
 * canvas element programmatically inside it — React never touches it.
 */
export default function CanvasWorkspace() {
  const {
    activeView,
    setView,
    activeProduct,
    setEngine,
    setSelectedLayerId,
    refreshLayersFromEngine,
    selectedColor,
  } = useConfiguratorStore();

  const fabricHostRef = useRef<HTMLDivElement>(null);
  const engineRef     = useRef<CanvasEngine | null>(null);

  const { language } = useAppStore();
  const t = translations[language].config;

  // ── Initialise Fabric once per product ──────────────────────────────────
  useEffect(() => {
    const host = fabricHostRef.current;
    if (!host) return;

    // Create a raw canvas element and append it to the host div.
    // React will never see or reconcile this canvas.
    const canvasEl = document.createElement('canvas');
    host.appendChild(canvasEl);

    const engine = new CanvasEngine(canvasEl, 500, 600, (obj) => {
      setSelectedLayerId(obj ? (obj as any).id : null);
    });
    engineRef.current = engine;
    setEngine(engine);

    return () => {
      engine.dispose();
      engineRef.current = null;
      // Fabric replaces canvasEl with its own wrapper — remove everything
      while (host.firstChild) host.removeChild(host.firstChild);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProduct]);

  // Refresh layer list on view switch
  useEffect(() => { refreshLayersFromEngine(); }, [activeView]);

  const currentView = activeProduct?.views[activeView];

  const handleZoomIn  = () => engineRef.current?.zoomIn();
  const handleZoomOut = () => engineRef.current?.zoomOut();

  return (
    <div className="flex-1 relative bg-gray-100 dark:bg-gray-950 flex flex-col transition-colors duration-300">

      {/* Front / Back toggle */}
      {activeProduct?.views.back && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 p-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-lg flex gap-1 shadow-sm">
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === v
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {v === 'front' ? t.front : t.back}
            </button>
          ))}
        </div>
      )}

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div
          className="w-[500px] h-[600px] relative transition-colors duration-300 rounded-xl"
        >
          {/* Base Background (transparent, just holds layout) */}
          <div className="absolute inset-0 bg-transparent" />

          {/* Layer 1 — Product Color (masked) */}
          {currentView?.maskUrl && (
            <div
              className="absolute inset-0 transition-colors duration-300"
              style={{
                backgroundColor: selectedColor,
                WebkitMaskImage: `url(${currentView.maskUrl})`,
                WebkitMaskSize: 'contain',
                WebkitMaskPosition: 'center',
                WebkitMaskRepeat: 'no-repeat',
                maskImage: `url(${currentView.maskUrl})`,
                maskSize: 'contain',
                maskPosition: 'center',
                maskRepeat: 'no-repeat',
              }}
            />
          )}

          {/* If no mask, fallback to full background */}
          {!currentView?.maskUrl && (
            <div
              className="absolute inset-0 transition-colors duration-300"
              style={{ backgroundColor: selectedColor }}
            />
          )}

          {/* Layer 2 — Fabric.js host (React never touches nodes inside here) */}
          {/* We mask this layer so designs don't spill outside the garment */}
          <div
            className="absolute inset-0 pointer-events-auto"
            style={currentView?.maskUrl ? {
              WebkitMaskImage: `url(${currentView.maskUrl})`,
              WebkitMaskSize: 'contain',
              WebkitMaskPosition: 'center',
              WebkitMaskRepeat: 'no-repeat',
              maskImage: `url(${currentView.maskUrl})`,
              maskSize: 'contain',
              maskPosition: 'center',
              maskRepeat: 'no-repeat',
            } : {}}
          >
             <div ref={fabricHostRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Layer 3 — Product Photo (multiply blends with everything below) */}
          {currentView?.photoUrl && (
            <img
              src={currentView.photoUrl}
              alt="product"
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
              style={{ mixBlendMode: 'multiply' }}
            />
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          title="Zoom in"
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg font-bold"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom out"
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-lg font-bold"
        >
          −
        </button>
      </div>
    </div>
  );
}
