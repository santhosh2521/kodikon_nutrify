"use client";
import React, { createContext, useContext, useEffect,useState } from "react";
import { initializeApp } from "firebase/app";
import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
} from "firebase/auth"; 
import {
    getFirestore,
    collection,
    addDoc,
    getDocs, 
    doc,
    getDoc, 
    query,
    where
} from "firebase/firestore"; 
import { getStorage, ref, uploadBytes,getDownloadURL ,uploadString} from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  //initialize the app    
const firebaseApp = initializeApp(firebaseConfig);

//create the context
const FirebaseContext = createContext(null);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

//create the custom hook
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props)=>{
    const [user,setUser] = useState(null);
    const [image,setImage] = useState('');

    useEffect(()=>{
        onAuthStateChanged(firebaseAuth,(user)=>{
            if(user) setUser(user);
            else setUser(null);
        });
    },[]);

    const signupUserWithEmailAndPassword = (email,password) =>{
        return createUserWithEmailAndPassword(firebaseAuth,email,password);
    }

    const siginUserWithEmailAndPassword = (email,password) =>{
        return signInWithEmailAndPassword(firebaseAuth,email,password);
    }

    const signinWithGoogle = ()=>{
        return signInWithPopup(firebaseAuth,googleProvider);
    }

    const signOutUser = async ()=>{
        await signOut(firebaseAuth);
   }

   const handleAddData = async (name,age,height,weight,gender,medicalConditions)=>{
        try{
            const result = await addDoc(collection(firestore,"users"),{
                name,
                age,
                height,
                weight,
                gender,
                medicalConditions,
                userID : user.uid,
                userEmail: user.email,
                displayName:user.displayName,
                photoURL:user.photoURL
            })
            //console.log(result)
        }
        catch(error){
            console.log(error)
        }
   }

   const fetchUserDetails = async () => {
    const collectionRef = collection(firestore, "users");
    const q = query(collectionRef, where("userID", "==", user.uid));
    const result = await getDocs(q);
  
    // Extract only the specified fields from each document
    const data = result.docs.map(doc => {
      const { height, age, gender, medicalConditions } = doc.data(); // Destructure specific fields
      return { height, age, gender, medicalConditions }; // Return only those fields
    });
  
    //console.log("Filtered Data:", data); // This will log only the required fields
    return data;
  };

   const uploadImage = async (base64String, fileName) => {
    try {
        // 1. Convert base64 to Blob (JPEG format)
        const convertBase64ToBlob = (base64String) => {
            // Remove data URL prefix if it exists
            const base64WithoutPrefix = base64String.replace(/^data:image\/\w+;base64,/, '');
            // Convert base64 to binary
            const binaryString = atob(base64WithoutPrefix);
            // Create array buffer from binary string
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            // Create Blob as JPEG
            return new Blob([bytes], { type: 'image/jpeg' });
        };

        // 2. Convert to JPEG Blob
        const jpegBlob = convertBase64ToBlob(base64String);

        // 3. Upload JPEG to storage
        const imageRef = ref(storage, `uploads/images/${Date.now()}-${fileName}`);
        const snapshot = await uploadBytes(imageRef, jpegBlob);
        const imageURL = await getDownloadURL(snapshot.ref);

        // 4. Get user's document ID
        const userRef = collection(firestore, "users");
        const q = query(userRef, where("userID", "==", user.uid));
        const userSnapshot = await getDocs(q);

        if (!userSnapshot.empty) {
            const userDocId = userSnapshot.docs[0].id;
            const historyRef = collection(firestore, "users", userDocId, "history");
            
            // 5. Add to history
            const result = await addDoc(historyRef, {
                username: user.displayName,
                userID: user.uid,
                userEmail: user.email,
                photoURL: imageURL,
                timestamp: new Date()
            });

            //console.log("Image uploaded successfully:", imageURL);
            //console.log("image uploaded is",image);
            return imageURL;
        } else {
            throw new Error("User document not found");
        }
    } catch (error) {
        console.error("Error uploading image:", error);
        return { success: false, error: error.message };
    }
};

    const isLoggedIn = user ? true:false;

    return (
        <FirebaseContext.Provider value={{
            isLoggedIn,
            siginUserWithEmailAndPassword,
            signupUserWithEmailAndPassword,
            signinWithGoogle,
            signOutUser,
            handleAddData,
            fetchUserDetails,
            uploadImage,
            image,
            setImage
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
}