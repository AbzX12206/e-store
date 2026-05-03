import { useState, useRef, useEffect } from 'react';
import { useConfiguratorStore } from '../../store/configuratorStore';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from '@hello-pangea/dnd';
import type { TextOptions } from '../../engine/CanvasEngine';
import { useAppStore } from '../../store/appStore';
import { translations } from '../../data/translations';

const FONTS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Brush Script', value: 'Brush Script MT' },
];

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState<'design' | 'files'>('design');
  const {
    engine,
    layers,
    addLayer,
    removeLayer,
    reorderLayers,
    selectedLayerId,
    refreshLayersFromEngine
  } = useConfiguratorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { language } = useAppStore();
  const t = translations[language].config;

  // Text editing state
  const [textOptions, setTextOptions] = useState<TextOptions>({
    fontFamily: 'Inter',
    fontSize: 40,
    fill: '#000000'
  });

  // Refresh layers from engine on mount and when layers change externally
  useEffect(() => {
    refreshLayersFromEngine();
  }, []);

  // Update text options when selected layer changes
  useEffect(() => {
    if (selectedLayerId && engine) {
      const obj = engine.getActiveObject();
      if (obj && obj.type === 'i-text') {
        const textObj = obj as any;
        setTextOptions({
          fontFamily: textObj.fontFamily || 'Inter',
          fontSize: textObj.fontSize || 40,
          fill: textObj.fill || '#000000'
        });
      }
    }
  }, [selectedLayerId, engine]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !engine) return;

    try {
      const id = await engine.addImage(file);
      addLayer({ id, type: 'image', name: file.name });
      refreshLayersFromEngine();
    } catch (err) {
      console.error("Failed to add image", err);
    }
  };

  const handleAddText = () => {
    if (!engine) return;
    const id = engine.addText('RUX', textOptions);
    addLayer({ id, type: 'text', name: 'RUX' });
    refreshLayersFromEngine();
  };

  const handleDeleteLayer = (id: string) => {
    removeLayer(id);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderLayers(result.source.index, result.destination.index);
  };

  const handleTextOptionChange = (key: keyof TextOptions, value: string | number) => {
    const newOptions = { ...textOptions, [key]: value };
    setTextOptions(newOptions);
    
    if (selectedLayerId && engine) {
      engine.updateText(selectedLayerId, { [key]: value });
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const isTextSelected = selectedLayer?.type === 'text';

  return (
    <aside className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0 relative z-10 transition-colors duration-300">
      {/* Tabs */}
      <div className="flex p-2 gap-1 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'design'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          {t.design}
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'files'
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          {t.files}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {activeTab === 'design' ? (
          <>
            {/* Add Elements */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {t.addElements}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    🖼️
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.uploadImage}</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />

                <button 
                  onClick={handleAddText}
                  className="flex flex-col items-center justify-center gap-2 aspect-square rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-brand-500/50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-lg">
                    T
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t.addText}</span>
                </button>
              </div>
            </div>

            {/* Print Templates */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {t.printTemplates}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Image Templates */}
                {[
                  { src: '/1.png', name: 'Caspian' },
                  { src: '/2.png', name: 'AKTAU' },
                  { src: '/3.png', name: 'Caspian Sea' },
                ].map((tpl) => (
                  <button
                    key={tpl.src}
                    onClick={async () => {
                      if (!engine) return;
                      const id = Math.random().toString(36).substr(2, 9);
                      try {
                        await engine.addImageFromUrl(tpl.src, id);
                        addLayer({ id, type: 'image', name: tpl.name });
                        refreshLayersFromEngine();
                      } catch (err) {
                        console.error('Failed to add template', err);
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 hover:shadow-sm transition-all group"
                  >
                    <img
                      src={tpl.src}
                      alt={tpl.name}
                      className="w-full aspect-square object-contain rounded-lg bg-gray-50 dark:bg-gray-900 p-1 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight truncate w-full">{tpl.name}</span>
                  </button>
                ))}

                {/* Text Templates */}
                <button 
                  onClick={() => {
                    if (!engine) return;
                    const id1 = engine.addText('RUX', { fontSize: 80, fontFamily: 'Impact', fill: '#e94560' });
                    addLayer({ id: id1, type: 'text', name: 'RUX Logo' });
                    const id2 = engine.addText('COLLECTION', { fontSize: 30, fontFamily: 'Inter', fill: '#2d3436' });
                    addLayer({ id: id2, type: 'text', name: 'COLLECTION' });
                    // Quick hack to offset the second text slightly below
                    const obj2 = (engine as any).objectMap.get(id2);
                    if (obj2) {
                      obj2.top += 60;
                      (engine as any).canvas.requestRenderAll();
                    }
                    refreshLayersFromEngine();
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 hover:shadow-sm transition-all"
                >
                  <div className="w-full aspect-square rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <span className="font-display font-bold text-lg text-brand-500 leading-none">RUX</span>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">Brand Combo</span>
                </button>
                <button 
                  onClick={() => {
                    if (!engine) return;
                    const id = engine.addText('EST. 2026', { fontSize: 40, fontFamily: 'Georgia', fill: '#000000' });
                    addLayer({ id, type: 'text', name: 'EST. 2026' });
                    refreshLayersFromEngine();
                  }}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 hover:shadow-sm transition-all"
                >
                  <div className="w-full aspect-square rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                    <span className="font-serif font-bold text-base text-gray-800 dark:text-gray-200 leading-none">EST. 2026</span>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">Vintage Text</span>
                </button>
              </div>
            </div>

            {/* Text Controls - Only show when text layer selected */}
            {isTextSelected && (
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-brand-500/30">
                <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-3">
                  {t.textProperties}
                </p>
                
                <div className="space-y-3">
                  {/* Font Family */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t.font}</label>
                    <select
                      value={textOptions.fontFamily}
                      onChange={(e) => handleTextOptionChange('fontFamily', e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500"
                    >
                      {FONTS.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      {t.size}: {textOptions.fontSize}px
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={120}
                      value={textOptions.fontSize}
                      onChange={(e) => handleTextOptionChange('fontSize', parseInt(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t.color}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textOptions.fill}
                        onChange={(e) => handleTextOptionChange('fill', e.target.value)}
                        className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 p-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={textOptions.fill}
                        onChange={(e) => handleTextOptionChange('fill', e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 text-sm text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layers with Drag & Drop */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.layers} ({layers.length})
                </p>
                {layers.length > 0 && (
                  <button
                    onClick={() => useConfiguratorStore.getState().clearLayers()}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-accent-500 dark:hover:text-accent-400 transition-colors"
                  >
                    {t.clearAll}
                  </button>
                )}
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="layers">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-1"
                    >
                      {layers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 italic border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                          {t.noLayers}
                        </div>
                      ) : (
                        layers.map((layer, index) => (
                          <Draggable key={layer.id} draggableId={layer.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-2 p-2.5 rounded-lg border group cursor-grab active:cursor-grabbing ${
                                  selectedLayerId === layer.id
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500'
                                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                                onClick={() => {
                                  // Select object in canvas
                                  const obj = (engine as any)?.objectMap?.get(layer.id);
                                  if (obj) {
                                    (engine as any)?.canvas?.setActiveObject(obj);
                                    (engine as any)?.canvas?.requestRenderAll();
                                  }
                                }}
                              >
                                <div className="text-gray-400 px-0.5">⋮⋮</div>
                                <div className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                                  layer.type === 'image' 
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                                    : 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400'
                                }`}>
                                  {layer.type === 'image' ? '🖼️' : 'T'}
                                </div>
                                <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {layer.name}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLayer(layer.id);
                                  }}
                                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-accent-500 dark:hover:text-accent-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                                  title="Delete layer"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.noFiles}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
