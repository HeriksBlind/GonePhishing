Author - Herik Montalvo

Gone Phishing Extension — User Instructions

1. Install the Extension
   a. Open Chrome and go to chrome://extensions/.
   b. Enable “Developer mode” (toggle in the top right).
   c. Click “Load unpacked” and select the extension’s folder (containing manifest.json).

2. Open Gmail
   a. Navigate to https://mail.google.com/ and log in if necessary.
   b. Ensure the extension icon appears in the toolbar (shield icon with checkmark).

3. Scanning Your Inbox
   a. Click the extension icon to open the popup.
   b. Click the “Scan Emails” button.
   c. Wait for the spinner to complete — the extension will process each email.

4. Interpreting Results
   • Red badge “⚠️ Spam XX.X%”: The Bayesian model probability ≥ 70% or rule-based filter flagged it. Treat these emails as potential phishing.
   • Green badge “✅ Safe”: The email scored below 70% and passed rule checks. These are likely legitimate.

5. Theme Toggle
   • In the popup, use the Light/Dark switch to change the popup theme.
   • Your choice is saved automatically.

6. Whitelisting Senders
   • (Future feature) Click “Trust Sender” on a flagged email to whitelist that sender.
   • Whitelisted senders will no longer be flagged in subsequent scans.

7. Debugging & Logs
   a. Open Chrome DevTools (F12) on Gmail.
   b. Go to the “Console” tab.
   c. Look for lines beginning “Checking row: …” to see raw text and link checks.

8. Privacy & Performance
   • All scanning runs 100% locally—no data leaves your browser.
   • Rule-based checks run first for speed; Bayesian scoring runs next for accuracy.

9. Reloading & Updates
   • To apply changes, return to chrome://extensions/ and click the reload (⟳) icon for the extension.
   • After updating files, reload Gmail to scan again.

Thank you for using Gone Phishing! Stay safe online.
