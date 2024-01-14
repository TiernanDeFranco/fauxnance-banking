import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {  getFirestore, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface BankArray {
  accountType: string;
  accountName: string;
  balance: number;
}

interface AccountData {
  id: string;
  bankAccounts: BankArray[];
  email: string;
}

export const Dashboard = () => {
  const [, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = getAuth();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [selectedAccountIndex, setSelectedAccountIndex] = useState<number>(-1);

  const [accountName, setAccountName] = useState<string>('');
  const [error, setError] = useState<string>('');

  

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

  const handleAccountClick = (index: number) => {
   setSelectedAccountIndex(index);
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event?.preventDefault();
    setError('');
    const userUuid = auth.currentUser?.uid;
    if (!userUuid) {
        console.error("No user is logged in");
        navigate('/login')
        return;
    }

    const accountDocRef = doc(db, "accounts", userUuid); 


    try {
        const docSnap = await getDoc(accountDocRef);
        if (docSnap.exists()) {
            let bankAccounts = docSnap.data().bankAccounts;

            bankAccounts[selectedAccountIndex] = {
                ...bankAccounts[selectedAccountIndex],
                accountName: accountName
            };

            await updateDoc(accountDocRef, {
                bankAccounts: bankAccounts
            });

            setAccountName('');
            setSelectedAccountIndex(-1);
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error updating document: ", error);
        setError('Error Renaming Account');
    }
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

  {selectedAccountIndex === -1 &&
    <div className='accounts'>
        {accountData && (
            <div key={accountData.id}>
                <h2 className='account-name'>Accounts</h2>
                <div>
                <button className='add-account-button' onClick={handleCreateNew}>Add New Account</button>
                </div>
                <button className='add-account-button' onClick={() => {navigate('/transfer')}}>Make Internal Transfer</button>
                {accountData.bankAccounts.map((bankAccount, index) => (
                    <div 
                        className='account' 
                        key={index} 
                        onClick={() => handleAccountClick(index)}
                    >
                        <h3 className='account-name'>{bankAccount.accountName}</h3>
                        <p className='balance'>${bankAccount.balance.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
    }

    {selectedAccountIndex !== -1 &&
    <div>
    <button className='add-account-button' onClick={() => {setSelectedAccountIndex(-1)}}>Go Back</button>
    <div className='accounts'>
        
    <div>
       <h2 className='account-name'>{accountData?.bankAccounts[selectedAccountIndex].accountName}</h2>
       <h3 className='balance'>${accountData?.bankAccounts[selectedAccountIndex].balance.toLocaleString()}</h3>
       <h4 className='error'>{error}</h4>
       <form className='signupform' onSubmit={handleSubmit}>
        <input
          type="accountname"
          placeholder='New Account Name'
          id="accountname"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          required
        />
        <button className='signupbutton' type="submit">Change Name</button>
      </form>
    </div>
    
    </div>
    </div>
}

    
    </div>
);
};
