const { app, BrowserWindow } = require('electron');
const path = require('path');
const { testDatabase } = require('./storage/database');
const {autoUpdater} = require('electron-updater');
const logger = require('./logger.js');
const dotenv = require('dotenv');
const { ipcMain } = require('electron');


dotenv.config();
 
   
          
/** 
 * ipcs 
 */ 

 
/* const appStatsIpc = require('./ipc/appStatsIpc');
ipcMain.handle('files', appStatsIpc);
   
 */
 
  
ipcMain.handle('get-app-version', () => {
  return app.getVersion(); // Devuelve la versión de package.json
});
    
const appStatsIpc = require('./ipc/appStatsIpc');

ipcMain.handle('appStats', appStatsIpc);
   
 
const checkUpdatesIpc = require('./ipc/checkUpdatesIpc');

ipcMain.handle('checkUpdates', checkUpdatesIpc);
 
/**
 * database ipc 
 */

  
const databaseIpc = require('./ipc/databaseIpc');
ipcMain.handle('database', databaseIpc);

/** 
 * token ipc
 */
const tokenIpc = require('./ipc/tokenIpc');
ipcMain.handle('token', tokenIpc);

/**
 * password ipc
 */
const passwordIpc = require('./ipc/passwordIpc');
ipcMain.handle('password', passwordIpc);




/**
 * electron main
 */

let mainWindow;
  

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload', 'index.js'),
      nodeIntegration: true,
      contextIsolation: true, // Esto debería ser true en producción
      webSecurity: true, // Activar en producción por seguridad
      nodeIntegrationInWorker: true,
      enableRemoteModule: true // Deprecado en versiones nuevas de Electron
    }
  });

  // Determina qué cargar basado en el ambiente
  if (!app.isPackaged) {
    // Ambiente de desarrollo - Carga desde webpack dev server
    mainWindow.loadURL('http://localhost:3000');
    // Abre las herramientas de desarrollo
    mainWindow.webContents.openDevTools();
    logger.info('Cargando desde servidor de desarrollo');
  } else {
    // Ambiente de producción - Carga el archivo compilado
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    logger.info('Cargando desde archivo local');
  }
 



  // Emitido cuando la ventana es cerrada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
app.whenReady().then(createWindow)/* .then(checkForUpdates); */
 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});