// Import NLP functions (Using ES Modules for Manifest V3)
import { analyzeURL, analyzeTextContent, checkWebsiteForPhishing } from "./nlp.js";



// ✅ Keep the service worker alive using alarms
chrome.alarms.create("keepAlive", { periodInMinutes: 4 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
        console.log("⏰ Service Worker Keep Alive Triggered!");

        // Prevent Chrome from stopping the service worker
        fetch("https://www.google.com", { mode: "no-cors" })
            .then(() => console.log("🌍 Preventing service worker shutdown..."))
            .catch(err => console.error("❌ Fetch Error:", err));
    }
});

// ✅ Listen for navigation events & analyze phishing risk
chrome.webNavigation.onCompleted.addListener((details) => {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        func: extractWebsiteText,
    }, (result) => {
        if (result && result[0] && result[0].result) {
            let websiteText = result[0].result;
            console.log("📜 Extracted Text:", websiteText);
            checkWebsiteForPhishing(details.url, websiteText);
        }
    });
});

// ✅ Extract text content from the website
function extractWebsiteText() {
    return document.body.innerText;
}

// ✅ Ensure Notifications API works before calling
if (!chrome.notifications) {
    console.error("🚨 Notifications API is not available!");
}

// ✅ Show phishing alert notification
function alertUser(url) {
    chrome.notifications.create("", {
        type: "basic",
        iconUrl: "icon.png",
        title: "⚠️ Phishing Alert!",
        message: `This site is flagged as phishing: ${url}`,
        priority: 2
    });
}
