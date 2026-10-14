import { Component, OnInit, inject, signal } from '@angular/core';
import { IonHeader,IonToolbar,IonTitle,IonContent,IonGrid,IonRow,IonCol,IonFab,IonFabButton,IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { camera } from 'ionicons/icons';
import { PhotoService } from '../services/photo.service';
@Component({selector:'app-tab2',standalone:true,templateUrl:'./tab2.page.html',styleUrls:['./tab2.page.scss'],
 imports:[IonHeader,IonToolbar,IonTitle,IonContent,IonGrid,IonRow,IonCol,IonFab,IonFabButton,IonIcon]})
export class Tab2Page implements OnInit {
 public readonly photoService=inject(PhotoService);
 public readonly busy=signal(true);
 public readonly message=signal('');
 constructor() { addIcons({camera}); }
 async ngOnInit(): Promise<void> {
  try { await this.photoService.loadSaved(); }
  catch(error) { console.error(error); this.message.set('No se pudieron cargar las fotos guardadas.'); }
  finally { this.busy.set(false); }
 }
 async addPhotoToGallery(): Promise<void> {
  if(this.busy()) return;
  this.busy.set(true);this.message.set('');
  try { await this.photoService.addNewToGallery(); }
  catch(error) {
   const detail=error instanceof Error ? error.message : String(error);
   if(/cancel|dismiss/i.test(detail)) this.message.set('Captura cancelada.');
   else { console.error(error);this.message.set('No se pudo tomar o guardar la foto. Revisa los permisos y el espacio disponible.'); }
  } finally { this.busy.set(false); }
 }
}
