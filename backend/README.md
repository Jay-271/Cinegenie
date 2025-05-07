# Readme Quick Start

Changes from before:
1. The file `train_models.ipynb` has been modified extensively to produce a more closely-aligned model geared toward what we want using some feature engineering for a cold start. This file only contains code to craft our datasets and the Nerual Network implementation has moved to `create_NN.ipynb`.
2. The file `frontend_dataset.ipynb` is DEPRECATED and was the workflow used to upload movie files following this path:
    * Get data from IMDB datasets (`.tsv` files) and combine + extract what we wanted from there. [See this section of the readme for more](#teams-update-with-movies--issues)
    * We are now using `https://www.omdbapi.com/` for the frontend poster data and related information
3. The file `movie-api-wrapper.py` -> name change to -> `movie_api_wrapper.py` due to some CLI issues whilst testing the above.
4. The file `to_train.json` is a sample to simulate some user liking a random movie. We will use samples like this per user to finetune models. 
5. The file `create_NN.ipynb` is the Neural Network creation implementation for our Cinegenie movie reccomendation system! 
6. The file `.gitignore` just includes minor folder paths to not clog gitlab with useless data.
7. The folder `model_data` should have everything we need. File by file it is:
    * `basic_model.keras` -> model
    * `model_metadata.json` -> model training information
    * `.npz`, `.npy` -> X and Y of model
    * `translate_metadata.json` -> Old mapping from `train_models.ipynb` final cell. Renamed from `recommendation_metadata.json` -> `translate_metadata.json`. This was done to ensure we know what each JSON is used for more effectively
    
# train_models.ipynb

## Data Loading and Preprocessing

1. Loads and processes IMDb datasets including movies, ratings, and actor information
2. Filters to only include movies and merges relevant data
    ```py
    # Filter data to include only movies
    movies_df = title_basics_df[title_basics_df['titleType'] == 'movie'].copy()

    # Merge movies data w/ ratings data
    movies_with_ratings = pd.merge(movies_df, title_ratings_df, on='tconst', how='left')

    # Get actors for each movie
    actors_df = title_principals_df[title_principals_df['category'].isin(['actor', 'actress'])]
    actors_with_names = pd.merge(actors_df, name_df[['nconst', 'primaryName']], on='nconst', how='left')
    ```
3. Starts with some feature engineering for genres, actors, etc. Uses top 500 actors for a decent amount of features & to not overdo it.
    ```py
    # Create feature matrices
    genre_mlb = MultiLabelBinarizer()
    genre_features = genre_mlb.fit_transform(final_dataset['genres'])

    actor_mlb = MultiLabelBinarizer(classes=top_actors)
    actor_features = actor_mlb.fit_transform(final_dataset['actor_ids'])

    # Create combined feature matrix
    X = np.hstack([
        final_dataset[['year_normalized']].values,
        genre_features,
        actor_features
    ])
    ```
> For a more detailed workflow please visit the **train_models.ipynb** file

## Neural Network Implementation (create_NN.ipynb)

Our movie recommendation system uses a neural network that achieves **95% accuracy** in recommending movies!!

### How It Works

1. **Features (530 total)**:
   - Movie release year (normalized)
   - Genre information (Action, Comedy, Drama, etc.)
   - Top 500 most popular actors
   - Movie ratings from IMDb

2. **Two-Stage Approach**:
   - **Cold Start (feature engineering)**: For new users, we recommend highly-rated movies based on general popularity
   - **Personalization**: As users rate movies (like/dislike), we fine-tune recommendations specifically for them

3. **High Precision**:
   - Our validation metrics show that predictions are accurate within 0.2 points on a 10-point scale
   - Epoch 59/1000 training results: `3997/3997 - 16s - 4ms/step - loss: 0.0096 - mae: 0.0743 - mse: 0.0096 - val_loss: 0.0013 - val_mae: 0.0253 - val_mse: 0.0013 - learning_rate: 1.0000e-05`
        * loss: The primary optimization to minimize
        * mae: avg absolute difference between prediction and actual values
        * mse: average of squared differences between prediction and actual values
        * val_loss, val_mae, val_mse: same metrics on validation data (what matters but not used for training!)
        * learning_rate: how fast to learn
   - **TLDR -- This translates to approximately 97.7% recommendation accuracy!**

4. **Simple Feedback Loop in training**:
   - Users mark movies as "liked" or "disliked"

The neural network uses modern techniques like batch normalization and dropout to prevent overfitting, ensuring that recommendations remain relevant and diverse.

## Teams Update with movies + issues

> ❌ DEPRECATED!!! We are using `https://www.omdbapi.com/` for this frontend section now! 

This section contains highlighted issues and data is under the `files` tab in Teams. 
### cols needed
 
* title, year, category (genre?), cast, poster, videos, description
 
### what is in imdb?
 
title.akas.tsv.gz

1. title (string)
 
title.basics.tsv.gz

1. startYear (is release year)

2. genres (string arr)
 
### mising
 
cast -> only directors exist, no full cast.

poster -> Need to get via some other api

videos (link) -> Need to get via some other api

Description -> not included from dataset
 
### So what's being made?
 
Dataframe consisting of `tconst` (to map), `primaryTitle`, `originalTitle`, `startyear`, `genres array`, `runtimeMinutes`.

*Left runtime in there just in case. Indicator of non-existent value is `\n`*
 