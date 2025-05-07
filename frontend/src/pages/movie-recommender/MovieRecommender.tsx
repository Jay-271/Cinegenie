import NavbarHome from "../../components/NavBarLoggedIn";
import Recommender from "../../components/MovieRecommender/MovieRecommender";
function MovieRecommender() {
  return (
    <>
      <NavbarHome />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Movie Recommender</h1>
        <Recommender />

      </div>
    </>
  );
}

export default MovieRecommender;
