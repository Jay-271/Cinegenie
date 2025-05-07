import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import HomeLoggedIn from "./pages/HomeLoggedIn/HomeLoggedIn";
import Protected from "./components/Protected";
const ProtectedNewUser = lazy(() => import("./components/ProtectedNewUser"))
const Login = lazy(() => import("./pages/login/Login"));
const Signup = lazy(() => import("./pages/signup/Signup"));
const Settings = lazy(() => import("./pages/settings/settings"));
const Friends = lazy(() => import("./pages/friends/friends"));
const Genres = lazy(() => import("./pages/CineTaste/CineGenres"));
const Directors = lazy(() => import("./pages/CineTaste/CineDirectors"));
const Actors = lazy(() => import("./pages/CineTaste/CineActors"));
const Movies = lazy(() => import("./pages/CineTaste/CineMovies"));
const MovieRecommender = lazy(() => import("./pages/movie-recommender/MovieRecommender"));
const WatchHistory = lazy(() => import("./pages/watch-history/watch-history"));
const Profile = lazy(() => import("./pages/profile/profile"));
const FriendProfile = lazy(() => import("./pages/friendprofile/friendprofile"));
const Requests = lazy(() => import("./pages/requests/requests"));
//import Profile from "./pages/profile/profile";

function App() {
  return (
    <BrowserRouter>
          <Suspense fallback={<h1>Loading</h1>}> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/requests" element={<Requests />} />

        <Route
          path="/favorite-genres"
          element={
            <ProtectedNewUser>
              <Genres />
            </ProtectedNewUser>
          }
        ></Route>

        <Route
          path="/favorite-directors"
          element={
            <ProtectedNewUser>
              <Directors />
            </ProtectedNewUser>
          }
        ></Route>

        <Route
          path="/favorite-actors"
          element={
            <ProtectedNewUser>
              <Actors />
            </ProtectedNewUser>
          }
        ></Route>

        <Route
          path="/favorite-movies"
          element={
            <ProtectedNewUser>
              <Movies />
            </ProtectedNewUser>
          }
        ></Route>

        <Route
          path="/home-logged-in"
          element={
            <Protected>
              <HomeLoggedIn />
            </Protected>
          }
        />
        <Route
          path="/friends"
          element={
            <Protected>
              <Friends />
            </Protected>
          }
        />
        <Route
          path="/movie-recommender"
          element={
            <Protected>
              <MovieRecommender />
            </Protected>
          }
        />
        <Route
          path="/watch-history"
          element={
            <Protected>
              <WatchHistory />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
        <Route
          path="/friendprofile/:userId"
          element={
            <Protected>
              <FriendProfile />
            </Protected>
          }
        />
      </Routes>
    </Suspense>
    </BrowserRouter>
  );
}

export default App;
