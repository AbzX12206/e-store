import * as fabric from 'fabric';

export interface TextOptions {
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
}

export class CanvasEngine {
  private canvas: fabric.Canvas;
  private objectMap: Map<string, fabric.Object> = new Map();
  private onSelectionChange?: (obj: fabric.Object | null) => void;
  private _zoom = 1;

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
      backgroundColor: 'transparent',
    });

    this.canvas.on('selection:created', () =>
      this.onSelectionChange?.(this.canvas.getActiveObject() ?? null)
    );
    this.canvas.on('selection:updated', () =>
      this.onSelectionChange?.(this.canvas.getActiveObject() ?? null)
    );
    this.canvas.on('selection:cleared', () => this.onSelectionChange?.(null));
  }

  // No-op kept for compatibility
  public setBaseColor(_hex: string) {}
  public setView(_m: string, _s: string, _sh?: string) {}

  public zoomIn() {
    this._zoom = Math.min(this._zoom * 1.2, 4);
    this.canvas.setZoom(this._zoom);
    this.canvas.requestRenderAll();
  }

  public zoomOut() {
    this._zoom = Math.max(this._zoom / 1.2, 0.5);
    this.canvas.setZoom(this._zoom);
    this.canvas.requestRenderAll();
  }

  public resetZoom() {
    this._zoom = 1;
    this.canvas.setZoom(1);
    this.canvas.absolutePan({ x: 0, y: 0 } as fabric.Point);
    this.canvas.requestRenderAll();
  }

  public async addImage(file: File): Promise<string> {
    const id = generateId();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          await this.addImageFromUrl(e.target?.result as string, id);
          resolve(id);
        } catch (err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    if (fImg.width > this.canvas.width! * 0.6) fImg.scaleToWidth(this.canvas.width! * 0.6);
    (fImg as any).id = id;
    this.canvas.add(fImg);
    this.objectMap.set(id, fImg);
    this.canvas.setActiveObject(fImg);
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
    this.canvas.requestRenderAll();
    return id;
  }

  public updateText(id: string, options: TextOptions): boolean {
    const obj = this.objectMap.get(id);
    if (!obj || obj.type !== 'i-text') return false;
    const t = obj as fabric.IText;
    if (options.fontFamily) t.set('fontFamily', options.fontFamily);
    if (options.fontSize)   t.set('fontSize', options.fontSize);
    if (options.fill)       t.set('fill', options.fill);
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
    const objs = [...this.canvas.getObjects()];
    const ci = objs.indexOf(obj);
    if (ci === -1) return false;
    objs.splice(ci, 1);
    objs.splice(newIndex, 0, obj);
    this.canvas.remove(...this.canvas.getObjects());
    objs.forEach(o => this.canvas.add(o));
    this.canvas.requestRenderAll();
    return true;
  }

  public bringToFront(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (obj) { this.canvas.bringObjectToFront(obj); this.canvas.requestRenderAll(); }
    return !!obj;
  }

  public sendToBack(id: string): boolean {
    const obj = this.objectMap.get(id);
    if (obj) { this.canvas.sendObjectToBack(obj); this.canvas.requestRenderAll(); }
    return !!obj;
  }

  public getLayerIndex(id: string): number {
    const obj = this.objectMap.get(id);
    if (!obj) return -1;
    return this.canvas.getObjects().indexOf(obj);
  }

  public getActiveObject(): any { return this.canvas.getActiveObject(); }

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
    return this.canvas.toDataURL({ format: 'png', multiplier: 2 });
  }

  public getAllLayers(): { id: string; type: 'image' | 'text'; name: string }[] {
    return this.canvas.getObjects()
      .map(obj => {
        const id = (obj as any).id;
        if (!id || !this.objectMap.has(id)) return null;
        const type = obj.type === 'i-text' ? 'text' : 'image';
        const name = type === 'text'
          ? (obj as fabric.IText).text?.substring(0, 20) || 'Text'
          : 'Image';
        return { id, type, name } as { id: string; type: 'image' | 'text'; name: string };
      })
      .filter(Boolean)
      .reverse() as { id: string; type: 'image' | 'text'; name: string }[];
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  public dispose() { this.canvas.dispose(); }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
