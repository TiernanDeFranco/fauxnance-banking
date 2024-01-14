import React, { useState} from 'react';
import { signUp } from '../auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSignUp = async (email: string, password: string, additionalData: Object) => {
    try {
      const userCredential = await signUp(email, password);
      console.log('User created:', userCredential.user);
      await createUserData(userCredential.user.uid, additionalData);
      navigate('/dashboard'); // Navigate to the dashboard route

    } catch {
      console.error('Error signing up:');
    }
  };

  const createUserData = async (userId: string, additionalData: Object) => {
    const userRef = doc(db, 'accounts', userId);
    await setDoc(userRef, additionalData);
  };

  const onSubmit = (event: React.FormEvent) => {
    event?.preventDefault();
    let additionalData = {
      email: email,
      bankAccounts: [
        { accountType: 'HYSA', accountName: 'High Yield Savings', balance: 10_000 }
      ]
    }
    handleSignUp(email, password, additionalData);
  };

  return (
    <div className='signup'>

<nav className="navbar">
        <div className="login-link">
          <a href="/">Home</a>
          <a href="/login">Log In</a>
        </div>
      </nav>

      <img className='logo' src='./assets/fauxnancebanking.png' width={350} height={350} alt="Fauxnance Banking Logo"/>
      
      <form className='signupform' onSubmit={onSubmit}>
        <input
          type="email"
          placeholder='Email'
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder='Password'
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className='signupbutton' type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default SignUp;
