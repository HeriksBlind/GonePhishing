chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkLinks") {
        const suspiciousPatterns = ["bit.ly", "tinyurl", "free-gift", "bank-update", "paypal-security"];
        let flaggedLinks = [];

        message.links.forEach((link) => {
            suspiciousPatterns.forEach((pattern) => {
                if (link.includes(pattern)) {
                    flaggedLinks.push(link);
                }
            });
        });

        sendResponse({ flaggedLinks });
    }
});
