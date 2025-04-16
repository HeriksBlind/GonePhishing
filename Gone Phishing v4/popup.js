const loader = document.getElementById("loading");
const status = document.getElementById("statusMessage");
const themeToggle = document.getElementById("themeToggle");

// Run scan
document.getElementById("scanBtn").addEventListener("click", () => {
    loader.hidden = false;
    status.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scanEmails" }, (response) => {
            loader.hidden = true;

            if (chrome.runtime.lastError) {
                status.textContent = "Unable to scan: content script not loaded.";
            } else {
                const result = response?.status || "Scan triggered";
                status.textContent = result;
            }
        });
    });
});

// Load saved theme on popup open
chrome.storage.sync.get(["userTheme"], (data) => {
    if (data.userTheme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
});

// Toggle and save theme
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark");
    chrome.storage.sync.set({ userTheme: isDark ? "dark" : "light" });
});
