import pandas as pd

def clean_movie_data(csv_path='dataset/imdb_movies_6000_box_office_clean.csv'):
    df = pd.read_csv(csv_path)
    df['release_year'] = pd.to_datetime(df['date_x'], errors='coerce').dt.year
    df['primary_genre'] = df['genre'].fillna('Unknown').apply(lambda x: x.split(',')[0].strip())
    
    def get_tier(rev):
        if rev < 30_000_000: return 'Flop (<$30M)'
        elif rev < 150_000_000: return 'Average Hit ($30M-$150M)'
        else: return 'Blockbuster (>$150M)'
            
    df['success_tier'] = df['revenue'].apply(get_tier)
    df['is_profitable'] = (df['revenue'] > df['budget_x']).astype(int)
    
    df = df.dropna(subset=['budget_x', 'revenue', 'score', 'release_year']).reset_index(drop=True)
    return df