// bayes_classifier.js
let NB_MODEL = null;
let NB_VOCAB = null;

// Load model and vocabulary from JSON files
async function loadNBModel() {
    try {
        const [modelRes, vocabRes] = await Promise.all([
            fetch(chrome.runtime.getURL("model_params.json")).then(res => res.json()),
            fetch(chrome.runtime.getURL("vectorizer_params.json")).then(res => res.json())
        ]);

        NB_MODEL = modelRes;
        NB_VOCAB = vocabRes.vocabulary_;
        return true;
    } catch (error) {
        console.error("Model loading failed:", error);
        throw error;
    }
}

// Convert text into a vector using the vocabulary
function vectorize(text) {
    const counts = {};
    const words = text.toLowerCase().split(/\W+/);
    words.forEach(word => {
        if (NB_VOCAB[word] !== undefined) {
            const index = NB_VOCAB[word];
            counts[index] = (counts[index] || 0) + 1;
        }
    });
    return counts;
}

// Predict spam probability using Multinomial Naive Bayes
function predictSpamProbability(text) {
if (!window.bayesClassifier) {
    window.bayesClassifier = {
        NB_MODEL: null,
        NB_VOCAB: null,
        isLoaded: false,
        
        predictSpamProbability: function(text) {
            console.log("[Model Check] NB_MODEL exists:", !!this.NB_MODEL, 
                      "NB_VOCAB exists:", !!this.NB_VOCAB);
            
            if (!this.NB_MODEL || !this.NB_VOCAB) {
                console.error("Model not loaded - using default 0.5");
                return 0.5; // This explains your 0.5 predictions
            }

            // Debug vocabulary access
            const testWord = "free"; // Common spam word
            console.log(`[Vocab Check] Word "${testWord}" exists:`, 
                       this.NB_VOCAB[testWord] !== undefined);

            // Actual prediction logic
            const counts = {};
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            
            words.forEach(word => {
                if (this.NB_VOCAB[word] !== undefined) {
                    counts[this.NB_VOCAB[word]] = (counts[this.NB_VOCAB[word]] || 0) + 1;
                }
            });

            const logProb = this.NB_MODEL.feature_log_prob_;
            const scores = this.NB_MODEL.class_log_prior_.map((prior, i) => {
                let score = prior;
                for (const [index, count] of Object.entries(counts)) {
                    score += count * logProb[i][index];
                }
                return score;
            });

            // Softmax
            const maxScore = Math.max(...scores);
            const expScores = scores.map(s => Math.exp(s - maxScore));
            const sumExp = expScores.reduce((a, b) => a + b, 0);
            return expScores[1] / sumExp; // Return spam probability
        }
    };
}

// Export functions to be used in content.js
window.bayesClassifier = {
    loadNBModel,
    vectorize,
    predictSpamProbability,
    getModel: () => NB_MODEL,
    getVocab: () => NB_VOCAB
};