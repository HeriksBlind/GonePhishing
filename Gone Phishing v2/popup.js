document.getElementById("scanEmails").addEventListener("click", () => {
    alert("Scanning emails for phishing threats...");
});

document.getElementById("scanLinks").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: detectPhishingLinks
        });
    });
});

function detectPhishingLinks() {
    const links = Array.from(document.querySelectorAll("a")).map(a => a.href);
    chrome.runtime.sendMessage({ action: "checkLinks", links }, (response) => {
        const alertList = document.getElementById("alertList");
        alertList.innerHTML = "";

        if (response.flaggedLinks.length > 0) {
            response.flaggedLinks.forEach(link => {
                let listItem = document.createElement("li");
                listItem.textContent = `⚠️ Suspicious link: ${link}`;
                alertList.appendChild(listItem);
            });
        } else {
            alert("No suspicious links found.");
        }
    });
}
