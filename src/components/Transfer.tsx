import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  

export const Transfer = () => {

    const [, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const auth = getAuth();

    const [accountData, setAccountData] = useState<AccountData | null>(null);

    const [selectedAccountFrom, setSelectedAccountFrom] = useState<string>('');
    const [selectedAccountTo, setSelectedAccountTo] = useState<string>('');

    const [transferAmount, setTransferAmount] = useState<number>(0);
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

      const handleAccountFromChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedAccountFrom(event.target.value);
      };
    
      // Handle change for the 'To' account dropdown
      const handleAccountToChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedAccountTo(event.target.value);
      };

      const handleSubmit = async (event: React.FormEvent) => {
        event?.preventDefault();
        setError('');

        if (transferAmount <= 0) {
            setError('Amount must be greater than zero');
            return;
        }

        if (!selectedAccountFrom || ! selectedAccountTo || selectedAccountFrom ===  selectedAccountTo) {
            setError('Please select valid and distinct accounts for the transfer');
            return;
        }
    
        const userUuid = auth.currentUser?.uid;
        if (!userUuid) {
            console.error("No user is logged in");
            navigate('/login');
            return;
        }
    
        const accountDocRef = doc(db, "accounts", userUuid);
    
        try {
            const docSnap = await getDoc(accountDocRef);
            if (docSnap.exists()) {
                let bankAccounts = docSnap.data().bankAccounts;

                
                const fromAccountIndex = bankAccounts.findIndex((acc: { accountName: string; }) => acc.accountName === selectedAccountFrom);
                const toAccountIndex = bankAccounts.findIndex((acc: { accountName: string; }) => acc.accountName === selectedAccountTo);
    
                if (bankAccounts[fromAccountIndex].balance < transferAmount) {
                    setError('Insufficient funds in the source account');
                    return;
                }
    
                bankAccounts[fromAccountIndex] = {
                    ...bankAccounts[fromAccountIndex],
                    balance: bankAccounts[fromAccountIndex].balance - transferAmount
                };
    
                bankAccounts[toAccountIndex] = {
                    ...bankAccounts[toAccountIndex],
                    balance: bankAccounts[toAccountIndex].balance + transferAmount
                };
        
                await updateDoc(accountDocRef, {
                    bankAccounts: bankAccounts
                });
        
                navigate('/dashboard');

            } else {
                throw new Error("Account document does not exist!");
            }
        } catch (error) {
            console.error("Error during transfer: ", error);
            setError('Error during transfer');
        }
    };
        

      return (
        <>

        <nav className="navbar">
        <div className="login-link">
          <a href="/">Home</a>
          <a href="/dashboard">Dashboard</a>
        </div>
      </nav>

        <div className='accounts'>
          {accountData && (
            <div key={accountData.id}>
              <h2 className='account-name'>Make Internal Transfer</h2>
                
              <div className='transfer-dropdowns'>
                <div>
                  <label className='account-name'>From: </label>
                  <select value={selectedAccountFrom} onChange={handleAccountFromChange}>
                    <option value="">Select an account</option>
                    {accountData.bankAccounts.map((bankAccount, index) => (
                      <option key={index} value={bankAccount.accountName}>
                        {bankAccount.accountName}
                      </option>
                    ))}
                  </select>
                </div>
    
                <div>
                <label className='account-name'>To: </label>
                  <select value={selectedAccountTo} onChange={handleAccountToChange}>
                    <option value="">Select an account</option>
                    {accountData.bankAccounts.map((bankAccount, index) => (
                      <option key={index} value={bankAccount.accountName}>
                        {bankAccount.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
        <form className='signupform' onSubmit={handleSubmit}>
            <h5 className='error'>{error}</h5>
        <input
          type="number"
          placeholder='$XXX'
          id="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(+e.target.value)}
          required
        />
        <button className='signupbutton' type="submit">Transfer</button>
        </form>
            </div>
          )}

        
        </div>
        </>
      );
};

