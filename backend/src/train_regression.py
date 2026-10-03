import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from src.preprocessing import clean_movie_data

def train():
    df = clean_movie_data()
    X = df[['budget_x', 'release_year', 'score', 'primary_genre', 'orig_lang']]
    y = df['revenue']
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), ['budget_x', 'release_year', 'score']),
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['primary_genre', 'orig_lang'])
    ])
    
    model = Pipeline([('preprocessor', preprocessor), ('regressor', LinearRegression())])
    model.fit(X, y)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/practical_regression.pkl')
    print("Regression model saved!")

if __name__ == "__main__":
    train()