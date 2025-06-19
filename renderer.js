const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", () => {
  // === DOM ELEMENTS ===
  const allPages = document.querySelectorAll(".page");
  const mainPage = document.getElementById("main-page");
  const statsPage = document.getElementById("stats-page");
  const settingsPage = document.getElementById("settings-page");
  const customTextsPage = document.getElementById("custom-texts-page");
  const phraseWrapper = document.getElementById("phrase-wrapper");
  const timerUI = document.getElementById("timer-ui");
  const wpmDisplay = document
    .getElementById("wpm-display")
    .querySelector(".value");

  // Navigation & Settings Buttons
  const statsButton = document.getElementById("stats-button");
  const settingsButton = document.getElementById("settings-button");
  const backButtons = document.querySelectorAll(".back-button");
  const customSelectModeWrapper = document.getElementById("custom-select-mode");
  const customSelectTimeWrapper = document.getElementById("custom-select-time");
  const themeOptions = document.getElementById("theme-options");
  const rgbToggle = document.getElementById("rgb-toggle");
  const manageTextsButton = document.getElementById("manage-texts-button");
  const resetStatsButton = document.getElementById("reset-stats-button");
  const factoryResetButton = document.getElementById("factory-reset-button");

  // Custom Texts Page Elements
  const customSelectTextTypeWrapper = document.getElementById(
    "custom-select-text-type"
  );
  const addNewTextButton = document.getElementById("add-new-text-button");
  const customTextsList = document.getElementById("custom-texts-list");

  // Modal Elements
  const textEditorModal = document.getElementById("text-editor-modal");
  const modalTitle = document.getElementById("modal-title");
  const modalTextarea = document.getElementById("modal-textarea");
  const modalCancelButton = document.getElementById("modal-cancel-button");
  const modalSaveButton = document.getElementById("modal-save-button");

  const successOverlay = document.getElementById("success-overlay");
  const successMessage = document.getElementById("success-message");
  const finalWpm = document.getElementById("final-wpm");
  const finalAccuracy = document.getElementById("final-accuracy");
  const finalChars = document.getElementById("final-chars");
  const personalBestDisplay = document.getElementById("personal-best");

  // Stats Page Elements
  const statsHighestWpm = document.getElementById("stats-highest-wpm");
  const statsAvgWpm = document.getElementById("stats-avg-wpm");
  const statsAvgAcc = document.getElementById("stats-avg-acc");
  const statsTestsTaken = document.getElementById("stats-tests-taken");
  const chartCanvas = document.getElementById("progress-chart");
  let progressChart;

  // Audio and Lock Keys
  const keySound = document.getElementById("key-sound");
  const successSound = document.getElementById("success-sound");
  const numLockLed = document.getElementById("num-lock-led");
  const capsLockLed = document.getElementById("caps-lock-led");
  const scrollLockLed = document.getElementById("scroll-lock-led");

  // === STATE MANAGEMENT ===
  let state = {};
  let appSettings = {
    mode: "proverbs",
    time: 60,
    theme: "dark",
    isRgbOn: true,
  };
  let textSources = { proverbs: [], quotes: [], timed: "" };
  let customTexts = { proverbs: [], quotes: [] };
  let typingHistory = [];
  let editingText = { type: null, index: -1 };

  // === INITIALIZATION ===
  function init() {
    ipcRenderer.on(
      "texts-loaded",
      (event, { defaultTexts, customTexts: loadedCustom }) => {
        textSources = defaultTexts;
        customTexts = loadedCustom || { proverbs: [], quotes: [] };

        loadSettings();
        loadHistory();

        initializeCustomSelects();
        setupEventListeners();

        showPage("main-page");
        startNewTest();
      }
    );
  }

  // === UI CONTROL ===
  function showPage(pageId) {
    allPages.forEach((p) => p.classList.remove("active"));
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
      pageToShow.classList.add("active");
    }
  }
  function openModal(modal) {
    modal.classList.add("active");
  }
  function closeModal(modal) {
    modal.classList.remove("active");
  }

  // === CUSTOM SELECT BOX FACTORY ===
  function createCustomSelect(wrapper, options, initialValue, onSelect) {
    if (!wrapper) return;
    let selectedValue = initialValue;

    function render() {
      const selectedOption =
        options.find((opt) => opt.value == selectedValue) || options[0];
      if (!selectedOption) return;
      wrapper.innerHTML = `
                <div class="custom-select-trigger">
                    <span>${selectedOption.label}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-options">
                    ${options
                      .map(
                        (opt) => `
                        <div class="custom-option ${
                          opt.value == selectedValue ? "selected" : ""
                        }" data-value="${opt.value}">
                            ${opt.label}
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
    }

    wrapper.addEventListener("click", (e) => {
      const trigger = e.target.closest(".custom-select-trigger");
      const option = e.target.closest(".custom-option");

      if (trigger) {
        wrapper.classList.toggle("open");
      } else if (option) {
        const newValue = option.dataset.value;
        if (newValue != selectedValue) {
          selectedValue = newValue;
          onSelect(selectedValue);
          render();
        }
        wrapper.classList.remove("open");
      }
    });

    document.addEventListener("click", (e) => {
      if (wrapper && !wrapper.contains(e.target))
        wrapper.classList.remove("open");
    });
    render();
  }

  // === SETTINGS & DATA PERSISTENCE ===
  function loadSettings() {
    const saved = JSON.parse(localStorage.getItem("proTyperSettingsV3"));
    if (saved) {
      appSettings = { ...appSettings, ...saved };
    }
    applySettings();
  }
  function saveSettings() {
    localStorage.setItem("proTyperSettingsV3", JSON.stringify(appSettings));
  }
  function applySettings() {
    document.body.className = `theme-${appSettings.theme}`;
    document.body.classList.toggle("rgb-off", !appSettings.isRgbOn);
    rgbToggle.checked = appSettings.isRgbOn;
    updateActiveButton(themeOptions, `[data-theme="${appSettings.theme}"]`);
  }
  function updateActiveButton(container, selector) {
    if (!container) return;
    container
      .querySelectorAll(".option-button")
      .forEach((btn) => btn.classList.remove("active"));
    const activeBtn = container.querySelector(selector);
    if (activeBtn) activeBtn.classList.add("active");
  }
  function loadHistory() {
    typingHistory = JSON.parse(localStorage.getItem("proTyperHistory")) || [];
  }
  function saveHistory() {
    localStorage.setItem("proTyperHistory", JSON.stringify(typingHistory));
  }

  // === GAME LOGIC ===
  function startNewTest() {
    state = {
      currentPhrase: "",
      typedText: "",
      startTime: null,
      intervalId: null,
      isFinished: false,
      incorrectChars: 0,
      totalTypedChars: 0,
    };
    const mode = appSettings.mode;
    let availableTexts = [...(textSources[mode] || [])];
    if (customTexts[mode] && customTexts[mode].length > 0)
      availableTexts.push(...customTexts[mode]);
    if (mode === "timed") {
      state.currentPhrase = textSources.timed;
    } else {
      if (availableTexts.length > 0) {
        state.currentPhrase =
          availableTexts[Math.floor(Math.random() * availableTexts.length)];
      } else {
        state.currentPhrase = "No texts available. Add some in settings!";
      }
    }
    closeModal(successOverlay);
    resetTimer();
    renderPhrase();
  }
  function renderPhrase() {
    if (appSettings.mode === "timed") {
      renderTimedModePhrase();
    } else {
      renderStandardPhrase();
    }
  }
  function renderStandardPhrase() {
    phraseWrapper.innerHTML = "";
    const lineDiv = document.createElement("div");
    lineDiv.className = "line active-line";
    state.currentPhrase.split("").forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      if (index < state.typedText.length) {
        span.className =
          state.typedText[index] === char ? "correct" : "incorrect";
      } else if (index === state.typedText.length) {
        span.className = "cursor";
      } else {
        span.className = "untyped";
      }
      lineDiv.appendChild(span);
    });
    phraseWrapper.appendChild(lineDiv);
    phraseWrapper.style.transform = `translateY(0px)`;
  }
  function renderTimedModePhrase() {
    const words = state.currentPhrase.split(" ");
    let lines = [];
    let currentLine = "";
    words.forEach((word) => {
      if (currentLine.length + word.length + 1 > 50) {
        lines.push(currentLine);
        currentLine = "";
      }
      currentLine += (currentLine ? " " : "") + word;
    });
    lines.push(currentLine);
    let charCount = 0;
    let currentLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (state.typedText.length < charCount) {
        currentLineIndex = i;
        break;
      }
    }
    if (currentLineIndex === -1) currentLineIndex = lines.length - 1;
    phraseWrapper.innerHTML = "";
    lines.forEach((lineText, index) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "line";
      if (index === currentLineIndex) lineDiv.classList.add("active-line");
      const globalCharOffset = lines
        .slice(0, index)
        .reduce((acc, l) => acc + l.length + 1, 0);
      lineText.split("").forEach((char, charIndex) => {
        const globalIndex = globalCharOffset + charIndex;
        const span = document.createElement("span");
        span.textContent = char;
        if (globalIndex < state.typedText.length) {
          span.className =
            state.typedText[globalIndex] === char ? "correct" : "incorrect";
        } else if (globalIndex === state.typedText.length) {
          span.className = "cursor";
        } else {
          span.className = "untyped";
        }
        lineDiv.appendChild(span);
      });
      phraseWrapper.appendChild(lineDiv);
    });
    const lineHeight = phraseWrapper.querySelector(".line")?.clientHeight || 48;
    phraseWrapper.style.transform = `translateY(-${
      currentLineIndex * lineHeight
    }px)`;
  }
  function handleTestEnd() {
    state.isFinished = true;
    clearInterval(state.intervalId);
    const accuracy =
      Math.round(
        ((state.totalTypedChars - state.incorrectChars) /
          state.totalTypedChars) *
          100
      ) || 100;
    let finalWPM = 0;
    if (appSettings.mode === "timed") {
      finalWPM = Math.round(
        state.typedText.length / 5 / (appSettings.time / 60)
      );
      successMessage.textContent = "Time's Up!";
    } else {
      const elapsedSeconds = state.startTime
        ? (new Date() - state.startTime) / 1000
        : 0;
      const wordCount = state.currentPhrase.split(" ").length;
      finalWPM =
        elapsedSeconds > 0 ? Math.round(wordCount / (elapsedSeconds / 60)) : 0;
      successMessage.textContent = "Perfect!";
    }
    finalWpm.textContent = finalWPM;
    finalAccuracy.textContent = `${accuracy}%`;
    finalChars.textContent = state.totalTypedChars;
    personalBestDisplay.classList.add("hidden");
    openModal(successOverlay);
    successSound.play();
    const result = {
      wpm: finalWPM,
      accuracy,
      chars: state.totalTypedChars,
      timestamp: Date.now(),
    };
    typingHistory.push(result);
    saveHistory();
    if (
      finalWPM > Math.max(0, ...typingHistory.slice(0, -1).map((t) => t.wpm))
    ) {
      personalBestDisplay.classList.remove("hidden");
    }
  }
  function resetTimer() {
    clearInterval(state.intervalId);
    state.startTime = null;
    timerUI.textContent = "0.0s";
    wpmDisplay.textContent = "0";
  }
  function updateLockLights(e) {
    if (e.getModifierState("CapsLock")) capsLockLed.classList.add("active");
    else capsLockLed.classList.remove("active");
    if (e.getModifierState("NumLock")) numLockLed.classList.add("active");
    else numLockLed.classList.remove("active");
    if (e.getModifierState("ScrollLock")) scrollLockLed.classList.add("active");
    else scrollLockLed.classList.remove("active");
  }

  // === STATS PAGE LOGIC ===
  function renderStats() {
    if (typingHistory.length === 0) {
      statsHighestWpm.textContent = 0;
      statsAvgWpm.textContent = 0;
      statsAvgAcc.textContent = `0%`;
      statsTestsTaken.textContent = 0;
      if (progressChart) progressChart.destroy();
      return;
    }
    const highestWpm = Math.max(0, ...typingHistory.map((t) => t.wpm));
    const avgWpm = Math.round(
      typingHistory.reduce((sum, t) => sum + t.wpm, 0) / typingHistory.length
    );
    const avgAcc = Math.round(
      typingHistory.reduce((sum, t) => sum + t.accuracy, 0) /
        typingHistory.length
    );
    statsHighestWpm.textContent = highestWpm;
    statsAvgWpm.textContent = avgWpm;
    statsAvgAcc.textContent = `${avgAcc}%`;
    statsTestsTaken.textContent = typingHistory.length;
    const labels = typingHistory.map((t, i) => `Test ${i + 1}`);
    const wpmData = typingHistory.map((t) => t.wpm);
    const accData = typingHistory.map((t) => t.accuracy);
    if (progressChart) progressChart.destroy();
    const primaryColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--accent-primary");
    const correctColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--color-correct");
    const untypedColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--text-secondary");
    const gridColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-secondary")
      .replace(")", ", 0.2)")
      .replace("rgb", "rgba");
    progressChart = new Chart(chartCanvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "WPM",
            data: wpmData,
            borderColor: primaryColor,
            backgroundColor: primaryColor + "33",
            fill: true,
            tension: 0.4,
            yAxisID: "y",
          },
          {
            label: "Accuracy (%)",
            data: accData,
            borderColor: correctColor,
            backgroundColor: correctColor + "33",
            fill: true,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: untypedColor }, grid: { color: gridColor } },
          y: {
            type: "linear",
            display: true,
            position: "left",
            ticks: { color: primaryColor },
            grid: { color: gridColor },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            min: 0,
            max: 100,
            ticks: { color: correctColor },
            grid: { drawOnChartArea: false },
          },
        },
        plugins: {
          legend: {
            labels: { color: "var(--text-primary)", font: { size: 14 } },
          },
        },
      },
    });
  }

  // === CUSTOM TEXTS MANAGEMENT ===
  function renderCustomTextsList(type) {
    if (!type) {
      const selectTrigger = document.querySelector(
        "#custom-select-text-type .custom-option.selected"
      );
      type = selectTrigger ? selectTrigger.dataset.value : "proverbs";
    }
    customTextsList.innerHTML = "";
    if (customTexts[type] && customTexts[type].length > 0) {
      customTexts[type].forEach((text, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="list-item-text">${text}</span><div class="list-item-actions"><button class="edit-text-btn" data-index="${index}" title="Edit"><i class="fas fa-pencil-alt"></i></button><button class="delete-text-btn" data-index="${index}" title="Delete"><i class="fas fa-trash-alt"></i></button></div>`;
        customTextsList.appendChild(li);
      });
    } else {
      customTextsList.innerHTML = `<li>No custom ${type} found.</li>`;
    }
  }
  function openTextEditor(type, index = -1, text = "") {
    editingText = { type, index };
    modalTitle.textContent =
      index === -1
        ? `Add New ${type.slice(0, -1)}`
        : `Edit ${type.slice(0, -1)}`;
    modalTextarea.value = text;
    openModal(textEditorModal);
    modalTextarea.focus();
  }
  function closeTextEditor() {
    closeModal(textEditorModal);
  }

  // === EVENT LISTENERS SETUP ===
  function setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (modalTextarea.matches(":focus")) {
        return;
      }
      if (!mainPage.classList.contains("active")) {
        if (e.key === "Escape") showPage("main-page");
        return;
      }
      if (successOverlay.classList.contains("active")) {
        if (e.key === "Enter") startNewTest();
        return;
      }
      if (e.code === "Space" || e.code === "Tab" || e.code === "Backspace")
        e.preventDefault();
      const keyEl = document.querySelector(`.key[data-key="${e.code}"]`);
      if (keyEl) {
        keyEl.classList.add("active");
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
      }
      updateLockLights(e);
      if (state.isFinished) return;
      if (e.ctrlKey && e.key === "Enter" && appSettings.mode !== "timed") {
        e.preventDefault();
        handleTestEnd();
        return;
      }
      if (e.key === "Backspace") {
        if (state.typedText.length > 0) {
          const removedCharIndex = state.typedText.length - 1;
          if (
            state.typedText[removedCharIndex] !==
            state.currentPhrase[removedCharIndex]
          ) {
            state.incorrectChars--;
          }
          state.typedText = state.typedText.slice(0, -1);
        }
        if (state.typedText.length === 0) resetTimer();
      } else if (
        e.key.length === 1 &&
        state.typedText.length < state.currentPhrase.length
      ) {
        if (!state.startTime) {
          state.startTime = new Date();
          state.intervalId = setInterval(() => {
            const elapsed = (new Date() - state.startTime) / 1000;
            wpmDisplay.textContent =
              Math.round(state.typedText.length / 5 / (elapsed / 60)) || 0;
            if (appSettings.mode === "timed") {
              const timeLeft = appSettings.time - Math.floor(elapsed);
              timerUI.textContent = timeLeft > 0 ? `${timeLeft}s` : "0s";
              if (timeLeft <= 0 && !state.isFinished) handleTestEnd();
            } else {
              timerUI.textContent = `${elapsed.toFixed(1)}s`;
            }
          }, 100);
        }
        state.totalTypedChars++;
        if (e.key !== state.currentPhrase[state.typedText.length])
          state.incorrectChars++;
        state.typedText += e.key;
        if (
          state.typedText.length === state.currentPhrase.length &&
          appSettings.mode !== "timed"
        )
          handleTestEnd();
      }
      renderPhrase();
    });

    document.addEventListener("keyup", (e) => {
      const key = document.querySelector(`.key[data-key="${e.code}"]`);
      if (key) key.classList.remove("active");
      updateLockLights(e);
    });

    statsButton.addEventListener("click", () => {
      showPage("stats-page");
      renderStats();
    });
    settingsButton.addEventListener("click", () => showPage("settings-page"));
    backButtons.forEach((btn) =>
      btn.addEventListener("click", () => showPage(btn.dataset.target))
    );
    manageTextsButton.addEventListener("click", () =>
      showPage("custom-texts-page")
    );
    themeOptions.addEventListener("click", (e) => {
      if (e.target.matches(".theme-swatch")) {
        appSettings.theme = e.target.dataset.theme;
        saveSettings();
        applySettings();
        if (statsPage.classList.contains("active")) renderStats();
      }
    });
    rgbToggle.addEventListener("change", (e) => {
      appSettings.isRgbOn = e.target.checked;
      document.body.classList.toggle("rgb-off", !appSettings.isRgbOn);
      saveSettings();
    });

    resetStatsButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to reset all your typing statistics? This cannot be undone."
        )
      ) {
        typingHistory = [];
        saveHistory();
        renderStats();
      }
    });
    factoryResetButton.addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to perform a factory reset? This will delete ALL stats and custom texts."
        )
      ) {
        ipcRenderer.send("factory-reset");
      }
    });
    ipcRenderer.on("clear-local-storage-and-quit", () => {
      localStorage.clear();
      ipcRenderer.send("app-relaunch");
    });

    addNewTextButton.addEventListener("click", () => {
      const currentType = document.querySelector(
        "#custom-select-text-type .custom-option.selected"
      ).dataset.value;
      openTextEditor(currentType);
    });
    customTextsList.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-text-btn");
      const deleteBtn = e.target.closest(".delete-text-btn");
      const type = document.querySelector(
        "#custom-select-text-type .custom-option.selected"
      ).dataset.value;
      if (editBtn) {
        const index = parseInt(editBtn.dataset.index);
        openTextEditor(type, index, customTexts[type][index]);
      }
      if (deleteBtn) {
        if (confirm("Are you sure you want to delete this text?")) {
          const index = parseInt(deleteBtn.dataset.index);
          customTexts[type].splice(index, 1);
          saveCustomTexts();
          renderCustomTextsList(type);
        }
      }
    });

    modalTextarea.addEventListener("keydown", (e) => e.stopPropagation());
    modalCancelButton.addEventListener("click", closeTextEditor);
    modalSaveButton.addEventListener("click", async () => {
      const { type, index } = editingText;
      const newText = modalTextarea.value.trim();
      if (newText) {
        if (!customTexts[type]) customTexts[type] = [];
        if (index === -1) {
          customTexts[type].push(newText);
        } else {
          customTexts[type][index] = newText;
        }
        await saveCustomTexts();
        renderCustomTextsList(type);
        closeTextEditor();
      }
    });
  }

  function initializeCustomSelects() {
    createCustomSelect(
      customSelectModeWrapper,
      [
        { value: "proverbs", label: "Proverbs" },
        { value: "quotes", label: "Quotes" },
        { value: "timed", label: "Timed Mode" },
      ],
      appSettings.mode,
      (val) => {
        appSettings.mode = val;
        saveSettings();
        startNewTest();
      }
    );
    createCustomSelect(
      customSelectTimeWrapper,
      [
        { value: 30, label: "30 seconds" },
        { value: 60, label: "60 seconds" },
        { value: 120, label: "120 seconds" },
      ],
      appSettings.time,
      (val) => {
        appSettings.time = parseInt(val);
        saveSettings();
        if (appSettings.mode === "timed") startNewTest();
      }
    );
    createCustomSelect(
      customSelectTextTypeWrapper,
      [
        { value: "proverbs", label: "Proverbs" },
        { value: "quotes", label: "Quotes" },
      ],
      "proverbs",
      (val) => {
        renderCustomTextsList(val);
      }
    );
  }

  init();
});
