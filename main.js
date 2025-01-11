const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
let ruletaWindow;

//INICIALIZAR APP
function createMainWindow() {
    if (mainWindow) {
        mainWindow.show(); // Muestra la ventana si ya está creada
        return;
    }
    mainWindow = new BrowserWindow({
        width: 800,
        height: 900,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadFile('index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}



//CREACIÓN DE LA RULETA
function createRuletaWindow() {
    if (ruletaWindow) {
        ruletaWindow.focus(); // Enfoca la ventana si ya está creada
        return;
    }
    ruletaWindow = new BrowserWindow({
        width: 800,
        height: 900,
        //resizable: false,
        //fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    ruletaWindow.loadFile('ruleta.html');

    ruletaWindow.webContents.openDevTools();

    
    ruletaWindow.on('closed', () => {
        ruletaWindow = null;
    });
}



// Comunicación entre ventanas
ipcMain.on('abrirJuego', (event) => {
    if (mainWindow) {
        mainWindow.hide(); // Oculta la ventana principal
    }
    if (!ruletaWindow) {
        createRuletaWindow(); // Crea la ventana de la ruleta si no existe
    } else {
        ruletaWindow.show(); // Muestra la ventana de la ruleta si ya existe
    }
    console.log("Abriendo ruleta");
});

ipcMain.on('salirJuego', () => {
    if (ruletaWindow) {
        ruletaWindow.hide(); // Oculta la ventana de la ruleta
    }
    if (mainWindow) {
        mainWindow.show(); // Muestra la ventana principal si ya existe
    } else {
        createMainWindow(); // Crea la ventana principal si no existe
    }
});




// Eventos de la aplicación
app.on('ready', createMainWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow && !ruletaWindow) {
        createMainWindow();
    }
});
