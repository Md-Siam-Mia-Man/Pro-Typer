const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const userDataPath = app.getPath("userData");
const customTextsPath = path.join(userDataPath, "custom-texts.json");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#191a1c",
    title: "Pro Typer",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.webContents.on("did-finish-load", () => {
    let defaultTexts = {};
    let customTexts = { proverbs: [], quotes: [] };
    try {
      const defaultTextsPath = path.join(__dirname, "texts.json");
      if (fs.existsSync(defaultTextsPath)) {
        defaultTexts = JSON.parse(fs.readFileSync(defaultTextsPath, "utf8"));
      }
    } catch (error) {
      console.error("Error loading default texts:", error);
    }

    if (fs.existsSync(customTextsPath)) {
      try {
        const data = fs.readFileSync(customTextsPath, "utf8");
        if (data) customTexts = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing custom texts:", e);
      }
    }
    mainWindow.webContents.send("texts-loaded", { defaultTexts, customTexts });
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile("index.html");
}

ipcMain.handle("write-custom-texts", async (event, texts) => {
  try {
    fs.writeFileSync(customTextsPath, JSON.stringify(texts, null, 2), "utf8");
    return { success: true };
  } catch (error) {
    console.error("Failed to write custom texts:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.on("factory-reset", (event) => {
  if (fs.existsSync(customTextsPath)) {
    fs.unlinkSync(customTextsPath);
  }
  event.sender.send("clear-local-storage-and-quit");
});

ipcMain.on("app-relaunch", () => {
  app.relaunch();
  app.quit();
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
