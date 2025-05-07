import { useState, useEffect, useMemo } from "react";
import {
  getDoc,
  doc,
} from "firebase/firestore";
import { FIREBASE_AUTH,FIRESTORE_DB } from "../../../firebaseconfig";
import NavbarHome from "../../components/NavBarLoggedIn";
// This component displays the movie IDs that the user has watched. TODO: We need to populate movie IDs when the user watches a movie.
function WatchHistory() {
    const db = FIRESTORE_DB;
    const [movies, setMovies] = useState<{ id: string; originalTitle?: string; genres?: string; startYear?: string; runtimeMinutes?: string}[]>([]);
    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    const userId = user?.uid;
  useEffect(() => {
    if (!userId) return; // Prevents running if user is not logged in

    const fetchMovies = async () => {
      try {
        // Get user document to retrieve the moviesWatched array
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const movieIds = userData.moviesWatched || []; // Get the array of movie IDs
          if (movieIds.length === 0) return; // Avoid querying if no movies

          //else fetch the movie data
          const moviePromises = movieIds.map(async (movieId: string) => {
            const movieDocRef = doc(db, "moviedata", movieId);
            const movieDocSnap = await getDoc(movieDocRef);
            return movieDocSnap.exists() ? { id: movieDocSnap.id, ...movieDocSnap.data() } : null;
        });

        const moviesList = (await Promise.all(moviePromises)).filter(movie => movie !== null);
        setMovies(moviesList);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, [db, userId]); // Dependency array includes userId to refresh when user changes

  const dynamicMarginBottom = useMemo(() => {
  return `${(movies.length * 70) - 250}px`;
}, [movies.length]);

  return (
    <>
	<div style={{ marginBottom: dynamicMarginBottom }}>
    <NavbarHome />
	</div>
    <div style={{padding: '20px', borderRadius: '8px', backgroundColor: "#282c34", width: "50vw"}}>
      <h2 style={{padding: '10px'}}>Watch History</h2>
      <ul style={{display: "flex", flexWrap: 'wrap', gap: '20px', listStyleType: 'none', padding: 0 }}>
      {movies.map((movie) => (
        <li key={movie.id}>
        <div style={{padding: '10px', width: '20vw', backgroundColor: "#3b3f47", borderRadius: '8px'}}>
        <h2 style={{ marginBottom: "5px", color: "white" }}>
        {movie.originalTitle || "Unknown Title"}
        </h2>
        <p style={{ color: "white", fontSize: "14px" }}>
            <strong>Genres:</strong> {movie.genres || "N/A"}
        </p>
        <p style={{ color: "white", fontSize: "14px" }}>
            <strong>Year:</strong> {movie.startYear || "N/A"}
        </p>
        <p style={{ color: "white", fontSize: "14px" }}>
            <strong>Runtime:</strong> {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "N/A"}
        </p>
        </div>
            </li>
          ))}
      </ul>
    </div>
    </>
  );
}

export default WatchHistory;
