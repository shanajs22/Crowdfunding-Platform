import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, updateDoc, query, where, getDocs, DocumentData, Timestamp } from 'firebase/firestore';

// Firebase configuration - these values should be placed in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase config to prevent blank screen issues
const validateFirebaseConfig = () => {
  const requiredFields = [
    'apiKey', 
    'authDomain', 
    'projectId', 
    'storageBucket', 
    'messagingSenderId', 
    'appId'
  ];
  
  for (const field of requiredFields) {
    if (!firebaseConfig[field]) {
      console.error(`Firebase config missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.error('Invalid Firebase configuration. Please check your .env file.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Authentication functions
export const registerUser = async (email: string, password: string, name: string) => {
  if (!auth || !db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add user profile to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: Timestamp.now()
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Campaign functions
export const createCampaign = async (campaignData: {
  title: string;
  description: string;
  goalAmount: number;
  deadline: Date;
  imageUrl: string;
  ownerUid: string;
  ownerName: string;
}) => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      ...campaignData,
      amountRaised: 0,
      createdAt: Timestamp.now(),
      deadline: Timestamp.fromDate(campaignData.deadline)
    });
    
    return campaignRef.id;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

export const getCampaigns = async () => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const campaignsRef = collection(db, 'campaigns');
    const snapshot = await getDocs(campaignsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting campaigns:', error);
    throw error;
  }
};

export const getCampaignById = async (campaignId: string) => {
  if (!db) {
    console.error('Firebase not initialized');
    return null;
  }
  
  if (!campaignId) {
    console.error('Invalid campaign ID provided');
    return null;
  }
  
  try {
    console.log(`Firebase: Fetching campaign with ID: ${campaignId}`);
    const docRef = doc(db, 'campaigns', campaignId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const campaignData = {
        id: docSnap.id,
        ...docSnap.data()
      };
      console.log(`Firebase: Campaign data retrieved successfully:`, campaignData);
      return campaignData;
    } else {
      console.log(`Firebase: Campaign with ID ${campaignId} not found`);
      return null;
    }
  } catch (error) {
    console.error(`Firebase: Error getting campaign ${campaignId}:`, error);
    return null;
  }
};

// Donation functions
export const createDonation = async (donationData: {
  campaignId: string;
  donorUid: string;
  donorName: string;
  amount: number;
  message?: string;
}) => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    // Add the donation
    const donationRef = await addDoc(collection(db, 'donations'), {
      ...donationData,
      createdAt: Timestamp.now()
    });
    
    // Update the campaign's amount raised
    const campaignRef = doc(db, 'campaigns', donationData.campaignId);
    const campaignSnap = await getDoc(campaignRef);
    
    if (campaignSnap.exists()) {
      const currentAmount = campaignSnap.data().amountRaised || 0;
      await updateDoc(campaignRef, {
        amountRaised: currentAmount + donationData.amount
      });
    }
    
    return donationRef.id;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

export const getCampaignDonations = async (campaignId: string) => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  
  try {
    const donationsRef = collection(db, 'donations');
    const q = query(donationsRef, where('campaignId', '==', campaignId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting donations:', error);
    throw error;
  }
};

// Current user
export const getCurrentUser = (): Promise<User | null> => {
  if (!auth) {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export { app, auth, db }; 