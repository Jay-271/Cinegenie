import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/">Home</Link>
        <Link to="/movie-recommender">Movie Recommender</Link>
        <Link to="/watch-history">Watch History</Link>
      </div>
      <p>&copy; {new Date().getFullYear()} CineGenie. CineGenie is a personal project name. All content is owned by the site creator unless otherwise noted.</p>
    </footer>
  );
};

export default Footer;

