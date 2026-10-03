import os
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.mixture import GaussianMixture
from src.preprocessing import clean_movie_data

def train():
    df = clean_movie_data()
    X = df[['budget_x', 'revenue', 'score']]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    pca = PCA(n_components=2, random_state=42)
    pca.fit(X_scaled)
    
    gmm = GaussianMixture(n_components=4, random_state=42)
    gmm.fit(X_scaled)
    
    os.makedirs('models', exist_ok=True)
    joblib.dump({'scaler': scaler, 'pca': pca, 'gmm': gmm}, 'models/practical_unsupervised.pkl')
    print("Unsupervised models saved!")

if __name__ == "__main__":
    train()