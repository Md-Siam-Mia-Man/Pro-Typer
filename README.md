<img src="assets/Banner.png"></img>

# 🚀 Pro Typer

## 🗂 Table of Contents

- 📖 [Introduction](#-introduction)
- ✨ [Features](#-features)
- 🛠️ [Installation](#️-installation)
- 💻 [Usage](#-usage)
- 👨‍💻 [Building from Source](#️-building-from-source)
- 🤝 [Contributing](#-contributing)
- 📜 [License](#-license)

---

## 📖 Introduction

**Pro Typer** is a gorgeous, feature-rich desktop application designed to help you learn to type fast and look like a pro while doing it! Forget boring web-based typers—Pro Typer provides a focused, beautiful, and highly customizable environment to level up your keyboard skills. With real-time feedback, detailed stats, and fun game modes, you'll be hitting 100+ WPM in no time!

This app was built with ❤️ using **Electron**, allowing it to run as a native desktop application with a stunning UI built on modern web technologies.

---

## ✨ Features

- 🎹 **On-Screen Keyboard:** A beautiful, 3D-style keyboard visualizes every keypress.
- 🌈 **RGB Effects:** A slick RGB underglow and shine-through keycap effect that can be toggled on or off.
- 📈 **Detailed Statistics:** Track your progress with a dedicated stats page showing WPM and accuracy graphs, personal bests, and more!
- 🕹️ **Multiple Game Modes:** Practice with classic **Proverbs**, insightful **Quotes**, or test your endurance in **Timed Mode**.
- ✍️ **Custom Texts:** Add, edit, and delete your own sets of proverbs and quotes to practice with text that you love.
- 💾 **Persistent Data:** All your stats, settings, and custom texts are saved locally, so your progress is never lost.
- 🎨 **Themeable UI:** Switch between a sleek dark mode and a clean light mode to match your vibe.
- 🔊 **Auditory Feedback:** Satisfying key-press sounds for a more tactile and immersive typing experience.
- ⚙️ **Full Customization:** Control everything from game mode and timed mode duration to visual effects.
- 🔍 **Zoom Control:** Adjust the entire app's zoom level with `Ctrl + Mouse Wheel` or a slider in the settings to perfectly fit your screen.
- 📦 **Single-File Installer:** A modern, professional installer makes setup a breeze.

---

## 🛠️ Installation

### 📋 Prerequisites

- 🖥️ Windows Operating System (7, 8, 10, 11)

### 💾 Steps

1. **Download the Installer**

   - Go to the [**Releases**](https://github.com/Md-Siam-Mia/Pro-Typer/releases) page of this repository.
   - Download the latest `Pro-Typer-Setup-vX.X.X.exe` file.

2. **Run the Installer**

   - Double-click the downloaded `.exe` file.
   - Follow the on-screen instructions. The installer will automatically create a desktop shortcut and a Start Menu entry.

3. **Launch the App**
   - Open **Pro Typer** from your desktop or Start Menu and start typing!

---

## 💻 Usage

### ▶️ Getting Started

- When you first launch the app, you will be on the main typing screen in "Proverbs" mode.
- Simply start typing the text you see in the main window. The app will provide real-time feedback on your accuracy.
- When you complete a text (or when the timer runs out in Timed Mode), your results will be displayed. Press `Enter` to start a new test.

### ⚙️ Settings and Stats

- **Access Panels:** Click the **gear icon** ⚙️ in the top-left corner to open the Settings panel, or the **chart icon** 📈 to open the Stats panel.
- **Change Modes:** In the Settings panel, use the custom dropdown to switch between **Proverbs**, **Quotes**, and **Timed** modes.
- **Customize Your Experience:** Adjust the theme, toggle RGB effects, and set a custom time limit for Timed Mode.
- **Add Your Own Text:** In Settings, click "Manage Your Texts" to add, edit, or delete your own practice sentences.
- **View Progress:** The Stats panel shows beautiful graphs of your WPM and accuracy over time, along with your all-time best scores.
- **Reset Data:** You can reset your statistics or perform a full factory reset from the Settings panel if you want a fresh start.

---

## 👨‍💻 Building from Source

If you want to run the developer version or build the application yourself, follow these steps.

### 📋 Prerequisites

- 🟩 [Node.js](https://nodejs.org/) (which includes npm)
- ➕ [Git](https://git-scm.com/)
- ⚙️ [Inno Setup](https://jrsoftware.org/isdl.php) (for creating the Windows installer)

### 💾 Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Md-Siam-Mia/Pro-Typer.git
   cd Pro-Typer
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run in Development Mode**
   This will start the app with live-reloading and developer tools enabled.

   ```bash
   npm start
   ```

4. **Build the Installer**
   This command will package the application and create a single `.exe` installer in the `InstallerOutput` folder.
   ```bash
   npm run make-installer
   ```

---

## 🤝 Contributing

🎉 **Contributions are welcome!**

- 🌟 Fork the repository
- 📂 Create a new branch (`git checkout -b feature/YourAwesomeFeature`)
- 📝 Commit your changes (`git commit -m 'Add some awesome feature'`)
- 📤 Push to the branch (`git push origin feature/YourAwesomeFeature`)
- 🔃 Open a Pull Request

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

# ❤️ _Happy Typing!_ 💯
