import { LayersModel, loadLayersModel, Tensor2D, zeros, ones, tensor2d, concat, train, tidy, Tensor} from "@tensorflow/tfjs";
import {
  FIREBASE_AUTH,
  FIRESTORE_DB,
} from "../../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
// imports here moved to MovieReccomender.tsx

/*
  Notes:
  "learning_rate": 9.999999747378752e-06

  Preparing X and Y should be relatively easy, we already have our feature vector builder
  Since we are only working with data we already have it should be okay to re-use our components

  [
  {"tconst" : "t00001", "watched" : "yes", "liked": "no"}
  {"tconst" : "t00001", "watched" : "yes", "liked": "no"}
  {"tconst" : "t00001", "watched" : "yes", "liked": "no"}
  ]

  ^ Data will look like that more or less

  */

// Dynamic import for modelMetadata
const loadModelMetadata = async () => {
  const metadata = await import("./model_metadata.json");
  return metadata.default;
};

// Dynamic import for movies
const loadMovies = async () => {
  try {
    const response = await fetch('/model/processed_movies.json'); 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const moviesData = await response.json();
    return moviesData; 
  } catch (error) {
    console.error("Failed to load movies:", error);
    return null;
  }
};

const finetune = async (model: LayersModel) => {
  const movies = await loadMovies();
  const modelMetadata = await loadModelMetadata();
  // TODO: Finish function logic:
  /*
  1. Ideally run every time new stuff inside of firebase of liked and disliked. 
    a. Right now it runs everytime page loads so use low LR
  2. optimize
  3. handle more edge casess
  */
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const userId = user?.uid;
  console.log("fintuned called");
  if (!userId) return model;

  if (!model) {
    console.error("Fine-tuning skipped: Invalid model provided.");
    return null;
  }

  try {
    // Get user document to retrieve the moviesWatched array
    const userDocRef = doc(FIRESTORE_DB, "users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const movieActors = userData.actors || []; // Get the array
      const movieGenres = userData.movieGenres || []; // Get the array
      const moviesDisliked = userData.moviesDisliked || []; // Get the array
      const moviesLiked = userData.moviesLiked || []; // Get the array
      console.log("movieActors: ", movieActors);
      console.log("movieGenres: ", movieGenres);
      console.log("moviesDisliked: ", moviesDisliked);
      console.log("moviesLiked: ", moviesLiked);

      const actorVector = finetuneBuildFeatureVectorActors(
        movieActors,
        modelMetadata
      ); // liked = 1
      console.log("Got vector for actors");
      const genreVector = finetuneBuildFeatureVectorGenre(
        movieGenres,
        modelMetadata
      ); // liked = 1
      // we dont know how many disliked atp
      console.log("Got vector for genres");

      const dislikedMovieArr: number[][] = [];
      moviesDisliked.forEach((tconst: string) => {
        if (!tconst) return;
        const movie = (movies as any)[tconst];
        if (!movie) {
          console.error(`no movie data for ${tconst}`);
          return;
        }
        try {
          const featureVector = buildFeatureVector(
            movie.startYear,
            movie.genres,
            movie.actor_ids,
            movie.averageRating,
            modelMetadata
          );
          dislikedMovieArr.push(featureVector);
        } catch (e) {
          console.error(`Movie not in mapping... making a 0 vector`, e);
          //return 0 vector
          const v = new Array(modelMetadata.feature_count).fill(0);
          dislikedMovieArr.push(v);
        }
      }); // liked == 0 foreach

      // we dont know how many Liked atp
      const likedMovieArr: number[][] = [];
      moviesLiked.forEach((tconst: string) => {
        const movie = (movies as any)[tconst];
        if (!tconst) return;
        if (!movie) {
          console.error(`no movie data for ${tconst}`);
          return;
        }
        try {
          const featureVector = buildFeatureVector(
            movie.startYear,
            movie.genres,
            movie.actor_ids,
            movie.averageRating,
            modelMetadata
          );
          likedMovieArr.push(featureVector);
        } catch (e) {
          console.error(`Movie not in mapping... making a 0 vector`, e);
          //return 0 vector
          const v = new Array(modelMetadata.feature_count).fill(0);
          likedMovieArr.push(v);
        }
      }); // liked == 1 foreach

      const likedTensor =
        likedMovieArr.length > 0
          ? tensor2d(likedMovieArr)
          : zeros([0, modelMetadata.feature_count]); // Create empty 2D tensor if no liked movies
      const dislikedTensor =
        dislikedMovieArr.length > 0
          ? tensor2d(dislikedMovieArr)
          : zeros([0, modelMetadata.feature_count]); // Create empty 2D tensor if no disliked movies

      const allFeatureVectors: Tensor2D[] = [
        tensor2d([actorVector]),
        tensor2d([genreVector]),
        likedTensor as Tensor2D,
        dislikedTensor as Tensor2D,
      ];

      console.log("got feature vectors");
      const labels: Tensor2D[] = [
        ones([1, 1]), // actor vector: liked == 1
        ones([1, 1]), // genre vector: liked == 1
        ones([likedMovieArr.length, 1]), // liked movies: liked == 1
        tensor2d(new Array(dislikedMovieArr.length).fill(-1), [dislikedMovieArr.length, 1]), // disliked movies: liked == -1
      ];

      //final check
      const validFeatureTensors = allFeatureVectors.filter(
        (t) => t.shape[0] > 0
      );
      const validLabelTensors = labels.filter((t) => t.shape[0] > 0);

      if (validFeatureTensors.length === 0) {
        console.log("No valid training data found for fine-tuning.");
        return model; // Return the original model if no data
      }

      console.log("got label vectors");

      const X_train = concat(validFeatureTensors, 0); // Result is 2D
      const y_train = concat(validLabelTensors, 0); // Result is 1D

      console.log("X_train shape:", X_train.shape);
      console.log("y_train shape:", y_train.shape);

      if (X_train.shape[0] === 0) {
        console.log("Concatenated training data is empty.");
        return model;
      }

      const y_train_reshaped = y_train.reshape([-1, 1]); // for loss function
      console.log("y_train_reshaped shape:", y_train_reshaped.shape);

      console.log("Compiling model for fine-tuning...");
      model.compile({
        optimizer: train.adam(9.999999747378752e-4), // Use Adam optimizer with the learning rate from notes
        loss: "meanSquaredError",
        metrics: ["mse", "mae"],
      });

      console.log("Starting training...");
      await model.fit(X_train, y_train_reshaped, {
        epochs: 5,
        batchSize: 32, // Specify batch size (even if total samples < batchSize)
      });
      console.log("Training finished!");
      //uploadModel()
      return model;
    }
  } catch (error) {
    console.error(
      "Error getting user data movies or feature parsing issue:",
      error
    );
    return null;
  }
};

//const movies = await import("./processed_movies.json")
//const modelMetadata = await import("./model_metadata.json")

const loadModel = async () => {
  try {
    //console.error(json)
    //renamed batch_shape -> batch_input_shape INSIDE the JSON produced by tfjs converter. now just works
    const model = await loadLayersModel("/model/model.json");
    console.log("Model loaded:", model);
    //harcodeed test
    //const score = modelInference(model, 'tt0000147')

    //harcoded next test for array stuff
    /*
      const imdbArr = []
      for (const key in movies) {
        imdbArr.push(key);
      }
      const results = batchModelInference(model, imdbArr)
      console.log(results)
      */
    return model; // Return the loaded model
  } catch (err) {
    console.error("Model load error:", err);
    // Return undefined or null, or rethrow the error if you want to handle it upstream
    return undefined;
  }
};

async function getAllMovieInference(model: LayersModel) {
  const movies = await loadMovies();
  const imdbArr = [];
  for (const key in movies) {
    imdbArr.push(key);
  }
  const results = batchModelInference(model, imdbArr);
  return results;
}

// handles array of size N
async function batchModelInference(
  model: LayersModel,
  tconstArr: Array<string>,
  chunkSize = 1000
) {
  const movies = await loadMovies();
  const modelMetadata = await loadModelMetadata();
  const allResults: { imdbId: string; score: number | null }[] = []; // Need to map back to imdbId and score
  console.log(
    `Starting batch inference for ${tconstArr.length} movies in chunks of ${chunkSize}`
  ); // Ideally we would want dynamic allocation based off of RAM usage

  for (let i = 0; i < tconstArr.length; i += chunkSize) {
    const chunkTconstArr = tconstArr.slice(i, i + chunkSize);
    const featuresArr: Array<number[]> = [];
    const validTconstsInChunk: string[] = []; // Keep track of tconsts for which features were successfully generated

    //console.log(`Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(tconstArr.length / chunkSize)} (movies ${i + 1} to ${Math.min(i + chunkSize, tconstArr.length)})`);

    for (const arrMovie of chunkTconstArr) {
      // for movies in this chunk we are working in follow same "checks" as in the single inference
      const movie = (movies as any)[arrMovie];
      if (!movie) {
        console.warn(`No movie data for ${arrMovie}, skipping.`);
        continue;
      }
      try {
        const featureVector = buildFeatureVector(
          movie.startYear,
          movie.genres,
          movie.actor_ids,
          movie.averageRating,
          modelMetadata
        );
        featuresArr.push(featureVector);
        validTconstsInChunk.push(arrMovie); // Add tconst only if feature vector was created
      } catch (e) {
        console.error(`Error processing movie ${arrMovie}:`, e);
      }
    }

    if (featuresArr.length === 0) {
      console.warn(
        `No valid features generated for chunk starting at index ${i}.`
      ); // incase all id's passes in this chunk were not part of the data
      continue; // next chunk, skip next logic
    }

    // Use tf.tidy to automatically dispose of intermediate tensors

    /*
    Executes the provided function fn and after it is executed, cleans up all intermediate tensors allocated by fn except those returned by fn. fn must not return a Promise (async functions not allowed).
    The returned result can be a complex object.
    Using this method helps avoid memory leaks. In general, wrap calls to operations in tf.tidy for automatic memory cleanup.
    NOTE: Variables do not get cleaned up when inside a tidy(). If you want to dispose variables, please use tf.disposeVariables or call dispose() directly on variables.
    */
    const chunkResults = tidy(() => {
      new Promise((resolve) => setTimeout(resolve, 3)); // 3ms pause

      const inputTensor = tensor2d(featuresArr);
      const out = model.predict(inputTensor) as Tensor;
      // need to await the data outside tidy or clone it if needed later
      return out.dataSync(); // Use dataSync for simplicity within tidy, or handle async outside
    });

    // only if once we get all the chunk results we map scores back to their tconsts
    const resultsForChunk = validTconstsInChunk.map((tconst, index) => ({
      imdbId: tconst,
      score: chunkResults[index] !== undefined ? chunkResults[index] : null, // use score from chunk result or null if undefined
    }));

    allResults.push(...resultsForChunk);
    console.log(
      `Finished processing chunk ${Math.floor(i / chunkSize) + 1
      }. Current total results: ${allResults.length}`
    );

    await new Promise((resolve) => setTimeout(resolve, 10)); // 5 -> 10ms pause for smoother UI experience but slower loading overall...
  }

  console.log("Batch inference complete. Total results:", allResults.length);

  /**
   * This section of code was added because after finetuning some weird happened where
   * values appeared to be increase (above 1, even saw 2.4, etc)
   *
   * the model card score itself is fine though so some issue in the batch model inference
   * not getting the adequte score, so we will apply normalization.
   */
  // Find min and max scores (ignoring nulls)
  const validScores = allResults
    .map((result) => result.score)
    .filter((s): s is number => s !== null && !isNaN(s));

  // Use reduce to find min/max safely for large arrays
  // we get min (or max) as inf or -inf initially, if error then set to 0.
  // these functions should take O(n) time each I think since we compare curr with min and if min is less than curr set new val
  // same logic for max
  const minScore =
    validScores.length > 0
      ? validScores.reduce((min, current) => Math.min(min, current), Infinity)
      : 0;
  const maxScore =
    validScores.length > 0
      ? validScores.reduce((max, current) => Math.max(max, current), -Infinity)
      : 0;

  // Normalize scores to [-1, 1]
  const normalizedResults = allResults.map((result) => {
    //base case just in case
    if (result.score === null || isNaN(result.score)) {
      return { ...result, normalizedScore: null };
    }
    // Avoid division by zero if all scores are the same
    if (maxScore === minScore) {
      return { ...result, normalizedScore: 0 };
    }
    const normalized =
      ((result.score - minScore) / (maxScore - minScore)) * 2 - 1;
    return { ...result, normalizedScore: normalized };
  });

  // Sort by normalizedScore descending
  normalizedResults.sort(
    (a, b) => (b.normalizedScore ?? -1) - (a.normalizedScore ?? -1)
  );

  return normalizedResults;
}

//harcodeed test
//const score = modelInference(model, 'tt0000147')
async function modelInference(model: LayersModel, tconst: string) {
  const movies = await loadMovies();
  const modelMetadata = await loadModelMetadata();
  // given model and tconst === imdb id
  //prep the feature vector
  const movie = (movies as any)[tconst];
  if (!movie) {
    console.error(`no movie data for ${tconst}`);
  }

  try {
    const featureVector = buildFeatureVector(
      movie.startYear,
      movie.genres,
      movie.actor_ids,
      movie.averageRating,
      modelMetadata
    );
    const input = tensor2d([featureVector]);
    const out = model.predict(input) as Tensor; // inference in tsx
    const score = (await out.data())[0];
    console.log(`${tconst} got score `, score);
    return score;
  } catch (e) {
    console.error(`Movie not in mapping...`, e);
    return 0;
  }

  return 0;
}

function buildFeatureVector( // just reworked to tsx from python
  year: number,
  genres: string[],
  actors: string[],
  rating: number,
  mData: any
): number[] {
  const features = new Array(mData.feature_count).fill(0);
  features[mData.year_index] = (year - 1900) / (2025 - 1900);
  genres.forEach((g) => {
    const i = mData.genre_names.indexOf(g);
    if (i >= 0) features[mData.genre_start_index + i] = 1;
  });
  actors.forEach((a) => {
    const i = mData.actor_names.indexOf(a);
    if (i >= 0) features[mData.actor_start_index + i] = 1;
  });
  features[mData.rating_index] = rating / 10;
  return features;
}

//finetune specific functions, will do the above but differently
function finetuneBuildFeatureVectorActors( // just reworked to tsx from python
  actors: string[],
  mData: any
): number[] {
  const features = new Array(mData.feature_count).fill(0);
  actors.forEach((a) => {
    const i = mData.actor_names.indexOf(a);
    if (i >= 0) features[mData.actor_start_index + i] = 1;
  });
  return features;
}
function finetuneBuildFeatureVectorGenre( // just reworked to tsx from python
  genres: string[],
  mData: any
): number[] {
  const features = new Array(mData.feature_count).fill(0);
  genres.forEach((g) => {
    const i = mData.genre_names.indexOf(g);
    if (i >= 0) features[mData.genre_start_index + i] = 1;
  });
  return features;
}
export {
  loadModel,
  modelInference,
  batchModelInference,
  getAllMovieInference,
  finetune,
};
