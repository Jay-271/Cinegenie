import "./About.css";
import Genie from '../../assets/genie.jpg';
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-container">
      <h1>What is CineGenie?</h1>
      <p>
        Struggling to find the perfect movie? CineGenie takes the guesswork
        out of choosing what to watch by using advanced machine learning to
        recommend movies tailored to your unique tastes. Simply like or
        dislike films, and our intelligent system will refine its
        suggestions to match your preferences. Plus, with social
        features, you can add friends, see what they’re watching, and even
        revisit your own watch history. Say goodbye to endless
        scrolling—CineGenie makes movie nights effortless and exciting!
      </p>
      <h1>How does it work?</h1>
      <p>
        CineGenie uses a sophisticated recommendation algorithm that learns
        from your interactions. When you like or dislike a movie, our
        machine learning model analyzes your feedback and adjusts its
        recommendations accordingly. The more you use the app, the better
        it becomes at understanding your preferences. Additionally, you can
        connect with friends to see their movie choices, making it easier to
        discover new films together. Your watch history is also saved,
        allowing you to revisit past favorites or find hidden gems you may
        have missed. With CineGenie, you’ll always have a personalized
        movie experience at your fingertips.
      </p>
      <h1>Get Started today and Signup for free</h1>
      <div className="image-button-wrapper">
        <Link to="/signup">
          <button className="signup-button-home">Sign Up</button>
        </Link>
        <img src={Genie} alt="Genie" className="genie-image" />
      </div>
    </div>
  );
}
export default About;
