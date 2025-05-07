import { useState } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
} from "@mui/material";
import { getFirestore, doc, updateDoc, arrayUnion, getDoc, arrayRemove } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import WatchedMovieModal from "../components/WatchedMovieModal";
import { OMDB_KEYS } from "../../firebaseconfig";

const db = getFirestore();
const auth = getAuth();

function SearchMovie() {

    const [currentMovie, setCurrentMovie] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    //ideally we would've wanted to pass these as props but for simplicity sake lets just remake them
    const [key, setKey] = useState("") // to keep track of the omdb api keys
    const [triedKeys, setTriedKeys] = useState<string[]>([]);

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
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                // Remove from moviesDisliked if it exists there
                if (userData.moviesDisliked?.includes(imdbID)) {
                    await updateDoc(userRef, {
                        moviesDisliked: arrayRemove(imdbID),
                    });
                }

                await updateDoc(userRef, {
                    moviesLiked: arrayUnion(imdbID),
                });

                console.log(`✅ Saved liked movie ${imdbID} for user ${userId}`);
            } else {
                console.log("User document does not exist.");
            }
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
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                // Remove from moviesLiked if it exists there
                if (userData.moviesLiked?.includes(imdbID)) {
                    await updateDoc(userRef, {
                        moviesLiked: arrayRemove(imdbID),
                    });
                }

                await updateDoc(userRef, {
                    moviesDisliked: arrayUnion(imdbID),
                });

                console.log(`✅ Saved liked movie ${imdbID} for user ${userId}`);
            } else {
                console.log("User document does not exist.");
            }
        } catch (error) {
            console.error("❌ Error saving watched movie:", error);
        }
    };

    //Need to ask Jason what things is he filtering on in the processed ids. In watch history i need that so that it is consistant and matches with the data here. 
    const fetchMovieFromOMDbySearch = async (search: string) => {
        // CODE REUSED FROM PARENT COMPONENT MovieReccomender.tsx
        
    // Try all keys in config file, tracking which have been tried
    const getMovie = async () => {
      let response: Response | null = null;
      const keysToTry = [key, ...OMDB_KEYS.filter(k => k !== key && !triedKeys.includes(k))]; // filter out used
      for (const tryKey of keysToTry) { // try next one
        try {
          response = await fetch(
            `https://www.omdbapi.com/?t=${search}&type=movie&apikey=${tryKey}`
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
      console.log(`📦 Fetching OMDb data for: ${search}`);
      const response = await getMovie();
      if (!response) throw new Error(`Error getting the response from OMDB.` ); // check for TSX saying can't continue if null
      const data = await response.json();
      console.log("🎬 OMDb response:", data);

            if (data.Response === "True") {
                setCurrentMovie(data);
            } else {
                console.warn("⚠️ OMDb returned an error:", data.Error);
            }
        } catch (error) {
            console.error("❌ Failed to fetch movie from OMDb:", error);
        }
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
    };

    const handleDislikeFromModal = () => {
        console.log("👎 User disliked the movie.");
        saveDislikedMovie(currentMovie.imdbID);
        setIsModalOpen(false);
    };

    return (
        <div style={{ padding: "50px", display: "flex", flexDirection: "column", marginBottom: "20px", alignItems: "center", justifyContent: "Center" }}>
            <h2>Not finding what you want?</h2>
            <h1>Search Movie</h1>
            <Box padding="25px" display="flex" flexDirection="column" alignItems="center" gap={2}>
                <input
                    type="text"
                    placeholder="Search for a movie..."
                    onChange={(e) => {
                        //added some wait time because this kill our api calls as the user types each keystroke was a request.
                        //https://www.freecodecamp.org/news/how-to-use-settimeout-in-react-using-hooks/
                        if ((window as any).searchTimeout) clearTimeout((window as any).searchTimeout);
                        (window as any).searchTimeout = setTimeout(() => {
                            fetchMovieFromOMDbySearch(e.target.value);
                        }, 1500); // 1.5sec
                    }}
                    style={{ padding: "8px", fontSize: "16px", width: "300px", borderRadius: "12px" }}
                />

                {currentMovie && (
                    <Card sx={{ maxWidth: 345 }}>
                        <CardMedia
                            component="img"
                            height="500"
                            image={currentMovie.Poster}
                            alt={currentMovie.Title}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {currentMovie.Title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {currentMovie.Plot}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Year: {currentMovie.Year} | Genre: {currentMovie.Genre}
                            </Typography>
                        </CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-around", mt: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleWatchedMovie}
                            >
                                Watched?
                            </Button>
                        </Box>
                        <WatchedMovieModal
                            open={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            movie={currentMovie}
                            onLike={handleLike}
                            onDislike={handleDislikeFromModal}
                        />
                    </Card>
                )}
            </Box>
        </div>

    );
}
export default SearchMovie;
