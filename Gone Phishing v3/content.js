let isHighlighting = false;

// Load model
loadNBModel();

function highlightEmailRow(row) {
    row.classList.add("phishing-alert");
}

function removeHighlights() {
    let highlightedRows = document.querySelectorAll(".phishing-alert");
    highlightedRows.forEach(row => {
        row.classList.remove("phishing-alert");
        row.querySelectorAll(".phishing-score").forEach(el => el.remove());
    });
}

function scanGmailInbox() {
    if (isHighlighting) {
        removeHighlights();
        isHighlighting = false;
        return;
    }

    const emailRows = document.querySelectorAll("tr");
    emailRows.forEach((row) => {
        if (!row) return;

        const emailText = row.innerText.toLowerCase();
        const spamProb = predictSpamProbability(emailText);

        if (spamProb >= 0.7) {
            highlightEmailRow(row);

            const scoreDisplay = document.createElement("div");
            scoreDisplay.className = "phishing-score";
            scoreDisplay.textContent = `⚠️ Spam Confidence: ${(spamProb * 100).toFixed(1)}%`;
            row.appendChild(scoreDisplay);
        }
    });

    isHighlighting = true;
}

function injectStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
        .phishing-alert {
            background-color: #ffe6e6 !important;
        }
        .phishing-score {
            font-size: 12px;
            color: #990000;
            padding: 4px 8px;
            margin-top: 4px;
            display: inline-block;
            background-color: #ffdddd;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanEmails") {
        scanGmailInbox();
        sendResponse({ status: isHighlighting ? "Highlighting enabled" : "Highlighting disabled" });
    }
});

injectStyles();
