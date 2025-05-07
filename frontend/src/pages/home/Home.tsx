import "./Home.css";
import NavBar from "../../components/NavBar";
import GenieTextEffect from "../HomeLoggedIn/GenieEffect";
import About from "../about-us/About";
import Footer from "../../components/footer";

function Home() {
  return (
    <div className="background-home">
      <NavBar />
      <div className="genie-section">
        <GenieTextEffect />
      </div>
      <div className="about-section">
        <About />
      </div>
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
