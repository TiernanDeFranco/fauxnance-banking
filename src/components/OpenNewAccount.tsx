import { getAuth, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

export const OpenNewAccount = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const auth = getAuth();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsLoggedIn(true);
        } else {
          navigate('/login');
        }
      });
      return () => unsubscribe();
    }, [auth, navigate]);

    return (
        <div>
    
          <nav className="navbar">
            <div className="login-link">
              <a href="/">Home</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </nav>

          <div className='account-offers'>
           <h2 className='account-name'>Open New Account</h2> 
            <div className='account'>
                <h3 className='account-name'>Checking</h3>
            </div>

            <div className='account'>
                <h3 className='account-name'>Savings</h3>
            </div>

            <div className='account'>
                <h3 className='account-name'>High Yield Savings</h3>
            </div>

            <div className='account'>
                <h3 className='account-name'>Credit Card</h3>
            </div>

            <div className='account'>
                <h3 className='account-name'>Personal Loan</h3>
            </div>
            </div> 
        </div>
      );
};