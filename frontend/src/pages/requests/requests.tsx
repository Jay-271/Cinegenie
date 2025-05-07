import { useEffect, useState } from "react";
// import { signOut } from "firebase/auth"; remove since unuused
//import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../../../firebaseconfig";
import { getFirestore, collection, doc, getDoc, getDocs, DocumentData, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";
import "./requests.css"; // Add styling here
import NavbarHome from "../../components/NavBarLoggedIn";
import { BsPersonCircle } from "react-icons/bs";

interface _user {
  id: string;
  name: string;
  avatar: string;
}

function Requests() {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  // const navigate = useNavigate(); remove since unused
  const db = getFirestore();
    
  const [search, setSearch] = useState("");
  
  const [friends, setFriends] = useState<DocumentData[]>([]);
  
 // for now we will remove this variable since unused.
  const [, setUsers] = useState<DocumentData[]>([]); // issue when fixing later code "users" is never read.
  
  
  /**
   * Removing this function but storing incase later used, currently is not being used in code.
   * removing because npm run build issues.
   *   const isFriend = (userId: string): boolean=>{
		return friends.some(friend => friend.id === userId);
  		};
   * 
   */

  const acceptUser = (userId: string) => {
	//update the buttons
	fetchFriendsFromUserDoc();
	
	//add to friends list of both users.
	addFriendToUser(user?.uid!, userId);
	addFriendToUser(userId, user?.uid!);
  };
  
  const rejectUser = (userId: string) => {
	//update the buttons
	fetchFriendsFromUserDoc();
	removeFromRequests(user?.uid!, userId);
  };
  
  
  const addFriendToUser = async (userId: string, friendId: string) => {
	  const userRef = doc(db, "users", userId);

	  try {
		await updateDoc(userRef, {
		  friendRequests: arrayRemove(friendId),
		  friends: arrayUnion(friendId),
		});
		console.log("Friend added successfully!");
	  } catch (error) {
		console.error("Error adding friend:", error);
	  }
	};
  
  const removeFromRequests = async (userId: string, friendId: string) => {
	  const userRef = doc(db, "users", userId);

	  try {
		await updateDoc(userRef, {
		  friendRequests: arrayRemove(friendId),
		});
		console.log("Friend removed successfully!");
	  } catch (error) {
		console.error("Error removing friend:", error);
	  }
	};
  
  const fetchFriendsFromUserDoc = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        const friendsArray = data.friendRequests ?? [];
		
		const friendData: _user[] = [];
		
		for (const id of friendsArray) {
          const friendDoc = await getDoc(doc(db, "users", id));

          if (friendDoc.exists()) {
            const data = friendDoc.data();
            friendData.push({
              id,
              name: data.userName,
			  avatar: data.profilePicture
            });
          }
        }

        setFriends(friendData);
		
      } else {
        console.warn("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user friends:", error);
    }
  };
  
  useEffect(() => {
  fetchFriendsFromUserDoc();
}, [user]);

  //get all the users.

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userRef = collection(db, "users"); // Update with your Firestore collection name
        const querySnapshot = await getDocs(userRef);
        const userList = querySnapshot.docs.map((doc) => {
		
		const data = doc.data();
		return {
		  id: doc.id,
		  name: data.userName,
		  avatar: data.profilePicture,
		  requests: data.friendRequests
		};
	  })
	  .filter((user) => user.name); // filter out users without a name
		
		
		//doc.id
		

		
		console.log("user list: ",userList);
		/**
		 * 
		 * Reworked this part of the code with errors but kept for relevancy
		 *  Seems the issue was we are doing this twice?
		 * 
	  			const data = userList;
				const usersArray = data.userName ?? [];
						
				const userData: _user[] = [];
				
				for (const id of usersArray) {
					const userDoc = await getDoc(doc(db, "users", id));

					if (userList.exists()) {
					const data = userList.data();
					
					userData.push({
						id,
						name: data.userName,
						avatar: data.profilePicture
					});
					}
				}
		 */
        setUsers(userList);
		
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [db]);

  /**
   * Similarly, this function was not used so just storing here.
   * 
   const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
   * 
   */




  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(search.toLowerCase())
  );
  
  /**
   * 
   * Again, this function is not being used.
   * 
    const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase())
  	);
   */
  return (
	<div className="background">
		<NavbarHome /> {/* Removed the classname since errors. */}
		<p className="request-header">Friend Requests</p>
		<div className="friends-container">
		  <div className="search-bar">
			<input
			  type="text"
			  placeholder="Search for friends..."
			  value={search}
			  onChange={(e) => setSearch(e.target.value)}
			/>
		  </div>


			
		  <div className="friends-list">
			{filteredFriends.map((user) => (
			
			  <div key={user.id} className="ordered-friends">
				  <div className="friend-card">
				  {user.avatar ? (
					<img
						src={user.avatar}
						alt={user.name}
						className="friend-avatar"
					/>
					) : (
					<BsPersonCircle size={30} color="#4d26eb" />
					)}
					<span className="friend-name">{user.name}</span>	
				  </div>
				  
				  <button
				  onClick={() => acceptUser(user.id)}
				  className="add-friend added"
				>✔
				</button>
				
				<button
				  onClick={() => rejectUser(user.id)}
				  className="add-friend unadd-friend"
				>✖
				</button>
			  
				</div>
			))}
		  </div>

		  <div className="back-home">
			<a href="/home-logged-in">Back to Home</a>
		  </div>
		  
		</div>
	
	</div>
  );
}

export default Requests;
