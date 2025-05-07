import { useState } from "react";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import "./Signup.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";

function Signup() {
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!userName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const usersRef = collection(FIRESTORE_DB, "users");
      const usernameQuery = query(
        usersRef,
        where("userName", "==", userName),
        limit(1)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        setError("Username is already taken.");
        setLoading(false);
        return;
      }

      const emailQuery = query(usersRef, where("email", "==", email), limit(1));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        setError("Email is already associated with another account.");
        setLoading(false);
        return;
      }

      const response = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      alert("Account Created");
      // use FireStore to make a user document THIS WORKS
      // list of movies watch (reference id)
      // list of liked movies (reference by ID)
      // list of disliked movies (reference by ID)
      await setDoc(doc(FIRESTORE_DB, "users", response.user.uid), {
        firstLogin: true,

        userName: userName,

        friends: [],
        
        friendRequests: [],

        email: email,

        movieGenres: [],

        directors: [],

        actors: [],

        movies: [],

        moviesDisliked: [],

        moviesLiked: [],

        moviesWatched: [],

        profilePicture: "",
      });
      await signOut(FIREBASE_AUTH);
      navigate("/login"); // redirect on successful signup
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message === "Firebase: Error (auth/email-already-in-use).") {
          setError("Email is already in use.");
        } else if (e.message === "Firebase: Error (auth/invalid-email).") {
          setError("Invalid email.");
        } else {
          setError(e.message);
        }
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <img className="logo" src={logo} alt="Logo" />
      <div className="signup-box">
        <h1 className="main-header">Sign Up</h1>
        {error && <p className="error-message">{error}</p>}
        <form className="signup-form" onSubmit={handleSignup}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={userName}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="login-prompt">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
