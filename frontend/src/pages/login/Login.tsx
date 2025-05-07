import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../../firebaseconfig";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import logo from "../../assets/logo.jpg";
import "./Login.css";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      if (user) {
        const userRef = doc(FIRESTORE_DB, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.firstLogin) {
            navigate("/favorite-genres");
          } else {
            navigate("/home-logged-in");
          }
        } else {
          navigate("/home-logged-in");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    try {
      setLoading(true);
      let emailToUse = email;

      if (!email.includes("@")) {
        const usersRef = collection(FIRESTORE_DB, "users");
        const q = query(usersRef, where("userName", "==", email), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Username not found.");
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        emailToUse = userData.email;

        if (!emailToUse) {
          setError("Email not associated with this username.");
          setLoading(false);
          return;
        }
      }

      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        emailToUse,
        password
      );
      const user = userCredential.user;

      const userRef = doc(FIRESTORE_DB, "users", user.uid);
      const userDocSnap = await getDoc(userRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.firstLogin) {
          navigate("/favorite-genres");
        } else {
          navigate("/home-logged-in");
        }
      } else {
        navigate("/home-logged-in");
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (e.message === "Firebase: Error (auth/invalid-credential).") {
          setError("Invalid credentials.");
        } else {
          setError(e.message);
        }
      } else {
        setError(
          "An unknown error occurred. Please try again or contact support."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img className="logo" src={logo} alt="Logo" />
      <div className="login-box">
        <h1 className="main-header">Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email">Email or Username:</label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email or Username"
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="signup-prompt">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
