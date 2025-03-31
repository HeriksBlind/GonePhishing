document.getElementById("scanEmails").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) return; // Ensure there's an active tab
        chrome.tabs.sendMessage(tabs[0].id, { action: "scanEmails" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
            } else {
                console.log("Scan triggered:", response?.status || "No response");
            }
        });
    });
});
