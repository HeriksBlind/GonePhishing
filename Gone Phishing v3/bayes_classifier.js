let NB_MODEL = null;
let NB_VOCAB = null;

// Load model and vocabulary from JSON files
async function loadNBModel() {
    const [modelRes, vocabRes] = await Promise.all([
        fetch(chrome.runtime.getURL("model_params.json")).then(res => res.json()),
        fetch(chrome.runtime.getURL("vectorizer_params.json")).then(res => res.json())
    ]);

    NB_MODEL = modelRes;
    NB_VOCAB = vocabRes.vocabulary_;
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
    if (!NB_MODEL || !NB_VOCAB) return 0.5;

    const counts = vectorize(text);
    const logPrior = NB_MODEL.class_log_prior_;
    const logProb = NB_MODEL.feature_log_prob_;

    const scores = logPrior.map((prior, classIndex) => {
        let score = prior;
        for (let index in counts) {
            const count = counts[index];
            score += count * logProb[classIndex][index];
        }
        return score;
    });

    // Softmax normalization
    const max = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - max));
    const sum = expScores.reduce((a, b) => a + b, 0);
    const probs = expScores.map(s => s / sum);

    return probs[1]; // Return probability of spam
}
