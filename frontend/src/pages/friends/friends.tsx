import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../../../firebaseconfig";
import { getFirestore, collection, doc, getDoc, getDocs, DocumentData, updateDoc, arrayUnion, arrayRemove} from "firebase/firestore";
import "./Friends.css"; // Add styling here
import NavbarHome from "../../components/NavBarLoggedIn";
import { BsPersonCircle } from "react-icons/bs";

interface _user {
  id: string;
  name: string;
  avatar: string;
  requests: string;
}

function Friends() {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;
  const navigate = useNavigate();
  const db = getFirestore();
  
  const [search, setSearch] = useState("");
  
  const [friends, setFriends] = useState<DocumentData[]>([]);
  
  const [, setButtonStates] = useState<{ [userId: string]: boolean }>({});

  const [users, setUsers] = useState<DocumentData[]>([]);
  
  const isFriend = (userId: string): boolean=>{
	return friends.some(friend => friend.id === userId);
  };
  
  const isRequested = (userId: string): boolean=>{
	  // userId = the ID of the person you're checking
	  const targetUser = users.find(user => user.id === userId);

	  if (!targetUser || !Array.isArray(targetUser.requests)) return false;

	  return targetUser.requests.includes(auth.currentUser?.uid ?? "");
  };
  
  const buttonState = (userId: string) : number=>
  {
		if(!isRequested(userId) && !isFriend(userId))
		{
			return 0;
		}
		else if(isRequested(userId)) //and is not friend
		{
			return 1;
		}
		else if(isFriend(userId))
		{
			return 2;
		}
		
		return 0;
  };
  
  
  const toggleButton = (userId: string) => {

	//update the buttons
	fetchFriendsFromUserDoc();
	fetchUsers();
	
	if(!isFriend(userId))
	{
		sendFriendRequest(user?.uid!, userId);
	}
	else
	{
		removeFriend(user?.uid!, userId);
		removeFriend(userId, user?.uid!);
	}
	setButtonStates((prev: { [userId: string]: boolean }) => ({
		...prev,
		[userId]: !prev[userId]
	  }));
  };

  
  const sendFriendRequest = async (userId: string, friendId: string) => {
	  const userRef = doc(db, "users", friendId);

	  try {
		await updateDoc(userRef, {
		  friendRequests: arrayUnion(userId),
		});
		console.log("Friend added successfully!");
	  } catch (error) {
		console.error("Error adding friend:", error);
	  }
	};
  
  const removeFriend = async (userId: string, friendId: string) => {
	  const userRef = doc(db, "users", userId);

	  try {
		await updateDoc(userRef, {
		  friends: arrayRemove(friendId),
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

        const friendsArray = data.friends ?? [];
		
		const friendData: _user[] = [];
		
		for (const id of friendsArray) {
          const friendDoc = await getDoc(doc(db, "users", id));

          if (friendDoc.exists()) {
            const data = friendDoc.data();
            friendData.push({
              id,
              name: data.userName,
			  avatar: data.profilePicture,
			  requests: data.friendRequests
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
		
        setUsers(userList);
		
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

useEffect(() => {
    fetchUsers();
  }, [db]);


  //filter users.
  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(search.toLowerCase())
  ).filter((user) => user.id !== auth.currentUser?.uid);

  const friendsCardClick = (friendId: string) => {
    navigate(`/friendprofile/${friendId}`);
  };

  return (
	<div className="background">
		<NavbarHome/>
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
		  {(search === "" ? friends : filteredUsers).map((user) => (
			  <div key={user.id} className="ordered-friends">
				  <div className="friend-card" onClick={() => friendsCardClick(user.id)} style={{ cursor: "pointer" }}>
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
				  onClick={() => toggleButton(user.id)}
				  className={`add-friend ${
    buttonState(user.id) === 0 ? "add-friend" :
    buttonState(user.id) === 1 ? "requested-friend" :
    "unadd-friend"
  }`}			  
				>
				  {buttonState(user.id) === 0 && "✔"}
				  {buttonState(user.id) === 1 && "✉"}
				  {buttonState(user.id) === 2 && "✖"}
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

export default Friends;
