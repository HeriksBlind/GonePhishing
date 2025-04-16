let isHighlighting = false;

// Load model
loadNBModel();

function highlightEmailRow(row) {
    row.classList.add("phishing-alert");
}

function removeHighlights() {
    let highlightedRows = document.querySelectorAll(".phishing-alert, .safe-alert");
    highlightedRows.forEach(row => {
        row.classList.remove("phishing-alert");
        row.classList.remove("safe-alert");
        row.querySelectorAll(".phishing-score, .safe-score").forEach(el => el.remove());
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

        const emailText = row.innerText.toLowerCase().trim();
        if (!emailText || emailText.length < 10) return;

        // TEMP: log row for debugging
        console.log("Checking row:", emailText.slice(0, 80));

        // Refined filters: skip attachment-only or personal direct messages
        if (
            emailText.includes("wmremove") ||
            emailText.match(/\.(png|jpg|jpeg|pdf|docx?|rar|zip)/) ||
            (emailText.includes("me") && !emailText.includes("fwd"))
        ) {
            return;
        }

        const spamProb = predictSpamProbability(emailText);
        const cell = row.querySelector("td") || row;

        if (spamProb >= 0.7) {
            highlightEmailRow(row);

            const scoreDisplay = document.createElement("div");
            scoreDisplay.className = "phishing-score";
            scoreDisplay.textContent = `⚠️ Spam ${(spamProb * 100).toFixed(1)}%`;
            scoreDisplay.title = "Click to hide/show";
            scoreDisplay.style.cursor = "pointer";

            scoreDisplay.addEventListener("click", () => {
                scoreDisplay.style.display = (scoreDisplay.style.display === "none") ? "inline-block" : "none";
            });

            cell.appendChild(scoreDisplay);
        } else {
            row.classList.add("safe-alert");

            const safeLabel = document.createElement("div");
            safeLabel.className = "safe-score";
            safeLabel.textContent = `✅ Safe`;
            cell.appendChild(safeLabel);
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
        .safe-alert {
            background-color: #e6ffe6 !important;
        }
        .phishing-score, .safe-score {
            font-size: 12px;
            padding: 4px 8px;
            margin-top: 4px;
            display: inline-block;
            border-radius: 4px;
        }
        .phishing-score {
            color: #990000;
            background-color: #ffdddd;
        }
        .safe-score {
            color: #006600;
            background-color: #ddffdd;
        }
    `;
    document.head.appendChild(style);
}

function testLinkScan() {
    const links = Array.from(document.querySelectorAll("a"))
        .map(a => a.href)
        .filter(href => href && href.startsWith("http"));

    chrome.runtime.sendMessage({ action: "checkLinks", links }, (response) => {
        console.log("⚠️ Flagged Links from background.js:", response.flaggedLinks);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scanEmails") {
        scanGmailInbox();
        sendResponse({ status: isHighlighting ? "Highlighting enabled" : "Highlighting disabled" });
    }
});

injectStyles();
testLinkScan(); // Optional debug trigger
