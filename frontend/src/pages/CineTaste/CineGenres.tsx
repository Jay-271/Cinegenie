import "./CineGenres.css";
import { useState, useEffect } from "react";
import Bubble from "./Bubble";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";

const Genres: React.FC = () => {
  //List of genres for the bubbles
  const [genres] = useState<string[]>([
    "Romance",
    "Action",
    "Adventure",
    "Biography",
    "Drama",
    "Fantasy",
    "Family",
    "War",
    "History",
    "Thriller",
    "Crime",
    "Western",
    "Comedy",
    "Mystery",
    "Horror",
    "Music",
    "Sci-Fi",
    "Documentary",
    "Sport",
    "Musical",
    "Film-Noir",
    "Animation",
    "News",
    "Reality-TV",
    "Game-Show",
    "Talk-Show",
  ]);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get current user
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  // Load previously saved genres in bubbles
  useEffect(() => {
    const loadUserGenres = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
          if (userDoc.exists() && userDoc.data().movieGenres) {
            setSelectedGenres(userDoc.data().movieGenres);
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
      setMessage("Please select at least one genre");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Save genres to user document in Firestore
      await setDoc(
        doc(FIRESTORE_DB, "users", user.uid),
        {
          movieGenres: selectedGenres,
        },
        { merge: true }
      );

      navigate("/favorite-directors");
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
      <h1 className="header">Select Your Favorite Movie Genres</h1>
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

      <div className="submit-container">
        <button
          data-testid="NextBtn"
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : "Next"}
        </button>
        <p className="selected-count">
          {selectedGenres.length} genre{selectedGenres.length !== 1 ? "s" : ""}{" "}
          selected
        </p>
      </div>
    </div>
  );
};

export default Genres;
