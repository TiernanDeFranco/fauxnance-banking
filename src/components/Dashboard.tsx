import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getFirestore, doc, onSnapshot } from 'firebase/firestore';

interface BankArray {
  accountID: number;
  accountName: string;
  balance: number;
}

interface AccountData {
  id: string;
  bankAccounts: BankArray[];
  email: string;
}

export const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await fetchData(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  const fetchData = async (userId: string) => {
    const db = getFirestore();
    const userRef = doc(db, 'accounts', userId);

    try {
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const docData = docSnapshot.data();

          const bankAccounts: BankArray[] = docData.bankAccounts || [];

          setAccountData({
            id: userId,
            bankAccounts,
            email: docData.email || '',
          });
        } else {
          console.error('No document found for the user.');
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Error getting document: ', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const handleCreateNew = () => {
    navigate('/open-new');
  };

  return (
    <div>
        <img className='logo' src='./assets/fauxnancebanking.png' width={250} height={250}/>

      <nav className="navbar">
        <div className="login-link">
          <a href="/">Home</a>
          <a href="/" onClick={handleLogout}>Log Out</a>
        </div>
      </nav>

        <div className='accounts'>
      {accountData && (
        <div key={accountData.id}>
          <h2 className='account-name'>Accounts</h2>
          <button className='add-account-button' onClick={handleCreateNew}>Add New Account</button>
          {accountData.bankAccounts.map((bankAccount) => (
            <div className='account' key={bankAccount.accountID}>
              <h3 className='account-name'>{bankAccount.accountName}</h3>
              <p className='balance'>${bankAccount.balance.toLocaleString()}</p>
            </div>
          ))}
         
        </div>
      )}
    </div>
    </div>
  );
};
