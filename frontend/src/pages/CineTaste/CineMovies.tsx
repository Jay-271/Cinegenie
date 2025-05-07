import "./CineTaste.css";
import { useState, useEffect } from "react";
import Bubble from "./Bubble";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";

const Genres: React.FC = () => {
  //List of movies for the bubbles
  const [genres] = useState<string[]>([
    "The Shawshank Redemption",
    "The Godfather",
    "The Dark Knight",
    "12 Angry Men",
    "The Lord of the Rings: The Fellowship of the Ring",
    "Schindler's List",
    "Pulp Fiction",
    "The Good, the Bad and the Ugly",
    "Forrest Gump",
    "Fight Club",
    "Inception",
    "Star Wars: Episode V - The Empire Strikes Back",
    "The Matrix",
    "Goodfellas",
    "One Flew Over the Cuckoo's Nest",
    "Interstellar",
    " Se7en",
    "It's a Wonderful Life",
    "The Silence of the Lambs",
    "Saving Private Ryan",
  ]);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get current user
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  // Load previously saved movies for the bubbles
  useEffect(() => {
    const loadUserGenres = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
          if (userDoc.exists() && userDoc.data().movies) {
            setSelectedGenres(userDoc.data().movies);
          }
        } catch (error) {
          console.error("Error loading user genres:", error);
        }
      }
    };

    loadUserGenres();
  }, [user]);

  //Handle clicks on bubbles
  const handleGenreClick = (genre: string) => {
    setSelectedGenres((prev) => {
      const updatedGenres = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      forceUpdate((x) => x + 1);
      console.log(updatedGenres);
      return updatedGenres;
    });
  };

  //Handle the next button
  const handleSubmit = async () => {
    if (!user) {
      setMessage("Please log in to save your genres");
      return;
    }

    if (selectedGenres.length === 0) {
      setMessage("Please select at least one director");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Save movies to user document in Firestore
      await setDoc(
        doc(FIRESTORE_DB, "users", user.uid),
        {
          movies: selectedGenres,
        },
        { merge: true }
      );
      const userRef = doc(FIRESTORE_DB, "users", user.uid);
      await updateDoc(userRef, { firstLogin: false });
      navigate("/home-logged-in");
      setMessage("Your favorite genres have been saved!");
    } catch (error) {
      console.error("Error saving genres:", error);
      setMessage("Error saving your genres. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  //Handle the back button
  const handleBack = async () => {
    setLoading(true);
    setMessage("");

    try {
      navigate("/favorite-actors");
      setMessage("Your favorite genres have been saved!");
    } catch (error) {
      console.error("Error saving genres:", error);
      setMessage("Error saving your genres. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="header">Select The Movies You Like</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "50px",
        }}
      >
        {genres.map((genre) => (
          <Bubble
            key={genre}
            genre={genre}
            onClick={handleGenreClick}
            isSelected={selectedGenres.includes(genre)}
          />
        ))}
      </div>
      {message && <p className="message">{message}</p>}

      <div className="pref-next-container">
        <div className="pref-buttons-row">
          <button
            data-testid="BackBtn"
            className="pref-next-button"
            onClick={handleBack}
            disabled={loading}
          >
            {loading ? "Loading..." : "Back"}
          </button>
          <button
            data-testid="NextBtn"
            className="pref-next-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : "Next"}
          </button>
        </div>
        <p className="pref-selected-count">
          {selectedGenres.length} movie
          {selectedGenres.length !== 1 ? "s" : ""} selected
        </p>
      </div>
    </div>
  );
};

export default Genres;
