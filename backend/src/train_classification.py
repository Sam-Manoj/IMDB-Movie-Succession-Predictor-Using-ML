import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from src.preprocessing import clean_movie_data

def train():
    df = clean_movie_data()
    X = df[['budget_x', 'release_year', 'score', 'primary_genre', 'orig_lang']]
    y_tier = df['success_tier']
    y_profit = df['is_profitable']
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), ['budget_x', 'release_year', 'score']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['primary_genre', 'orig_lang'])
    ])
    
    # Train Random Forest
    rf = Pipeline([('preprocessor', preprocessor), ('clf', RandomForestClassifier(n_estimators=100, random_state=42))])
    rf.fit(X, y_tier)
    
    # Train SVM
    svm = Pipeline([('preprocessor', preprocessor), ('svm', SVC(kernel='rbf', probability=True, random_state=42))])
    svm.fit(X, y_profit)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(rf, 'models/practical_ensemble_classifier.pkl')
    joblib.dump(svm, 'models/practical_svm.pkl')
    print("Classification models saved!")

if __name__ == "__main__":
    train()