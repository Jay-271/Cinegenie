import "./NavBar.css";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.jpg";
import { BsPersonCircle } from "react-icons/bs";

function NavBar() {
  return (
      <nav className="navbar">
        <div className="nav-links-container">
          <ul className="nav-links">
            <li data-testid="loginBtn">
              <Link to="/login">Home</Link>
            </li>
            <li>
              <Link to="/login">Recommender</Link>
            </li>
            <img className="logo-home" src={Logo} alt="logo" />
            <li>
              <Link to="/login">Watch History</Link>
            </li>
            <li>
              <Link to="/login">Friends</Link>
            </li>
          </ul>
        </div>
        <div className="dropdown-container">
        <div className="dropdown">
          <button className="dropdown-button">
            <BsPersonCircle size={30} color="#4d26eb" />
          </button>
          <div className="dropdown-content">
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
      </nav>
    );
  };

export default NavBar;
