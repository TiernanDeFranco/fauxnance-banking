import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const auth = getAuth(); 

    try {
      await signInWithEmailAndPassword(auth, email, password);

      console.log('Login successful');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:');
      setError('Problem Logging in :(');
    }
  };


  return (
    <div className='signup'>

<nav className="navbar">
        <div className="login-link">
          <a href="/">Home</a>
          <a href="/create-account">Create Account</a>
        </div>
      </nav>
      <img className='logo' src='./assets/fauxnancebanking.png' width={350} height={350}/>
      <form className='signupform' onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <span className='error'>{error}</span>
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

        <button className='signupbutton' onClick={() => {setError('')}} type="submit">Login</button>

       
      </form>
    </div>
  );
};

