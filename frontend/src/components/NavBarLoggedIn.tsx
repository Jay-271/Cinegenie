import { Link } from "react-router-dom";
import "./NavBarLoggedIn.css";
import Logo from "../assets/logo.jpg";
import { BsPersonCircle } from "react-icons/bs";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH } from "../../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect} from "react";

const NavbarHome = () => {
  const navigate = useNavigate();
  const auth = FIREBASE_AUTH;
  const [, setDropdownOpen] = useState(false); // dropdownOpen is not used, removing for npm run build
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <nav className="navbar">
      <div className="nav-links-container">
        <ul className="nav-links">
          <li>
            <Link to="/home-logged-in">Home</Link>
          </li>
          <li>
            <Link to="/movie-recommender">Recommender</Link>
          </li>
          <img className="logo-home" src={Logo} alt="logo" />
          <li>
            <Link to="/watch-history">Watch History</Link>
          </li>
          <li>
            <Link to="/friends">Friends</Link>
          </li>
        </ul>
      </div>
      <div className="dropdown-container-home">
        <div className="dropdown-home" ref={dropdownRef}>
          <button className="dropdown-button">
            <BsPersonCircle size={30} color="#4d26eb" />
          </button>
          <div className="dropdown-content-home">
            <Link to="/profile">Profile</Link>
			      <Link to="/requests">Requests</Link>
            <Link to="#" onClick={handleSignOut}>Log Out</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavbarHome;
