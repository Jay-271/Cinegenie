import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../../firebaseconfig";

interface ProtectedProps {
  children: React.ReactNode;
}

const ProtectedNewUser: React.FC<ProtectedProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await checkFirstLogin(currentUser);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const checkFirstLogin = async (currentUser: User) => {
    try {
      const userRef = doc(FIRESTORE_DB, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.firstLogin) {
          //await updateDoc(userRef, { firstLogin: false });
        } else {
          navigate("/home-logged-in");
        }
      } else {
        navigate("/home-logged-in");
      }
    } catch (error) {
      console.error("Error checking first login:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedNewUser;
