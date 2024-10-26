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
} from "firebase/auth"; //authenticaion
import {
    getFirestore,
    collection,
    addDoc,
    getDocs, 
    doc,
    getDoc, 
    query,
    where
} from "firebase/firestore"; //firestore
import { getStorage, ref, uploadBytes,getDownloadURL } from "firebase/storage";

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
        const result = await addDoc(collection(firestore,"users"),{
            name,
            age,
            height,
            weight,
            gender,
            medicalConditions
        })
   }

    const isLoggedIn = user ? true:false;

    return (
        <FirebaseContext.Provider value={{
            isLoggedIn,
            siginUserWithEmailAndPassword,
            signupUserWithEmailAndPassword,
            signinWithGoogle,
            signOutUser,
            handleAddData
        }}>
            {props.children}
        </FirebaseContext.Provider>
    );
}