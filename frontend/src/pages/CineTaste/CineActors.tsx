import "./CineTaste.css";
import { useState, useEffect } from "react";
import Bubble from "./Bubble";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import { useNavigate } from "react-router-dom";

const Genres: React.FC = () => {
  //List of actors for the bubbles
  const [genres] = useState<string[]>([
    "Jack Nicholson",
    "Marlon Brando",
    "Robert De Niro",
    "Al Pacino",
    "Daniel Day-Lewis",
    "Dustin Hoffman",
    "Tom Hanks",
    "Anthony Hopkins",
    "Paul Newman",
    "Denzel Washington",
    "Spencer Tracy",
    "Laurence Olivier",
    "Jack Lemmon",
    "Michael Caine",
    "James Stewart",
    "Robin Williams",
    "Robert Duvall",
    "Sean Penn",
    "Morgan Freeman",
    "Jeff Bridges",
    "Clint Eastwood",
    "Gene Hackman",
    "Leonardo DiCaprio",
    "Russell Crowe",
    "Kevin Spacey",
    "James Cagney",
    "John Wayne",
  ]);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, forceUpdate] = useState(0);
  const navigate = useNavigate();

  // Get current user
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  // Load previously saved actors for the bubbles
  useEffect(() => {
    const loadUserGenres = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
          if (userDoc.exists() && userDoc.data().actors) {
            setSelectedGenres(userDoc.data().actors);
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
      // Save actors to user document in Firestore
      await setDoc(
        doc(FIRESTORE_DB, "users", user.uid),
        {
          actors: selectedGenres,
        },
        { merge: true }
      );

      navigate("/favorite-movies");
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
      <h1 className="header">Select The Actors You Like</h1>
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
          {selectedGenres.length} actor
          {selectedGenres.length !== 1 ? "s" : ""} selected
        </p>
      </div>
    </div>
  );
};

export default Genres;
