import joblib
import json
import numpy as np

# Load the trained model and vectorizer
model = joblib.load('spam_classifier.pkl')
vectorizer = joblib.load('vectorizer.pkl')

# Extract Naive Bayes parameters
model_params = {
    "class_log_prior_": model.class_log_prior_.tolist(),
    "feature_log_prob_": model.feature_log_prob_.tolist(),
    "classes_": model.classes_.tolist()
}

# Extract Vectorizer parameters
vectorizer_params = {
    "vocabulary_": vectorizer.vocabulary_,
    "stop_words_": list(vectorizer.stop_words) if vectorizer.stop_words else []
}

# Save to JSON
with open('model_params.json', 'w') as f:
    json.dump(model_params, f)

with open('vectorizer_params.json', 'w') as f:
    json.dump(vectorizer_params, f)

print("Model and vectorizer exported to JSON!")