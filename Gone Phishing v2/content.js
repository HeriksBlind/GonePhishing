const phishingKeywords = [
    "urgent",
    "verify your account",
    "password reset",
    "suspicious activity",
    "update your details",
    "click here",
    "confirm now",
    "free gift",
    "bank account",
    "security alert",
    "confirm here"
];

// Function to scan and highlight only the phishing text
function scanEmailContent() {
    console.log("Scanning Gmail emails for phishing threats...");

    let emailElements = document.querySelectorAll("div[role='listitem'], div[role='article'], span, div");

    emailElements.forEach((el) => {
        let text = el.innerHTML; // Get the inner HTML content

        phishingKeywords.forEach((keyword) => {
            let regex = new RegExp(`(${keyword})`, "gi"); // Case-insensitive search
            text = text.replace(regex, `<span style="background-color: yellow; font-weight: bold;">$1</span>`);
        });

        el.innerHTML = text; // Update the content with highlighted text
    });
}

// Observe Gmail changes for dynamically loaded content
function observeGmailChanges() {
    const observer = new MutationObserver(() => {
        scanEmailContent();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Initial scan and start observing changes
setTimeout(() => {
    scanEmailContent();
    observeGmailChanges();
}, 5000);
