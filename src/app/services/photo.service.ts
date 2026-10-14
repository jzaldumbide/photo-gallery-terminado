import { Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
export interface UserPhoto { filepath: string; webviewPath: string; }
interface StoredPhoto { filepath: string; }
@Injectable({providedIn:'root'})
export class PhotoService {
 private readonly state = signal<UserPhoto[]>([]);
 public readonly photos = this.state.asReadonly();
 private readonly PHOTO_STORAGE = 'esfot.photos.v1';
 private loading?: Promise<void>;
 // Una sola carga compartida evita carreras entre la restauración y la captura.
 public loadSaved(): Promise<void> {
  if (!this.loading) this.loading = this.restore().catch(error => { this.loading = undefined; throw error; });
  return this.loading;
 }
 public async addNewToGallery(): Promise<void> {
  await this.loadSaved();
  // Base64 simplifica la conversión en este ejercicio para web y nativo.
  const photo = await Camera.getPhoto({source:CameraSource.Camera,
   resultType:CameraResultType.Base64,quality:85,width:1600,
   correctOrientation:true,saveToGallery:true});
  if (!photo.base64String) throw new Error('La cámara no devolvió una imagen.');
  const filepath = `${crypto.randomUUID()}.${photo.format}`;
  await Filesystem.writeFile({path:filepath,directory:Directory.Data,data:photo.base64String});
  const next = [{filepath,webviewPath:`data:image/${photo.format};base64,${photo.base64String}`},...this.photos()];
  try {
   await Preferences.set({key:this.PHOTO_STORAGE,value:JSON.stringify(next.map(p=>({filepath:p.filepath})))});
  } catch(error) {
   await Filesystem.deleteFile({path:filepath,directory:Directory.Data}).catch(()=>undefined);
   throw error;
  }
  this.state.set(next);
 }
 private async restore(): Promise<void> {
  const {value} = await Preferences.get({key:this.PHOTO_STORAGE});
  if (!value) { this.state.set([]); return; }
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(p=>p && typeof p.filepath === 'string')) {
   throw new Error('El índice de fotos no es válido.');
  }
  const loaded: UserPhoto[] = [];
  for (const photo of parsed as StoredPhoto[]) {
   const file = await Filesystem.readFile({path:photo.filepath,directory:Directory.Data});
   const format = photo.filepath.split('.').pop() || 'jpeg';
   const webviewPath = typeof file.data === 'string'
    ? `data:image/${format};base64,${file.data}` : await this.blobToDataUrl(file.data);
   loaded.push({filepath:photo.filepath,webviewPath});
  }
  this.state.set(loaded);
 }
 private blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve,reject)=>{
   const reader = new FileReader();
   reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));
   reader.onload=()=>typeof reader.result==='string' ? resolve(reader.result) : reject(new Error('Formato no válido.'));
   reader.readAsDataURL(blob);
  });
 }
}
