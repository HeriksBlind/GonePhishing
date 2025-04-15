document.getElementById("scanBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "scanInbox" }, (response) => {
            if (chrome.runtime.lastError) {
                document.getElementById("statusMessage").textContent = "Unable to scan: content script not loaded.";
            } else {
                const status = response?.status || "Scan triggered";
                document.getElementById("statusMessage").textContent = status;
            }
        });
    });
});
