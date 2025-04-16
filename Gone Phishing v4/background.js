chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "checkLinks") {
        const suspiciousPatterns = [
            "bit.ly", "tinyurl", "free-gift", "bank-update", "paypal-security",
            "login", "verify", "reset-password", "update-info", "account-suspended",
            "urgent", "reset password", "verify your account", "congratulations", "win now",
            "click here", "claim prize", "free", "security alert", "password expired", "You received a direct payment",
			"You received a payment", 
        ];

        const regexPatterns = [
            /http[s]?:\/\/[^ ]*(login|verify|secure|reset|account)[^ ]*/i,
            /congratulations!?/i,
            /reset\s*password/i,
            /urgent/i,
            /security\s*alert/i,
            /win\s+(a\s+)?(free\s+)?(iphone|gift|card|prize)/i,
            /verify\s+(your\s+)?account/i
        ];

        let flaggedLinks = [];

        message.links.forEach((link) => {
            // Simple pattern matching
            suspiciousPatterns.forEach((pattern) => {
                if (link.toLowerCase().includes(pattern)) {
                    flaggedLinks.push(link);
                }
            });

            // Regex matching
            regexPatterns.forEach((regex) => {
                if (regex.test(link)) {
                    flaggedLinks.push(link);
                }
            });
        });

        // Remove duplicates
        flaggedLinks = [...new Set(flaggedLinks)];
        sendResponse({ flaggedLinks });
    }
});
