import "./CineTaste.css";
import { useState, useEffect } from "react";
import Bubble from "./Bubble";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";

const Genres: React.FC = () => {
  //List of directors for the bubbles
  const [genres] = useState<string[]>([
    "Christopher Nolan",
    "Steven Spielberg",
    "Martin Scorsese",
    "Alfred Hitchcock",
    "Stanley Kubrick",
    "Francis Ford Coppola",
    "Woody Allen",
    "Billy Wilder",
    "John Huston",
    "Peter Jackson",
    "Milos Forman",
    "Clint Eastwood",
    "David Lean",
    "Ridley Scott",
    "Joel Coen",
    "James Cameron",
  ]);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get current user
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  // Load previously saved directors for the bubbles
  useEffect(() => {
    const loadUserGenres = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
          if (userDoc.exists() && userDoc.data().directors) {
            setSelectedGenres(userDoc.data().directors);
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
      // Save directors to user document in Firestore
      await setDoc(
        doc(FIRESTORE_DB, "users", user.uid),
        {
          directors: selectedGenres,
        },
        { merge: true }
      );

      navigate("/favorite-actors");
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
      navigate("/favorite-genres");
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
      <h1 className="header">Select The Directors You Like</h1>
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
          {selectedGenres.length} director
          {selectedGenres.length !== 1 ? "s" : ""} selected
        </p>
      </div>
    </div>
  );
};

export default Genres;
