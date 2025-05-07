import { useState, useEffect } from "react";
import {FIRESTORE_DB} from "../../../firebaseconfig";
import { doc, getDoc, getFirestore} from 'firebase/firestore';
import {useParams} from "react-router-dom";
import NavbarHome from "../../components/NavBarLoggedIn";
import "./friendprofile.css"; // Add styling here
import { BsPersonCircle } from "react-icons/bs";

//Youtube link reference: https://www.youtube.com/watch?v=A5hDwIn8Nwg&ab_channel=InfoTechWAR on uploading images
// This uploads files to the Firebase storage feature. 
function FriendProfile() {
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [, setFriendsCount] = useState(0);
    const [likedMovies, setLikedMovies] = useState<string[]>([]);

    const {userId} = useParams();
    const db = getFirestore();

    useEffect(() => {
        if (userId) {
            getUserData();
        }
    }, [userId]);

    const fetchLikedMovies = async () => {
            try {

              if(!userId)
              {
                console.error("User not found!");
                return;
              }

              const userDocRef = doc(db, "users", userId);
              const userSnap = await getDoc(userDocRef);
          
              if (!userSnap.exists()) {
                console.log("User document does not exist.");
                return;
              }
          
              const data = userSnap.data();
              const movieIds: string[] = data.moviesLiked || [];
          
              console.log("Movie IDs:", movieIds);
          
              const movieNames: string[] = [];
          
              for (const movieId of movieIds) {
                const movieRef = doc(FIRESTORE_DB, "moviedata", movieId);
                const movieSnap = await getDoc(movieRef);
          
                if (movieSnap.exists()) {
                  const movieData = movieSnap.data();
                  const title = movieData.originalTitle;
                    if (title) movieNames.push(title);
                
                }
              }
          
              console.log("Fetched liked movies:", movieNames);
              setLikedMovies(movieNames);
            } catch (error) {
              console.error("Error fetching liked movies:", error);
            }
          };
        
        useEffect(() => {
            fetchLikedMovies();
          }, [db]);

    const getUserData = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            
            const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setProfilePicture(data?.profilePicture || null);
                setUserName(data?.userName || '');

                const friendsArray = data?.friends || [];
                setFriendsCount(friendsArray.length);
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        } finally { //again... dont want this stupid spinner in the way ;)
            setLoading(false);
        }
    };

    return (
        <>
            <NavbarHome />
            <div className="profile-page">
                <h1>{userName ? `${userName}'s profile` : 'Loading data...'}</h1>
                <div className="background-card">
                {loading ? (
                    <div className="loading-spinner"></div>
                    ) : profilePicture ? (
                    <img
                        src={profilePicture}
                        className="profilePic"
                        alt="Profile"
                        
                    />
                    ) : (
                    <div>
                        <BsPersonCircle size={100} color="#4d26eb" className="profilePic"/>
                    </div>
                    )}

                <h2>Movies {userName} liked:</h2>
                    <div className="scrollable-list">
                        {likedMovies.length > 0 ? (
                            likedMovies.map((movie, index) => (
                            <div key={index} className="list-item">
                                {movie}
                            </div>
                            ))
                        ) : (
                            <div className="list-item">No liked movies found.</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default FriendProfile;
