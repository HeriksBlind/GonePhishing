chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkLinks") {
        const suspiciousPatterns = [
            "bit.ly", "tinyurl", "goo.gl", "ow.ly", "shorturl",
            "free-gift", "bank-update", "paypal-security", "account-verify",
            "urgent-action", "password-reset"
        ];
        let flaggedLinks = [];

        message.links.forEach((link) => {
            suspiciousPatterns.forEach((pattern) => {
                if (link.includes(pattern)) {
                    flaggedLinks.push({
                        link: link,
                        reason: `Suspicious URL pattern: ${pattern}`
                    });
                }
            });
        });

        sendResponse({ flaggedLinks });
    }
});