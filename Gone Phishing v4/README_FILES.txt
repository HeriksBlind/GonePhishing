Author - Herik Montalvo

Gone Phishing Extension — File Overview

1. manifest.json
   - Declares extension metadata (name, version, manifest_version).
   - Specifies permissions (storage, tabs, scripting, host on mail.google.com).
   - Lists content and background scripts, popup, icons, and web_accessible_resources (model and vectorizer JSON).
   - Controls which APIs and pages the extension can access.

2. background.js
   - Listens for messages from content scripts requesting link checks.
   - Implements rule-based filtering: checks each URL against suspicious substrings and regex patterns.
   - Returns flagged links back to content scripts for highlighting.
   - Runs persistently (service worker) to support fast pattern matching.

3. bayes_classifier.js
   - Fetches and loads model_params.json (Naive Bayes priors & likelihoods) and vectorizer_params.json (vocabulary mapping).
   - Provides function predictNB(text) to vectorize email text and compute log-probabilities.
   - Outputs numeric spam probability via softmax of class log-likelihoods.
   - Runs entirely client-side, no external API calls.

4. content.js
   - Injects CSS styles for “.phishing-alert” and “.safe-alert” badges.
   - scanGmailInbox(): iterates Gmail rows (<tr>), extracts text, and calls:
       • rule-based scan via background.js messaging.
       • predictSpamProbability(text) from bayes_classifier.js.
   - Applies red “⚠️ Spam XX.X%” or green “✅ Safe” badges based on threshold.
   - Logs each processed row in DevTools console.

5. model_params.json
   - Contains serialized Naive Bayes model parameters:
       • class_log_prior_ array
       • feature_log_prob_ matrix
   - Generated offline after training; used by bayes_classifier.js to score emails.

6. vectorizer_params.json
   - Contains vocabulary-to-index mapping for text vectorization.
   - Ensures that bayes_classifier.js counts tokens according to the trained model’s vocabulary.

7. popup.html
   - Defines the extension’s popup UI: “Scan Emails” button, theme toggle.
   - References popup.js and styles.css.
   - Provides user controls for manually triggering scans and switching light/dark mode.

8. popup.js
   - Handles button clicks in popup.html.
   - Uses chrome.tabs.query and chrome.tabs.sendMessage to instruct content.js to scan.
   - Reads/writes theme preference in chrome.storage.sync.
   - Shows/hides loading spinner during scan.

9. styles.css
   - Defines CSS variables and classes for popup UI styling.
   - Styles scan button, spinner, theme toggle, badges.
   - Works with injected styles in content.js for in-page highlights.

Together, these files implement a two-layer phishing detection system that runs entirely in Chrome: rule-based link scanning for speed, plus a pre-trained Naive Bayes classifier for accuracy, all orchestrated via messaging between background, content, and popup scripts.