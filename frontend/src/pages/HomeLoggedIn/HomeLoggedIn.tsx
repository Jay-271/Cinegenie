import "./HomeLoggedIn.css";
import GenieTextEffect from "./GenieEffect";
import NavbarHome from "../../components/NavBarLoggedIn";

function HomeLoggedIn() {
  return (
    <div className="background-home-loggedin">
      <NavbarHome />
      <GenieTextEffect />
    </div>
  );
}

export default HomeLoggedIn;
