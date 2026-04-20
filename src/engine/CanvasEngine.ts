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
      backgroundColor: 'transparent'
    });

    this.baseColorRect = new fabric.Rect({
      left: -1000,
      top: -1000,
      width: 3000,
      height: 3000,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      globalCompositeOperation: 'source-over',
    });

    this.canvas.add(this.baseColorRect);

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

  private sortLayers() {
    const activeObjects = this.canvas.getActiveObjects();
    
    const userObjects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );
    
    this.canvas.remove(...this.canvas.getObjects());
    
    // 1. Base Color
    this.baseColorRect.set('globalCompositeOperation', 'source-over');
    this.canvas.add(this.baseColorRect);
    
    // 2. User Objects
    userObjects.forEach(obj => {
      obj.set('globalCompositeOperation', 'source-over');
      this.canvas.add(obj);
    });
    
    // 3. Shadow Layer
    if (this.shadowLayer) {
      this.shadowLayer.set('globalCompositeOperation', 'multiply');
      this.canvas.add(this.shadowLayer);
    }
    
    // 4. Sheen Layer
    if (this.sheenLayer) {
      this.sheenLayer.set('globalCompositeOperation', 'screen');
      this.canvas.add(this.sheenLayer);
    }
    
    if (activeObjects.length > 0) {
      this.canvas.setActiveObject(activeObjects[0]);
    }
    this.canvas.requestRenderAll();
  }

  public async setBaseColor(hex: string) {
    this.baseColorRect.set({ fill: hex });
    this.canvas.requestRenderAll();
  }

  public async setView(maskUrl: string, shadowUrl: string, sheenUrl?: string) {
    if (this.shadowLayer) {
      this.canvas.remove(this.shadowLayer);
      this.shadowLayer = null;
    }
    if (this.sheenLayer) {
      this.canvas.remove(this.sheenLayer);
      this.sheenLayer = null;
    }

    try {
      const shadowEl = await this.loadImage(shadowUrl);
      
      const width = this.canvas.width!;
      const height = this.canvas.height!;

      this.shadowLayer = new fabric.FabricImage(shadowEl, {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        selectable: false,
        evented: false,
        opacity: 0.9,
        scaleX: width / shadowEl.width,
        scaleY: height / shadowEl.height,
      });

      if (sheenUrl) {
        try {
          const sheenEl = await this.loadImage(sheenUrl);
          this.sheenLayer = new fabric.FabricImage(sheenEl, {
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
            opacity: 0.7,
            scaleX: width / sheenEl.width,
            scaleY: height / sheenEl.height,
          });
        } catch (e) {
          console.warn("Failed to load sheen layer", e);
        }
      }
      
      this.sortLayers();
    } catch (e) {
      console.error("Failed to load view assets", e);
    }
  }

  public async addImage(file: File, useAPI: boolean = true): Promise<string> {
    const id = generateId();

    if (useAPI) {
      try {
        const url = await this.uploadImageToAPI(file);
        await this.addImageFromUrl(url, id);
        return id;
      } catch (err) {
        console.warn('API upload failed, using FileReader fallback:', err);
      }
    }

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
    this.sortLayers();
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
    this.sortLayers();

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
    this.sortLayers();
    return true;
  }

  public moveLayer(id: string, newIndex: number): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    const userObjects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );
    
    const currentIndex = userObjects.indexOf(obj);
    if (currentIndex === -1) return false;

    userObjects.splice(currentIndex, 1);
    userObjects.splice(newIndex, 0, obj);

    this.canvas.remove(...this.canvas.getObjects());
    this.canvas.add(this.baseColorRect);
    userObjects.forEach(o => this.canvas.add(o));
    if (this.shadowLayer) this.canvas.add(this.shadowLayer);
    if (this.sheenLayer) this.canvas.add(this.sheenLayer);
    
    this.canvas.requestRenderAll();
    return true;
  }

  public bringToFront(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    const userObjects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );
    
    const currentIndex = userObjects.indexOf(obj);
    if (currentIndex > -1) {
      userObjects.splice(currentIndex, 1);
      userObjects.push(obj);
      
      this.canvas.remove(...this.canvas.getObjects());
      this.canvas.add(this.baseColorRect);
      userObjects.forEach(o => this.canvas.add(o));
      if (this.shadowLayer) this.canvas.add(this.shadowLayer);
      if (this.sheenLayer) this.canvas.add(this.sheenLayer);
      
      this.canvas.requestRenderAll();
    }
    return true;
  }

  public sendToBack(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (!obj) return false;

    const userObjects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );
    
    const currentIndex = userObjects.indexOf(obj);
    if (currentIndex > -1) {
      userObjects.splice(currentIndex, 1);
      userObjects.unshift(obj);
      
      this.canvas.remove(...this.canvas.getObjects());
      this.canvas.add(this.baseColorRect);
      userObjects.forEach(o => this.canvas.add(o));
      if (this.shadowLayer) this.canvas.add(this.shadowLayer);
      if (this.sheenLayer) this.canvas.add(this.sheenLayer);
      
      this.canvas.requestRenderAll();
    }
    return true;
  }

  public getLayerIndex(id: string): number {
    const obj = this.objectMap.get(id);
    if (!obj) return -1;

    const userObjects = this.canvas.getObjects().filter(o => 
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );
    return userObjects.indexOf(obj);
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
    this.sortLayers();
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
      o !== this.baseColorRect && o !== this.shadowLayer && o !== this.sheenLayer
    );

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
