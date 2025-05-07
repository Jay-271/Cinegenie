import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";
//import { getAuth } from "firebase/auth"; fix npm run build if not used
import "./MovieRecommender.css";
import WatchedMovieModal from "../WatchedMovieModal";
import SearchMovie from "../searchmovie";
import {
  loadModel,
  modelInference,
  finetune,
  getAllMovieInference,
} from "./ModelLoader";
import { LayersModel, io, loadLayersModel} from "@tensorflow/tfjs";
import Bar from "./Bar";
import "./MovieRecommender.css";
import {
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
  OMDB_KEYS
} from "../../../firebaseconfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
} from "firebase/storage";

// Dynamic import for movies
const loadIMDBIDS = async () => {
  try {
    const response = await fetch('/utils/IMDBIDs.json'); 
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


type IMDBIDsType = {
  tconst: { [key: string]: string };
};

const db = getFirestore();
//const auth = getAuth(); fix npm run build if not used

function Recommender() {

  const [currentMovie, setCurrentMovie] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [model, setModel] = useState<LayersModel>();
  const [currentMovieScore, setCurrentMovieScore] = useState<
    number | undefined
  >(undefined);
  const [allMovieScores, setAllMovieScores] = useState<
  { imdbId: string; score: number | null; normalizedScore: number | null }[] | undefined
>();
const [top10, setTop10] = useState<
  { imdbId: string; score: number | null; normalizedScore: number | null }[] | undefined
>();
  const [top10MoviesFullData, setTop10MoviesFullData] = useState<any[]>([]);

  const [key, setKey] = useState("f4191c5c") // to keep track of the omdb api keys
  const [triedKeys, setTriedKeys] = useState<string[]>([]);

useEffect(() => {
  const loadTop10Movies = async () => {
    if (!top10 || top10.length === 0) return;

    const moviePromises = top10.map(async (movie) => {
      const omdbData = await fetchTop10MovieFromOMDB(movie.imdbId);
      return {
        ...omdbData,
        imdbId: movie.imdbId,
        score: movie.score,
        normalizedScore: movie.normalizedScore
      };
    });

    const results = await Promise.all(moviePromises);
    setTop10MoviesFullData(results.filter(Boolean)); // clean out nulls
  };

  loadTop10Movies();
}, [top10]);

const fetchTop10MovieFromOMDB = async (imdbId: string) => {
  const url = `https://www.omdbapi.com/?i=${imdbId}&apikey=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") {
      console.error(`OMDB Error: ${data.Error}`);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
};

  const saveWatchedMovie = async (imdbID: string) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.warn("⚠️ No user logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        moviesWatched: arrayUnion(imdbID),
      });

      console.log(`✅ Saved watched movie ${imdbID} for user ${userId}`);
    } catch (error) {
      console.error("❌ Error saving watched movie:", error);
    }
  };

  const saveLikedMovie = async (imdbID: string) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.warn("⚠️ No user logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        moviesLiked: arrayUnion(imdbID),
      });

      console.log(`✅ Saved liked movie ${imdbID} for user ${userId}`);
    } catch (error) {
      console.error("❌ Error saving watched movie:", error);
    }
  };

  const saveDislikedMovie = async (imdbID: string) => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      console.warn("⚠️ No user logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        moviesDisliked: arrayUnion(imdbID),
      });

      console.log(`✅ Saved disliked movie ${imdbID} for user ${userId}`);
    } catch (error) {
      console.error("❌ Error saving watched movie:", error);
    }
  };

  const fetchMovieFromOMDb = async (imdbID: string) => {
    // Try all keys in config file, tracking which have been tried
    const getMovie = async () => {
      let response: Response | null = null;
      const keysToTry = [key, ...OMDB_KEYS.filter(k => k !== key && !triedKeys.includes(k))]; // filter out used
      for (const tryKey of keysToTry) { // try next one
        try {
          response = await fetch(
            `https://www.omdbapi.com/?i=${imdbID}&apikey=${tryKey}`
          );
          // If not unauthorized or rate limited, break
          if (response.status !== 401 && response.status !== 403) {
            setKey(tryKey);
            setTriedKeys([]);
            break;
          } else {
            console.warn(`Key ${tryKey} failed with status ${response.status}`);  // if this next one failed then mark it as tried
            setTriedKeys(prev => [...prev, tryKey]);
          }
        } catch (e) {
          console.error(`Fetch failed for key ${tryKey}:`, e); // if still error mark it 
          setTriedKeys(prev => [...prev, tryKey]);
        }
        response = null; // if all options exhausted null it
      }
      return response; // here from break of new key passing the test
    };

    try {
      console.log(`📦 Fetching OMDb data for: ${imdbID}`);
      const response = await getMovie();
      if (!response) throw new Error(`Error getting the response from OMDB.` ); // check for TSX saying can't continue if null
      const data = await response.json();
      console.log("🎬 OMDb response:", data);

      if (data.Response === "True") {
        setCurrentMovie(data);
      } else {
        console.warn("⚠️ OMDb returned an error:", data.Error);
        fetchRandomMovie();
      }
    } catch (error) {
      console.error("❌ Failed to fetch movie from OMDb:", error);
      fetchRandomMovie();
    }
  };
  const fetchRandomMovie = async () => {
    const IMDBIDs = await loadIMDBIDS() as IMDBIDsType
    const imdbIDArray = Object.values(IMDBIDs.tconst);

    if (imdbIDArray.length === 0) {
      console.warn("⚠️ IMDb ID list is empty.");
      return;
    }

    const randomID =
      imdbIDArray[Math.floor(Math.random() * imdbIDArray.length)];
    console.log("🎲 Randomly selected local IMDb ID:", randomID);
    await fetchMovieFromOMDb(randomID);
  };

  useEffect(() => {
    console.log("📁 Loading first movie from local IMDb JSON...");
    fetchRandomMovie();
  }, []);

  const handleDislike = () => {
    fetchRandomMovie();
  };

  const handleWatchedMovie = () => {
    console.log("👀 User clicked 'Watched'.");
    saveWatchedMovie(currentMovie.imdbID);
    setIsModalOpen(true);
  };

  const handleLike = () => {
    console.log("👍 User liked the movie.");
    saveLikedMovie(currentMovie.imdbID);
    setIsModalOpen(false);
    fetchRandomMovie();
  };

  const handleDislikeFromModal = () => {
    console.log("👎 User disliked the movie.");
    saveDislikedMovie(currentMovie.imdbID);
    setIsModalOpen(false);
    fetchRandomMovie();
  };
  /////////////////////////
  // Model Logic
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const userId = user?.uid;

  const uploadModel = async (modelToSave: LayersModel) => {
    if (!modelToSave || !userId) {
      console.log("Model or User ID missing, skipping upload.");
      return;
    }

    //init paths to firebase
    const modelJsonPath = `profile_pictures/${userId}/model.json`;
    const weightsBinPath = `profile_pictures/${userId}/group1-shard1of1.bin`;
    const modelJsonRef = ref(FIREBASE_STORAGE, modelJsonPath);
    const weightsBinRef = ref(FIREBASE_STORAGE, weightsBinPath);

    //we have to re-write the save function in tfjs with tfjs.io to correctly save the paths
    try {
      const saveResult = await modelToSave.save(
        io.withSaveHandler(async (modelArtifacts) => {
          // Prepare model.json content as expected by tfjs manually
          // all this info can be seen inside of the JSON file `model.json` in the public directory
          const modelJson = {
            modelTopology: modelArtifacts.modelTopology,
            weightsManifest: [
              {
                paths: ["group1-shard1of1.bin"], // "locally saved (but uploaded later)"
                weights: modelArtifacts.weightSpecs || [], // weights are weights
              },
            ],
            format: modelArtifacts.format || "layers-model",
            generatedBy: modelArtifacts.generatedBy || "TensorFlow.js",
            convertedBy: modelArtifacts.convertedBy || null,
          };
          // Upload model.json
          const modelJsonString = JSON.stringify(modelJson);
          await uploadString(modelJsonRef, modelJsonString, "raw", {
            contentType: "application/json",
          });
          // technically this really isn't needed but it works incase later versions have different architectures (ie, more "intellegent" model)

          // Upload weights
          if (modelArtifacts.weightData) {
            const weightBlob = new Blob(
              [modelArtifacts.weightData as ArrayBuffer],
              { type: "application/octet-stream" }
            );
            await uploadBytes(weightsBinRef, weightBlob, {
              contentType: "application/octet-stream",
            });
          }
          return {
            modelArtifactsInfo: {
              dateSaved: new Date(),
              modelTopologyType: "JSON",
            },
          };
        })
      );
      console.log("model save done!", saveResult);
    } catch (e) {
      console.error("error calling model.save(): ", e);
    }
  };

  useEffect(() => {
    const initializeAndFinetuneModel = async () => {
      if (!userId) {
        console.log("unkown user");
        return;
      }

      //if user load paths to model to firebase
      let loadedModel: LayersModel | null = null;
      const modelJsonPath = `profile_pictures/${userId}/model.json`;
      const weightsBinPath = `profile_pictures/${userId}/group1-shard1of1.bin`;

      // 1. Attempt to load user-specific model
      try {
        console.log(
          "Attempting to load user-specific model from Firebase Storage..."
        );
        const modelJsonRef = ref(FIREBASE_STORAGE, modelJsonPath);
        const weightsBinRef = ref(FIREBASE_STORAGE, weightsBinPath);

        // Get download URLs
        const modelJsonUrl = await getDownloadURL(modelJsonRef);
        const weightsBinUrl = await getDownloadURL(weightsBinRef);
        console.log("User model URLs obtained.");

        // Load model using URLs
        try {
          loadedModel = await loadLayersModel(
            io.browserHTTPRequest(modelJsonUrl, {
              weightUrlConverter: async () => weightsBinUrl,
            })
          );
          console.log("Successfully loaded user-specific model.");
        } catch (loadError) {
          console.error("Error parsing user model JSON or weights:", loadError);
          // set baseModel to null if loading fails here
          loadedModel = null;
          throw loadError; // Propagate error to outer catch block
        }
        console.log("successfully loaded user-specific model.");
      } catch (error) {
        console.warn(
          "Failed to load user-specific model (may not exist yet):",
          error
        );
        // 2. looad the generic model
        try {
          console.log("Loading generic model as fallback...");
          loadedModel = (await loadModel()) as LayersModel;
          if (!loadedModel)
            throw new Error("Generic model could not be loaded.");
          console.log("Successfully loaded generic model.");
        } catch (genericError) {
          console.error("Failed to load generic model:", genericError);
          // If even the generic model fails, we can't do anything so componnent for bar will not work
          return;
        }
      }
      // Snnity check for model to make sure it is loaded.
      if (!loadedModel) {
        console.error("No model could be loaded.");
        return;
      }

      setModel(loadedModel); // Despite it 1 or 2, load either model here before continuing

      // 3. Fine-tune the loaded model (user-specific or generic)
      // This works because the LR is set really low, over LONG time it will learn user.
      try {
        console.log("Starting fine-tuning...");
        // Pass the loaded model to the finetune function
        const fineTunedModel = await finetune(loadedModel);

        if (fineTunedModel) {
          console.log("Fine-tuning completed succesfully. Model updated.");
          setModel(fineTunedModel); // upload current model in state
          loadedModel = fineTunedModel; // use the fine-tuned model for saving to firebase
        } else {
          console.warn(
            "Fine-tuning function did not return an updated model. Proceeding with the original loaded model."
          );
          // state retains original model
        }
        // 4. Save the (potentially fine-tuned) model back to user's storage
        console.log("attempting to save the model...");
        await uploadModel(loadedModel); // Save the final model state
        console.log("Model saved!");
      } catch (e) {
        console.error("Error during fine-tuning or saving:", e);
      }
    };

    initializeAndFinetuneModel();

    //fetchAllMovies();
  }, [userId]);

  useEffect(() => {
    const fetchAllMovies = async () => {
      // save for last part
      if (!userId) {
        console.log("unkown user or model logic not done");
        return;
      }
      if (allMovieScores) return; // to not re-do
      if (model) {
        try {
          const result = await getAllMovieInference(model); //{ imdbId: string; score: number | null }[]
          setAllMovieScores(result);
        } catch (e) {
          console.error("Error getting all movies", e);
          setAllMovieScores(undefined);
        }
      }
    };

    fetchAllMovies();
  }, [model]);

  /** This componnent was used to test functionality of the modelLoader tsx file.
  useEffect(() => {
    const test = async () => {
      //uploadModel()
      const model = await loadModel()
      setModel(model);
      console.log("Got the model!")
      if (!model) return;
      console.log("Starting finetuning")
      const mWait = await finetune(model)
      if (!mWait) {
        console.warn("Model not fintuned")
        return
      }
      console.log("Model fintuned")
      setModel(mWait)
      await uploadModel(model)

    }
    //test()
    //uploadModel()

  }, [])
   */

  /////////////////
  useEffect(() => {
    const fetchValue = async () => {
      if (model && currentMovie?.imdbID) {
        try {
          const result = await modelInference(model, currentMovie.imdbID);
          setCurrentMovieScore(result);
        } catch (error) {
          console.error("Error fetching model inference:", error);
          setCurrentMovieScore(0);
        }
      }
    };
    fetchValue();
  }, [model, currentMovie?.imdbID]);

  useEffect(() => {
    const getTop10 = async () => {
      if (allMovieScores) {
        try {
          // Sort by score descending, filter out nulls, take top 10
          const top10 = [...allMovieScores]
            .filter((m) => m.score !== null)
            .sort((a, b) => b.score! - a.score!)
            .slice(0, 10);
          setTop10(top10);
        } catch (e) {
          console.error("Error getting top10 movies", e);
          setTop10(undefined);
        }
      }
    };
    getTop10();
  }, [allMovieScores]);

  if (!currentMovie) {
    return <Typography>Loading movies...</Typography>;
  }
  
  return (
    <div className="recommender-container" style={{
    height: "70vh"}}>

      <Card
        sx={{
          borderRadius: "10px",
          backgroundColor: "#282c34",
          maxWidth: 400,
          mx: "auto",
          textAlign: "center",
        }}
      >
        {currentMovie.Poster && currentMovie.Poster !== "N/A" ? (
          <CardMedia
            component="img"
            height="450"
            image={currentMovie.Poster}
            alt={currentMovie.Title}
          />
        ) : (
          <Box
            height={450}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bgcolor="#444"
          >
            <Typography variant="body1" color="white">
              No image available
            </Typography>
          </Box>
        )}
        <CardContent>
          <Typography sx={{ color: "white", fontWeight: "bold" }} variant="h6">
            {currentMovie.Title} ({currentMovie.Year})
          </Typography>

          <Typography variant="body2" color="grey" gutterBottom>
            Genre(s): {currentMovie.Genre}
          </Typography>

          <Typography variant="body2" color="white" sx={{ mb: 2 }}>
            {currentMovie.Plot !== "N/A"
              ? currentMovie.Plot
              : "No plot available."}
          </Typography>

          {currentMovie.Ratings && currentMovie.Ratings.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {currentMovie.Ratings.find(
                (r: any) => r.Source === "Internet Movie Database"
              ) && (
                <Typography variant="body2" color="white">
                  IMDb:{" "}
                  {
                    currentMovie.Ratings.find(
                      (r: any) => r.Source === "Internet Movie Database"
                    ).Value
                  }
                </Typography>
              )}
              {currentMovie.Ratings.find(
                (r: any) => r.Source === "Rotten Tomatoes"
              ) && (
                <Typography variant="body2" color="white">
                  Rotten Tomatoes:{" "}
                  {
                    currentMovie.Ratings.find(
                      (r: any) => r.Source === "Rotten Tomatoes"
                    ).Value
                  }
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
            <Button variant="contained" color="error" onClick={handleDislike}>
              Skip
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleWatchedMovie}
            >Watched</Button>
          </Box>
        </CardContent>
      </Card>

      <WatchedMovieModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movie={currentMovie}
        onLike={handleLike}
        onDislike={handleDislikeFromModal}
      />
      <br />
      <Bar value={currentMovieScore} />
      <ul>
      <h1>Recommended Movies</h1>
      {top10MoviesFullData.map((movie) => (
      <Box
      key={movie.imdbId}
      sx={{
        backgroundColor: "#1f1f1f",
        color: "white",
        padding: 2,
        borderRadius: 2,
        marginBottom: 2,
        boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
      }}
    >
      <Typography variant="h6">
        {movie.Title} ({movie.Year}) – Likelihood: {`${(movie.normalizedScore * 100).toFixed(0)}%`}
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        {movie.Poster && movie.Poster !== "N/A" && (
          <img
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            style={{ height: 100, borderRadius: 8 }}
          />
        )}
        <Typography variant="body2">{movie.Plot}</Typography>
      </Box>
    </Box>
  ))}
</ul>
<SearchMovie/>
      </div>
  );
}

export default Recommender;
