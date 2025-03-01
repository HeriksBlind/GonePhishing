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

// Function to scan email content
function scanEmailContent() {
    console.log("Scanning Gmail emails for phishing threats...");
    
    let emailElements = document.querySelectorAll("div[role='listitem'], div[role='article'], span, div");

    emailElements.forEach((el) => {
        let text = el.innerText.toLowerCase();
        
        phishingKeywords.forEach((keyword) => {
            if (text.includes(keyword.toLowerCase())) {
                el.style.backgroundColor = "yellow"; // Highlight phishing text
                el.style.fontWeight = "bold"; // Make text stand out
                console.warn(`⚠️ Phishing keyword detected: "${keyword}"`);
            }
        });
    });
}

// Observe changes in Gmail for dynamically loaded emails
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
