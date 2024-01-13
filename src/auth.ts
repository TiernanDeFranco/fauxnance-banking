import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
