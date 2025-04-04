import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import precision_score, recall_score, accuracy_score, f1_score, make_scorer
import joblib
from sklearn.metrics import classification_report

# Load the dataset
def load_dataset(file_path):
    print(f'Loading dataset from: {file_path}')
    data = pd.read_csv(file_path)
    print(f'Number of rows loaded: {len(data)}')
    return data

# Split the dataset
def split_dataset(data):
    train_data, test_data = train_test_split(data, test_size=0.2, random_state=42)
    return train_data, test_data

# Train the model
def train_spam_filter(train_data):
    print('\nTraining the model...')
    
    # Handle NaN values
    train_data['Email Text'] = train_data['Email Text'].fillna('')  
    
    vectorizer = CountVectorizer()
    X_train = vectorizer.fit_transform(train_data['Email Text'])
    y_train = train_data['Email Type']
    
    model = MultinomialNB()
    model.fit(X_train, y_train)
    
    print('Training completed.')
    return model, vectorizer

# Evaluate the model
def evaluate_model(model, vectorizer, test_data):
    test_data['Email Text'] = test_data['Email Text'].fillna('')
    X_test = vectorizer.transform(test_data['Email Text'])
    y_test = test_data['Email Type']
    
    y_pred = model.predict(X_test)
    pos_label = 'Phishing Email'
    
    precision = precision_score(y_test, y_pred, pos_label=pos_label)
    recall = recall_score(y_test, y_pred, pos_label=pos_label)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, pos_label=pos_label)
    
    print(f'\nEvaluation Metrics:')
    print(f'Accuracy: {accuracy:.4f}')
    print(f'Precision: {precision:.4f}')
    print(f'Recall: {recall:.4f}')
    print(f'F1-Score: {f1:.4f}')
    print('\nClassification Report:')
    print(classification_report(y_test, y_pred, target_names=['Safe Email', 'Phishing Email']))

# Cross-validation function
def run_cross_validation(data, n_splits=5):
    print('\nRunning Cross-Validation...')
    
    # Prepare data
    data['Email Text'] = data['Email Text'].fillna('')
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(data['Email Text'])
    y = data['Email Type']
    
    # Initialize model and CV strategy
    model = MultinomialNB()
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    
    # Create custom scorers
    pos_label = 'Phishing Email'
    scoring = {
        'accuracy': 'accuracy',
        'precision': make_scorer(precision_score, pos_label=pos_label),
        'recall': make_scorer(recall_score, pos_label=pos_label),
        'f1': make_scorer(f1_score, pos_label=pos_label)
    }
    
    # Calculate all metrics
    results = {}
    for metric_name, scorer in scoring.items():
        scores = cross_val_score(model, X, y, cv=cv, scoring=scorer)
        results[metric_name] = (scores.mean(), scores.std())
    
    # Print results
    print(f'\nCross-Validation Results ({n_splits}-fold):')
    for metric_name, (mean, std) in results.items():
        print(f'{metric_name.capitalize()}: {mean:.4f} (±{std*2:.4f})')

# Save the model
def save_model(model, vectorizer, model_path='spam_classifier.pkl', vectorizer_path='vectorizer.pkl'):
    joblib.dump(model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    print(f'\nModel saved to {model_path}')
    print(f'Vectorizer saved to {vectorizer_path}')

# Main function
def main():
    file_path = 'E:\\Southern\\CSC_400_CapStone\\GonePhishing_BayesV2\\Email_Dataset\\archive\\Phishing_Email.csv'
    data = load_dataset(file_path)
    
    # Data inspection
    print(f"\nData Summary:")
    print(f"NaN values in 'Email Text': {data['Email Text'].isna().sum()}")
    print(f"Unique labels: {data['Email Type'].unique()}")
    print(f"Class distribution:\n{data['Email Type'].value_counts()}")
    
    # Cross-validation on full dataset
    run_cross_validation(data)
    
    # Standard train-test split workflow
    train_data, test_data = split_dataset(data)
    model, vectorizer = train_spam_filter(train_data)
    
    # Evaluation
    print('\nTraining Set Performance:')
    evaluate_model(model, vectorizer, train_data)
    
    print('\nTest Set Performance:')
    evaluate_model(model, vectorizer, test_data)
    
    save_model(model, vectorizer)

if __name__ == '__main__':
    main()