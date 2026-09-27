import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request minimum Gmail scope necessary to send emails
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.compose');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');

let cachedAccessToken: string | null = null;

export const signInWithGoogleGmail = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign-in.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const logoutGmail = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (err) {
    console.error('Logout Error:', err);
  }
};

export const getCachedToken = () => cachedAccessToken;
