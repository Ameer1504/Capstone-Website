import { fileURLToPath } from 'url'
import path from 'path'
import electron from 'electron'
import electronIsDev from 'electron-is-dev'

const { app, BrowserWindow } = electron
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'app-icons/Icon-512x512.png'),
  })

  const hostUrl = electronIsDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  win.loadURL(hostUrl)

  if (electronIsDev) {
    win.webContents.openDevTools({ mode: 'detach' })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
