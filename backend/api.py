from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib  # Import the joblib module

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the saved model and vectorizer
model = joblib.load('spam_classifier.pkl')
vectorizer = joblib.load('vectorizer.pkl')

@app.route('/classify', methods=['POST'])
def classify_email():
    try:
        data = request.json
        print("Received data:", data)  # Log the incoming request data

        email_text = data.get('email_text', '')
        print("Email text:", email_text)  # Log the email text

        if not email_text:
            return jsonify({'error': 'No email text provided'}), 400

        # Vectorize the email text
        email_vector = vectorizer.transform([email_text])
        print("Email vector shape:", email_vector.shape)  # Log the vector shape

        # Make a prediction
        prediction = model.predict(email_vector)[0]
        print("Prediction:", prediction)  # Log the prediction

        return jsonify({'prediction': prediction})
    except Exception as e:
        # Log the error
        print(f"Error classifying email: {e}")
        return jsonify({'error': 'An error occurred while classifying the email'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)