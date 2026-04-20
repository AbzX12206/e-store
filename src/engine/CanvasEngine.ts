import * as fabric from 'fabric';

const API_BASE_URL = 'http://localhost:8080';

export interface TextOptions {
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
}

export class CanvasEngine {
  private canvas: fabric.Canvas;
  private shadowLayer: fabric.FabricImage | null = null;
  private sheenLayer: fabric.FabricImage | null = null;
  private maskLayer: fabric.FabricImage | null = null;
  private baseColorRect: fabric.Rect;
  private objectMap: Map<string, fabric.Object> = new Map();
  private onSelectionChange?: (obj: fabric.Object | null) => void;

  constructor(
    canvasElement: HTMLCanvasElement,
    width: number,
    height: number,
    onSelectionChange?: (obj: fabric.Object | null) => void
  ) {
    this.onSelectionChange = onSelectionChange;
    this.canvas = new fabric.Canvas(canvasElement, {
      width,
      height,
      preserveObjectStacking: true,
      backgroundColor: '#f8f9fa'
    });

    this.baseColorRect = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: '#ffffff',
      selectable: false,
      evented: false,
    });

    this.canvas.add(this.baseColorRect);

    // Listen for selection changes
    this.canvas.on('selection:created', () => {
      this.onSelectionChange?.(this.canvas.getActiveObject());
    });
    this.canvas.on('selection:updated', () => {
      this.onSelectionChange?.(this.canvas.getActiveObject());
    });
    this.canvas.on('selection:cleared', () => {
      this.onSelectionChange?.(null);
    });
  }

  public async setBaseColor(hex: string) {
    this.baseColorRect.set({ fill: hex });
    
    // Ensure proper layer stacking order:
    // 1. baseColorRect at bottom
    // 2. maskLayer (destination-in) cuts the shape
    // 3. user objects
    // 4. shadow and sheen on top
    
    this.canvas.bringObjectToFront(this.baseColorRect);
    
    // Bring mask right after base color
    if (this.maskLayer) {
      this.canvas.bringObjectToFront(this.maskLayer);
    }
    
    // Bring shadow and sheen to very top
    if (this.shadowLayer) {
      this.canvas.bringObjectToFront(this.shadowLayer);
    }
    if (this.sheenLayer) {
      this.canvas.bringObjectToFront(this.sheenLayer);
    }
    
    this.canvas.requestRenderAll();
  }

  public async setView(maskUrl: string, shadowUrl: string, sheenUrl?: string) {
    // Remove existing layers
    if (this.shadowLayer) {
      this.canvas.remove(this.shadowLayer);
      this.shadowLayer = null;
    }
    if (this.sheenLayer) {
      this.canvas.remove(this.sheenLayer);
      this.sheenLayer = null;
    }
    if (this.maskLayer) {
      this.canvas.remove(this.maskLayer);
      this.maskLayer = null;
    }

    try {
      const maskEl = await this.loadImage(maskUrl);
      const shadowEl = await this.loadImage(shadowUrl);
      
      const scaleX = this.canvas.width! / maskEl.width;
      const scaleY = this.canvas.height! / maskEl.height;

      // Create product shape layer from the mask
      // This will be the visible product with the selected color
      this.maskLayer = new fabric.FabricImage(maskEl, {
        left: 0,
        top: 0,
        scaleX: scaleX,
        scaleY: scaleY,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
      });

      // Apply mask with destination-in to cut product shape from base color
      this.applyMaskToBaseColor();

      // Create shadow layer with multiply blend
      this.shadowLayer = new fabric.FabricImage(shadowEl, {
        left: 0,
        top: 0,
        scaleX: this.canvas.width! / shadowEl.width,
        scaleY: this.canvas.height! / shadowEl.height,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        globalCompositeOperation: 'multiply',
        opacity: 0.5,
      });

      // Ensure base is at bottom first
      this.canvas.bringObjectToFront(this.baseColorRect);
      
      // Bring mask after base (destination-in cuts the shape)
      if (this.maskLayer) {
        this.canvas.bringObjectToFront(this.maskLayer);
      }
      
      // Add shadow on top
      this.canvas.add(this.shadowLayer);

      // Load and add sheen layer if provided
      if (sheenUrl) {
        try {
          const sheenEl = await this.loadImage(sheenUrl);
          this.sheenLayer = new fabric.FabricImage(sheenEl, {
            left: 0,
            top: 0,
            scaleX: this.canvas.width! / sheenEl.width,
            scaleY: this.canvas.height! / sheenEl.height,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
            // Screen blend mode for specular highlight effect
            globalCompositeOperation: 'screen',
            opacity: 0.7,
          });
          this.canvas.add(this.sheenLayer);
          this.canvas.bringObjectToFront(this.sheenLayer);
        } catch (e) {
          console.warn("Failed to load sheen layer", e);
        }
      }
      
      this.canvas.requestRenderAll();
    } catch (e) {
      console.error("Failed to load view assets", e);
    }
  }

  private applyMaskToBaseColor() {
    if (!this.maskLayer) return;
    
    // The mask defines the product shape (white on transparent)
    // Use destination-in composite to cut the base color to the mask shape
    this.maskLayer.set({
      globalCompositeOperation: 'destination-in',
      visible: true,
      selectable: false,
      evented: false,
    });
    
    // Add mask after base color - it will cut the shape
    this.canvas.add(this.maskLayer);
  }

  // Upload image to API with FileReader fallback
  public async addImage(file: File, useAPI: boolean = true): Promise<string> {
    const id = generateId();

    // Try API upload first if enabled
    if (useAPI) {
      try {
        const url = await this.uploadImageToAPI(file);
        await this.addImageFromUrl(url, id);
        return id;
      } catch (err) {
        console.warn('API upload failed, using FileReader fallback:', err);
      }
    }

    // FileReader fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const dataUrl = e.target?.result as string;
          await this.addImageFromUrl(dataUrl, id);
          resolve(id);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async uploadImageToAPI(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return `${API_BASE_URL}${data.url}`;
  }

  private async addImageFromUrl(url: string, id: string): Promise<void> {
    const imgEl = await this.loadImage(url);
    const fImg = new fabric.FabricImage(imgEl, {
      left: this.canvas.width! / 2,
      top: this.canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      cornerStyle: 'circle',
      transparentCorners: false,
    });

    if (fImg.width > this.canvas.width! * 0.6) {
      fImg.scaleToWidth(this.canvas.width! * 0.6);
    }

    (fImg as any).id = id;
    this.canvas.add(fImg);
    this.objectMap.set(id, fImg);
    this.canvas.setActiveObject(fImg);
    this.bringShadowToFront();
    this.canvas.requestRenderAll();
  }

  public addText(text: string, options?: TextOptions): string {
    const id = generateId();
    const textObj = new fabric.IText(text, {
      left: this.canvas.width! / 2,
      top: this.canvas.height! / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: options?.fontFamily || 'Inter',
      fontSize: options?.fontSize || 40,
      fill: options?.fill || '#000000',
      cornerStyle: 'circle',
      transparentCorners: false,
    });

    (textObj as any).id = id;
    this.canvas.add(textObj);
    this.objectMap.set(id, textObj);
    this.canvas.setActiveObject(textObj);
    this.bringShadowToFront();
    this.canvas.requestRenderAll();

    return id;
  }

  public updateText(id: string, options: TextOptions): boolean {
    const obj = this.objectMap.get(id);
    if (!obj || obj.type !== 'i-text') return false;

    const textObj = obj as fabric.IText;
    if (options.fontFamily) textObj.set('fontFamily', options.fontFamily);
    if (options.fontSize) textObj.set('fontSize', options.fontSize);
    if (options.fill) textObj.set('fill', options.fill);

    this.canvas.requestRenderAll();
    return true;
  }

  public removeObject(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    this.canvas.remove(obj);
    this.objectMap.delete(id);
    this.canvas.requestRenderAll();
    return true;
  }

  public moveLayer(id: string, newIndex: number): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    const objects = this.canvas.getObjects().filter(o => o !== this.baseColorRect && o !== this.shadowLayer);
    const currentIndex = objects.indexOf(obj);
    if (currentIndex === -1) return false;

    if (newIndex > currentIndex) {
      for (let i = currentIndex; i < newIndex && i < objects.length - 1; i++) {
        this.canvas.bringObjectForward(obj);
      }
    } else if (newIndex < currentIndex) {
      for (let i = currentIndex; i > newIndex && i > 0; i--) {
        this.canvas.sendObjectBackwards(obj);
      }
    }

    this.bringShadowToFront();
    this.canvas.requestRenderAll();
    return true;
  }

  public bringToFront(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    this.canvas.bringObjectToFront(obj);
    this.bringShadowToFront();
    this.canvas.requestRenderAll();
    return true;
  }

  public sendToBack(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    this.canvas.sendObjectToBack(obj);
    // Re-add base and shadow order
    this.canvas.sendObjectToBack(this.baseColorRect);
    this.bringShadowToFront();
    this.canvas.requestRenderAll();
    return true;
  }

  public getLayerIndex(id: string): number {
    const obj = this.objectMap.get(id);
    if (!obj) return -1;

    const objects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && this.objectMap.has((o as any).id)
    );
    return objects.indexOf(obj);
  }

  public getActiveObject(): any {
    return this.canvas.getActiveObject();
  }

  public getObjectType(id: string): 'image' | 'text' | null {
    const obj = this.objectMap.get(id);
    if (!obj) return null;
    if (obj.type === 'image' || obj.type === 'fabricImage') return 'image';
    if (obj.type === 'i-text') return 'text';
    return null;
  }

  public clearDesign() {
    this.objectMap.forEach(obj => this.canvas.remove(obj));
    this.objectMap.clear();
    this.canvas.requestRenderAll();
  }

  public exportDesign(): string {
    return this.canvas.toDataURL({
      format: 'png',
      multiplier: 2
    });
  }

  public getAllLayers(): { id: string; type: 'image' | 'text'; name: string }[] {
    const layers: { id: string; type: 'image' | 'text'; name: string }[] = [];

    const objects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer
    );

    // Reverse to show top layer first
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const id = (obj as any).id;
      if (!id || !this.objectMap.has(id)) continue;

      const type = obj.type === 'i-text' ? 'text' : 'image';
      const name = type === 'text' 
        ? (obj as fabric.IText).text?.substring(0, 20) || 'Text Layer'
        : 'Image Layer';

      layers.push({ id, type, name });
    }

    return layers;
  }

  private bringShadowToFront() {
    if (this.shadowLayer) {
      this.canvas.bringObjectToFront(this.shadowLayer);
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }

  public dispose() {
    this.canvas.dispose();
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
