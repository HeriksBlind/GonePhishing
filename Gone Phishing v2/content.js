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

// Function to highlight entire email row
function highlightEmailRow(row) {
    row.classList.add("phishing-alert");
}

// Function to scan and highlight Gmail inbox rows (only when triggered)
function scanGmailInbox() {
    try {
        console.log("Scanning Gmail inbox for phishing threats...");

        let emailRows = document.querySelectorAll("tr"); // Gmail uses <tr> for email rows

        emailRows.forEach((row) => {
            if (row.classList.contains("phishing-alert")) {
                return; // Skip already highlighted rows
            }

            let emailText = row.innerText.toLowerCase(); // Get text inside row

            phishingKeywords.forEach((keyword) => {
                if (emailText.includes(keyword.toLowerCase())) {
                    console.log(`Phishing keyword detected: "${keyword}" in email.`);
                    highlightEmailRow(row);
                }
            });
        });

    } catch (error) {
        console.error("Error scanning Gmail inbox:", error);
    }
}

// Inject styles to highlight entire row
function injectStyles() {
    let style = document.createElement("style");
    style.innerHTML = `
        .phishing-alert {
            background-color: #ffcccc !important; /* Light red background */
            font-weight: bold !important;
        }
    `;
    document.head.appendChild(style);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanEmails") {
        console.log("Received scan trigger from popup.js");
        scanGmailInbox(); // Run scan only when triggered
        sendResponse({ status: "Scanning started" });
    }
});

// Inject styles immediately
injectStyles();
