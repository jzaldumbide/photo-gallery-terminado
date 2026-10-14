# Galería ESFOT — Ionic Angular Standalone

Proyecto de las cuatro etapas: iniciar, tomar, guardar y cargar fotografías. Incluye tres pestañas e iconos registrados.

## Requisitos y versiones
Node.js 22 LTS (22.12 o superior de la rama 22), npm y navegador con cámara. Ionic 8 + Angular 20 + Capacitor 7; package-lock.json fija las versiones instaladas. Esta versión usa `@ionic/angular/standalone` en todos los componentes. No mezclar imports con los ejemplos de Ionic 9 de la web.

## Ejecutar
Descomprimir y abrir una terminal en esta carpeta (la que contiene package.json):
```bash
npm ci
npm start
```
Abrir http://localhost:4200. No ejecutar ionic start: el proyecto ya está creado. Opcional: `npm install -g @ionic/cli` y `ionic serve` (normalmente puerto 8100).

## Probar
1. Abrir Fotos y pulsar la cámara.
2. Autorizar la cámara, tomar una foto y confirmar.
3. Tomar otra fotografía.
4. Recargar la página: ambas deben reaparecer.
5. Cambiar pestañas y cancelar otra captura: la aplicación debe seguir funcionando.

## Archivos, paso a paso
| Archivo | Responsabilidad |
|---|---|
| src/main.ts | Arranque Standalone y PWA Elements para la cámara web. |
| src/app/app.routes.ts | Rutas de las tres páginas. |
| src/app/tabs/tabs.page.ts | Imports e iconos home, images e informationCircle. |
| src/app/tabs/tabs.page.html | Única barra inferior de pestañas. |
| src/app/tab2/tab2.page.ts | Carga inicial, botón, espera y mensajes. |
| src/app/tab2/tab2.page.html | Galería con @for y botón flotante. |
| src/app/tab2/tab2.page.scss | Estilos de miniaturas. |
| src/app/services/photo.service.ts | Captura, escritura, índice y recuperación. |
| capacitor.config.ts | Identidad nativa y carpeta www. |

`loadSaved()` recupera las fotos y publica el signal. `addNewToGallery()` captura, escribe con Filesystem, guarda la lista de nombres con Preferences y actualiza el signal. La página lee `photos()` y usa nombres únicos para track.

Adaptación didáctica: se usa CameraResultType.Base64 en lugar de Uri para simplificar el flujo tanto en navegador como en Android. No se necesita el fetch de webPath. Captura con calidad 85 y ancho máximo solicitado de 1600 px. Al cargar se contemplan los resultados string y Blob de Filesystem.

Preferences guarda únicamente nombres, no imágenes completas. Los archivos se almacenan localmente. En navegador dependen del origen (host y puerto): localhost:4200 y localhost:8100 no comparten datos. Borrar datos del sitio, usar modo privado o desinstalar la app puede perderlos. No se suben a una nube ni se añaden al álbum público del teléfono.

## Compilar
```bash
npm run build
```
La salida queda en www/. El ZIP excluye node_modules, www y .angular porque se regeneran. Incluye los archivos fuente y el lockfile.

## Android opcional
Se requiere Android Studio y el entorno compatible con Capacitor 7.
```bash
npm run android:add
npm run android:sync
npm run android:open
```
Ejecutar android:add solo una vez. Después de cambios en web, repetir android:sync. En Android Studio ejecutar en un teléfono o emulador. El ZIP no incluye un APK ni la carpeta Android generada. La captura usa almacenamiento privado y saveToGallery:false; no agregar permisos antiguos de almacenamiento para este flujo.

## Errores comunes
- NG8001: importar cada componente y añadirlo a @Component.imports. No ocultar el error con CUSTOM_ELEMENTS_SCHEMA.
- Icono de Fotos ausente: addIcons({ images }) en tabs.page.ts.
- Cámara ausente: el botón pertenece a tab2.page.html; registrar camera en tab2.page.ts.
- Permiso denegado: autorizar cámara en el navegador y recargar.
- Por IP con HTTP la cámara puede no funcionar: utilizar localhost o HTTPS.
- Foto guardada ausente: comprobar mismo navegador, perfil y puerto. Revisar consola. Si se elimina manualmente un archivo del almacenamiento, fallará la recuperación del índice hasta corregir esos datos.

Es una galería docente pequeña: carga las fotos en memoria y no implementa eliminación, sincronización, publicación ni splash personalizado. En Android se usa la presentación de inicio predeterminada. Para iOS es necesario agregar su plataforma y configurar los permisos de Camera en Xcode, en un Mac.

## Referencias
- https://ionicframework.com/docs/angular/your-first-app
- https://ionicframework.com/docs/angular/your-first-app/taking-photos
- https://ionicframework.com/docs/angular/your-first-app/saving-photos
- https://ionicframework.com/docs/angular/your-first-app/loading-photos
