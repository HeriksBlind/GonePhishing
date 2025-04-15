let isHighlighting = false;
let modelLoaded = false;

// Initialize bayesClassifier if it doesn't exist
if (!window.bayesClassifier) {
    window.bayesClassifier = {
        NB_MODEL: null,
        NB_VOCAB: null,
        predictSpamProbability: function(text) {
            if (!this.NB_MODEL || !this.NB_VOCAB) return 0.5;
            
            // Vectorize text
            const counts = {};
            const words = text.toLowerCase().split(/\W+/);
            words.forEach(word => {
                if (this.NB_VOCAB[word] !== undefined) {
                    const index = this.NB_VOCAB[word];
                    counts[index] = (counts[index] || 0) + 1;
                }
            });
            
            // Calculate probabilities
            const logPrior = this.NB_MODEL.class_log_prior_;
            const logProb = this.NB_MODEL.feature_log_prob_;
            
            const scores = logPrior.map((prior, classIndex) => {
                let score = prior;
                for (let index in counts) {
                    score += counts[index] * logProb[classIndex][index];
                }
                return score;
            });
            
            // Softmax normalization
            const max = Math.max(...scores);
            const expScores = scores.map(s => Math.exp(s - max));
            const sum = expScores.reduce((a, b) => a + b, 0);
            return expScores[1] / sum; // Return probability of spam
        }
    };
}

// Load model with retry mechanism
async function loadNBModel() {
    if (window.bayesClassifier.isLoaded) return true;

    try {
        console.log("[Model Load] Starting model load...");
        
        const [model, vocab] = await Promise.all([
            fetch(chrome.runtime.getURL("model_params.json"))
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                }),
            fetch(chrome.runtime.getURL("vectorizer_params.json"))
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return res.json();
                })
        ]);

        // Validate model structure
        if (!model.class_log_prior_ || !model.feature_log_prob_) {
            throw new Error("Invalid model structure");
        }

        window.bayesClassifier.NB_MODEL = model;
        window.bayesClassifier.NB_VOCAB = vocab.vocabulary_;
        window.bayesClassifier.isLoaded = true;
        
        console.log("[Model Load] Success! Model stats:", {
            classes: model.class_log_prior_.length,
            features: model.feature_log_prob_[0].length,
            vocabSize: Object.keys(vocab.vocabulary_).length
        });
        
        // Test prediction
        const testPred = window.bayesClassifier.predictSpamProbability(
            "Congratulations! You won a $1000 prize!"
        );
        console.log("[Model Test] Spam prediction for test text:", testPred);
        
        return true;
    } catch (error) {
        console.error("[Model Load] Failed:", error);
        window.bayesClassifier.NB_MODEL = null;
        window.bayesClassifier.NB_VOCAB = null;
        window.bayesClassifier.isLoaded = false;
        throw error;
    }
}

// Enhanced rule-based patterns
const RULE_PATTERNS = {
    suspiciousUrls: ["bit.ly", "tinyurl", "goo.gl", "ow.ly", "shorturl"],
    urgencyKeywords: ["urgent", "immediate action", "required", "account suspended", "verify now"],
    financialKeywords: ["bank", "paypal", "credit card", "ssn", "social security"],
    giftKeywords: ["free gift", "prize", "won", "claim your reward"],
    threatKeywords: ["account closure", "legal action", "security alert", "unauthorized access"]
};

function highlightEmailRow(row, reason, warningLevel) {
    if (!row) return;
    
    // Clear previous highlights
    row.classList.remove("phishing-low", "phishing-medium", "phishing-high");
    const existingScore = row.querySelector(".phishing-score");
    if (existingScore) existingScore.remove();

    // Add new highlight
    row.classList.add(`phishing-${warningLevel}`);
    row.dataset.phishingReason = reason;

    const scoreDisplay = document.createElement("div");
    scoreDisplay.className = "phishing-score";
    scoreDisplay.textContent = `⚠️ ${reason}`;
    row.appendChild(scoreDisplay);
}

function removeHighlights() {
    let highlightedRows = document.querySelectorAll(".phishing-alert");
    highlightedRows.forEach(row => {
        if (row) {
            row.classList.remove("phishing-alert");
            row.querySelectorAll(".phishing-score").forEach(el => el.remove());
            delete row.dataset.phishingReason;
        }
    });
}

function checkRuleBasedPatterns(text) {
    if (!text || typeof text !== 'string') return [];
    
    const lowerText = text.toLowerCase();
    let reasons = [];
    
    for (const [category, patterns] of Object.entries(RULE_PATTERNS)) {
        for (const pattern of patterns) {
            if (lowerText.includes(pattern)) {
                reasons.push(category.replace(/([A-Z])/g, ' $1').toLowerCase());
                break; // Only need one match per category
            }
        }
    }
    
    return reasons;
}

async function scanGmailInbox() {
    if (isHighlighting) {
        removeHighlights();
        isHighlighting = false;
        return { status: "Highlighting disabled" };
    }

    try {
        // Ensure model is properly loaded
        if (!window.bayesClassifier || !window.bayesClassifier.NB_MODEL) {
            await loadNBModel();
            if (!window.bayesClassifier.NB_MODEL) {
                throw new Error("Model failed to load");
            }
        }

        // Get all email rows with more reliable selector
        const emailRows = document.querySelectorAll('tr[role="row"]:not([gh="tl"])');
        
        if (emailRows.length === 0) {
            console.warn("No email rows found - waiting 1 second to retry");
            await new Promise(resolve => setTimeout(resolve, 1000));
            return scanGmailInbox(); // Retry once
        }

        // Process emails in chunks
        const chunkSize = 5; // Smaller chunks for better error isolation
        for (let i = 0; i < emailRows.length; i += chunkSize) {
            const chunk = Array.from(emailRows).slice(i, i + chunkSize);
            await processEmailChunk(chunk);
            await new Promise(resolve => setTimeout(resolve, 50)); // Smaller delay
        }

        isHighlighting = true;
        return { status: "Highlighting enabled" };
    } catch (error) {
        console.error('Error scanning inbox:', error);
        // Show user-visible error
        showErrorMessage('Error scanning emails. Please try again.');
        return { status: `Error: ${error.message}` };
    }
}

async function processEmailChunk(chunk) {
    console.log("[DEBUG] Processing chunk of", chunk.length, "emails");
    
    for (const row of chunk) {
        try {
            if (!row) {
                console.log("[DEBUG] Skipping null row");
                continue;
            }
            
            const emailContent = row.textContent;
            if (!emailContent) {
                console.log("[DEBUG] Skipping empty email");
                continue;
            }
            
            // Verify model is accessible
            if (!window.bayesClassifier?.NB_MODEL) {
                console.error("[DEBUG] Bayesian model not loaded!");
                await loadNBModel();
            }

            // Bayesian prediction
            console.log("[DEBUG] Running Bayesian prediction...");
            const spamProbability = window.bayesClassifier.predictSpamProbability(emailContent);
            console.log("[DEBUG] Bayesian result:", spamProbability);
            
            // Rule-based check
            console.log("[DEBUG] Running rule-based check...");
            const ruleReasons = checkRuleBasedPatterns(emailContent);
            console.log("[DEBUG] Rule-based results:", ruleReasons);

            // Decision logic
            let warningLevel = 'none';
            let reason = '';
            
            if (spamProbability >= 0.7 && ruleReasons.length > 0) {
                warningLevel = 'high';
                reason = `AI (${(spamProbability * 100).toFixed(1)}%) + Rules: ${ruleReasons.join(', ')}`;
            } else if (spamProbability >= 0.7) {
                warningLevel = 'medium';
                reason = `AI detected (${(spamProbability * 100).toFixed(1)}%)`;
            } else if (ruleReasons.length > 0) {
                warningLevel = 'low';
                reason = `Rules: ${ruleReasons.join(', ')}`;
            }
            
            if (warningLevel !== 'none') {
                console.log("[DEBUG] Flagging email:", reason);
                highlightEmailRow(row, reason, warningLevel);
            } else {
                console.log("[DEBUG] Email not flagged");
            }
            
        } catch (error) {
            console.error('[DEBUG] Error processing row:', error);
            console.error('[DEBUG] Row content:', row?.textContent?.substring(0, 50));
            console.error('[DEBUG] Model state:', {
                loaded: modelLoaded,
                modelExists: !!window.bayesClassifier?.NB_MODEL,
                vocabExists: !!window.bayesClassifier?.NB_VOCAB
            });
        }
    }
}

function showErrorMessage(message) {
    // Remove existing error if any
    const existingError = document.querySelector('.phishing-error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'phishing-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #ffebee;
        padding: 10px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(errorDiv);
}

// Initialize the content script
async function initializeContentScript() {
    console.log("[DEBUG] Initializing content script...");
    try {
        if (!window.bayesClassifier) {
            window.bayesClassifier = {
                NB_MODEL: null,
                NB_VOCAB: null
            };
        }

        console.log("[DEBUG] Loading model...");
        await loadNBModel();
        
        // Test prediction with known spam phrase
        const testPhrase = "Congratulations! You've won a $1000 prize!";
        const testResult = window.bayesClassifier.predictSpamProbability(testPhrase);
        console.log("[DEBUG] Test prediction ('"+testPhrase+"'):", testResult);
        
        if (!window.bayesClassifier.NB_MODEL) {
            throw new Error("Model initialization failed - NB_MODEL is null");
        }
        
        console.log('[DEBUG] Content script initialized successfully');
        
        // Inject styles
        const style = document.createElement('style');
        style.textContent = `...`; // Keep your existing styles
        document.head.appendChild(style);
        
    } catch (error) {
        console.error('[DEBUG] Initialization failed:', error);
        showErrorMessage('Failed to initialize phishing detection. Please refresh the page.');
    }
}

// Add message listener for scan requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanInbox') {
        scanGmailInbox().then(response => {
            sendResponse(response);
        }).catch(error => {
            sendResponse({ status: `Error: ${error.message}` });
        });
        return true; // Required for async response
    }
});

// Initialize when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}