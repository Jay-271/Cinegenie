# Welcome CineGenie!

Cinegenie is an app that utilizes a machine learning based approach to reccomend you your next favorite movie. Some features of our webapp include:
    - Movies Recommended To You​
    - Account Creation​
    - Be able to See Friends Liked Movies​
    - Be able to Add Friends​
    - Have your own Profile & Profile Picture via firebase, etc.

You can visit it NOW at [cinegenie.live]('cineegenie.live')! Team workflow was done via **Jira** and additional documentation, personas, & scenarios was all done in **Confluence** via atlassian.

## How it works

Cinegenie has a fully client-side architecture with cloud-based authentication and related database features.​ The main component of our app is our ML model. It is unique to each user and is finetuned on every visit to our website.

Our tech stack:
    - React + Vite for framework using Typescript for type safety.
        * Additional component libraries were used including bootstrap, react-router, etc.
    - Firebase (Firebase Storage, Firebase Store)​ for profile picures, users auth, etc.
    - Jest for testing
    - Machine learning libraries such as Tensorflow, TensorflowJS, pandas, numpy, etc.

## About the model

The ML model was evaluated after training on user preference data and achieved approximately 97% accuracy in predicting how much a user would like a given movie. Evaluation metrics included Mean Squared Error (MSE) and Mean Absolute Error (MAE).​
- Essentially, the model can learn what YOU like with an accuracy of up to 97%.

## TODO

1. Expanding our dataset to ALL movies and having a model for TV Series would be a great addition​
2. Model optimizations techniques in the finetuning process such as memory cleanup, etc.​
3. Having English Movies​
4. Recommended Movie Goes to Card​
5. Being able to rate the movies you’ve watched​
6. Being able to write reviews on the movies you’ve watched​

# Frontend Quickstart

-> Install [Node.js](https://nodejs.org/en/download) <br />
-> Install [Python3.11](https://www.python.org/downloads/release/python-3114/) <br />

To run the frontend open up a new terminal from the root directory `ciniegenie`
    - cd frontend
    - npm install
    - npm run dev

> Additional dependencies might be missing, if so just try and build the project in the `frontend` directory or simply test the app fully works using `npm run dev`.


If you followed everything and all is good then You're all set up!
    - If something is wrong please contact one of the contributors.

# Backend Quickstart

## 1. Setting Up Your Environment

**Create a Virtual Environment**

- **Command:**
  ```bash
  cd backend
  python -m venv work
  ```
- **Activation:**
  - **Windows:**
    ```bash
    .\work\Scripts\activate
    ```
  - **macOS/Linux:**
    ```bash
    source work/bin/activate
    ```

**Install Dependencies**

- **Packages:** pandas, numpy, scikit-learn, tensorflow, tensorflowjs.
- **Note:**tensorflowjs may have issues on Windows; consider alternatives like UNIX/LINUX if problems arise.
- **Command:**
  ```bash
  pip install -r requirements.txt
  ```

- You might need additional requirements like `ipykernel` or `jupyter-notebook`depending on your environment.

## 2. Data Prep

**Download IMDB Datasets**

- **Source:** Obtain from the IMDB [open datasets section]('https://developer.imdb.com/non-commercial-datasets/').
- Place these files in a `data` directory within your backend folder.

## 3. Data Processing

**Run Jupyter Notebook for Data Cleaning**

- **File:** `train_models.ipynb`
- **Objective:** Process raw data into cleaned a dataset.
- **Output Files:**
  - `processed_movies.csv`: Contains movie details like title, year, genre, etc.
  - `movies_with_genres.csv`: Includes additional genre information.
  - For more information, see [backend documentation](./backend/README.md)

## 4. Model Creation

**Train Neural Network**

- **File:** `create_NN.ipynb`
- **Objective:** Develop a neural network model to predict how much a user might like a movie.
- **Output:** Trained model saved as `improved_movie_rating_model.keras` in the `backend` directory.
  
    - Be sure to **Rename The Model File!!** `improved_movie_rating_model.keras` -> `basic_model.keras`

## 5. Convert Model to TensorFlow.js Format

**Run Conversion Script**

- **File:** `to_tfjs.py`
- **Objective:** Convert the Keras model into a format compatible with TensorFlow.js for use in frontend.
- **Output:**
  - New directory `tfjs_model` containing:
    - `model.json`
    - `group1-shard1of1.bin`

> **Manual Adjustment** is IMPORTANT!!

- **File to Edit:** `tfjs_model/model.json`
- **Change:** Replace `"batch_shape"` key with `"batch_input_shape"`.
- This has to do with some bug in the TFJS converter. 

## 6. Optional Steps for Frontend Updates

**To Update Title Data**

- **File:** `only_titles.ipynb`
- **Objective:** Extract and update movie titles used on the frontend.

**To Recreate Processed Movies Data**

- **File:** `recreate_processed_movies.ipynb`
- **Objective:** Generate updated processed movies data used in the frontend

## Deprecated Note

- **File:** `frontend_dataset.ipynb`
- No longer used; was used to upload files to firebase.
