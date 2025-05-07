import { useState, useEffect, useRef } from "react";
import { FIREBASE_AUTH, FIREBASE_STORAGE,FIRESTORE_DB} from "../../../firebaseconfig";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";
import NavbarHome from "../../components/NavBarLoggedIn";
import "./profile.css"; // Add styling here
import { BsPersonCircle } from "react-icons/bs";

//Youtube link reference: https://www.youtube.com/watch?v=A5hDwIn8Nwg&ab_channel=InfoTechWAR on uploading images
// This uploads files to the Firebase storage feature. 
function Profile() {
    const [, setFile] = useState<File | null>(null);
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [likedMovies, setLikedMovies] = useState<string[]>([]);

    const auth = FIREBASE_AUTH;
    const user = auth.currentUser;
    const userId = user?.uid;
    const db = getFirestore();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            getUserProfilePicture();
            console.log(user);
        }
    }, [userId]);

    const fetchLikedMovies = async () => {
        try {
          const userId = FIREBASE_AUTH.currentUser?.uid;
          if (!userId) return console.log("No user ID found");
      
          const userDocRef = doc(FIRESTORE_DB, "users", userId);
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
    

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            uploadImage(e.target.files[0]);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click(); // programmatically click input
    };

    const handleDeleteAccount = async () => {
        if (!user || !userId) return;
    
        const userDocRef = doc(FIRESTORE_DB, "users", userId);
    
        try {
            setLoading(true);
    
            // 1. Delete Firestore user document
            await deleteDoc(userDocRef);
            console.log("Firestore user document deleted");

            await user.delete();

            navigate("/login");
        } catch (error: any) {
            console.error("Error during account deletion:", error);
    
            if (error.code === "auth/requires-recent-login") {
                alert("Please re-login and try again to delete your account.");
            } else {
                alert("Account deletion failed. Try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const uploadImage = async (fileToUpload: File) => {
        if (!fileToUpload || !userId) return;

        try {
            setLoading(true); // start loading

            const fileName = fileToUpload.name;
            console.log(fileName);
            const reference = ref(FIREBASE_STORAGE, `profile_pictures/${userId}/${fileName}`);
            // Upload file directly
            await uploadBytes(reference, fileToUpload);

            // Get the download URL
            const downloadURL = await getDownloadURL(reference);
            console.log(downloadURL)
            // Store the URL in Firestore
            await setDoc(doc(FIRESTORE_DB, 'users', userId), {
                profilePicture: downloadURL
            }, { merge: true });

            setProfilePicture(downloadURL);

        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setLoading(false); // end loading... finally lol
        }
    };

    const getUserProfilePicture = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            
            const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
            if (userDoc.exists()) {
                setProfilePicture(userDoc.data()?.profilePicture || null);
                setUserName(userDoc.data()?.userName || '');
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        } finally { //again... dont want this stupid spinner in the way ;)
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        // Redirect to login page or handle logout
    };

    return (
        <>
            <div className="navbarDiv">
				<NavbarHome />
			</div>
            <div className="profile-page">
                <h1>{userName ? `Welcome, ${userName}` : 'Loading data...'}</h1>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }}
/>
                <div className="background-card">
                {loading ? (
                    <div className="loading-spinner"></div>
                    ) : profilePicture ? (
                    <img
                        src={profilePicture}
                        className="profilePic"
                        onClick={handleImageClick}
                        alt="Profile"
                        style={{ cursor: "pointer" }}
                    />
                    ) : (
                    <div onClick={handleImageClick} style={{ cursor: "pointer" }}>
                        <BsPersonCircle size={100} color="#4d26eb" className="profilePic"/>
                    </div>
                    )}

                    <h2>Some movies that you liked:</h2>
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
                    <div className="accountInformation">
                        <h2>Information about you:</h2>
                        <p>Email used for this account: {user?.email}</p>
                        <p>Account creation date: {user?.metadata.creationTime}</p>
                        <p>Last time you signed in: {user?.metadata.lastSignInTime}</p>
                    </div>
                </div>
                <button onClick={handleLogout} style={styles.button}>
                    Logout
                </button>

                <button onClick={() => setShowDeleteModal(true)} style={{ ...styles.button, backgroundColor: "#e53935" }}>
                     Delete Account
                 </button>

                {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                    <h2>Are you sure?</h2>
                    <p>This will permanently delete your account. This action cannot be undone.</p>
                    <div className="modal-actions">
                        <button
                        className="cancel-btn"
                        onClick={() => setShowDeleteModal(false)}
                        >
                        Cancel
                        </button>
                        <button
                        className="delete-btn"
                        onClick={() => {
                            setShowDeleteModal(false);
                            handleDeleteAccount();
                        }}
                        >
                        Delete
                        </button>
                    </div>
                    </div>
                </div>
                )}
            </div>

            
        </>
    );
}

const styles = {
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        backgroundColor: "#4d26eb",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        marginTop: "20px",
    },
};

export default Profile;
