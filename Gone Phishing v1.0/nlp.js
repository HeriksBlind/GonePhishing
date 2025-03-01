// NLP-based phishing detection module

// ⚠️ Common phishing words in URLs and emails
const phishingKeywords = [
    "login", "secure", "account", "update", "verify", "bank", 
    "password", "unlock", "suspended", "urgent", "confirm", "billing"
];

// ✅ Function to check URL structure using NLP
function analyzeURL(url) {
    let suspiciousScore = 0;

    // Check for common phishing words
    phishingKeywords.forEach(word => {
        if (url.toLowerCase().includes(word)) {
            suspiciousScore++;
        }
    });

    // Detect use of multiple hyphens, subdomains (common in phishing sites)
    if ((url.match(/-/g) || []).length > 2) suspiciousScore++;
    if ((url.match(/\./g) || []).length > 3) suspiciousScore++;

    return suspiciousScore;
}

// ✅ Function to analyze website text content
function analyzeTextContent(text) {
    let suspiciousScore = 0;

    // Common phishing phrases
    const phishingPhrases = [
        "Your account has been suspended",
        "Verify your identity",
        "Immediate action required",
        "Reset your password",
        "Unusual activity detected",
        "Your account will be locked"
    ];

    phishingPhrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase.toLowerCase())) {
            suspiciousScore++;
        }
    });

    return suspiciousScore;
}

// ✅ Export all required functions
export { analyzeURL, analyzeTextContent, checkWebsiteForPhishing };


// ✅ Function to analyze a website for phishing
function checkWebsiteForPhishing(url, textContent) {
    let urlScore = analyzeURL(url);
    let textScore = analyzeTextContent(textContent);

    console.log(`🔍 URL Score: ${urlScore}, Text Score: ${textScore}`);

    if (urlScore >= 2 || textScore >= 1) {
        alertUser(url);
    }
}
