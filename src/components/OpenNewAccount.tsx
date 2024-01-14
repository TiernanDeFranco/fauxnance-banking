import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';

export const OpenNewAccount = () => {
    const [, setIsLoggedIn] = useState<boolean>(false);
    const [accountType, setAccountType] = useState<string>('');
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();
    const auth = getAuth();

    const [accountName, setAccountName] = useState<string>('');
  
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


    const handleSubmit = async (event: React.FormEvent) => {
        event?.preventDefault();
        
        const userUuid = auth.currentUser?.uid;
        if (!userUuid) {
            console.error("No user is logged in");
            navigate('/login')
            return;
        }
    
        const accountDocRef = doc(db, "accounts", userUuid); 

        let newBankAccount = {
            accountName: accountName,
            accountType: accountType,
            balance: 0
        }
    
        try {
            await updateDoc(accountDocRef, {
                bankAccounts: arrayUnion(newBankAccount)
            });
            console.log("Bank account added successfully");
            navigate('/dashboard')
        } catch (error) {
            console.error("Error updating document: ", error);
            setError(`Error Creating ${accountType}`);
        }
    };

    return (
        <div>
          <nav className="navbar">
            <div className="login-link">
              <a href="/">Home</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </nav>

        {!accountType && 
          <div className='account-offers'>
           <h2 className='account-name'>Open New Account</h2> 
            <div className='account' onClick={() => {setAccountType('Checking')}}>
                <h3 className='account-name'>Checking</h3>
            </div>

            <div className='account' onClick={() => {setAccountType('Savings')}}>
                <h3 className='account-name'>Savings</h3>
            </div>

            <div className='account' onClick={() => {setAccountType('High Yield Savings')}}>
                <h3 className='account-name'>High Yield Savings</h3>
            
            </div>
            </div> 
        }

        {accountType && 
            <div className='accounts'>
               
                 <form className='signupform' onSubmit={handleSubmit}>
                 <h2 className='account-name'>Open New {accountType}</h2>
                 {error}
                 <input
                    type="accountame"
                    placeholder='Account Name'
                    id="accountname"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    />
                 <button className='signupbutton' type="submit">Open {accountType}</button>
      </form>
            </div>
        }
        </div>
      );
};