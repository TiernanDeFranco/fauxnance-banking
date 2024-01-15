import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


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
  

export const Peer = () => {

    const [, setIsLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const auth = getAuth();
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [selectedAccountFrom, setSelectedAccountFrom] = useState<string>('');
    const [recipientEmail, setRecipientEmail] = useState<string>('');
    const [transferAmount, setTransferAmount] = useState<string>('');
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

      const handleAccountFromChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAccountFrom(event.target.value);
    };

    const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only update if the value is empty or a valid number
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
          setTransferAmount(value);
        }
      };
      

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        if (+transferAmount <= 0) {
            setError('Amount must be greater than zero');
            return;
        }

        if (!selectedAccountFrom || !recipientEmail) {
            setError('Please select a valid account and enter recipient email');
            return;
        }

        const user = auth.currentUser;
    if (!user) {
        console.error("No user is logged in");
        navigate('/login');
        return;
    }

    if (user.email === recipientEmail) {
        setError("You cannot send money to your own account");
        return;
    }

        const userUuid = auth.currentUser?.uid;
        if (!userUuid) {
            console.error("No user is logged in");
            navigate('/login');
            return;
        }

        const db = getFirestore();
        const accountDocRef = doc(db, "accounts", userUuid);
        try {
            const docSnap = await getDoc(accountDocRef);
            if (!docSnap.exists()) {
                throw new Error("Account document does not exist!");
            }

            let bankAccounts = docSnap.data().bankAccounts as BankArray[];
            const fromAccountIndex = bankAccounts.findIndex(acc => acc.accountName === selectedAccountFrom);

            if (bankAccounts[fromAccountIndex].balance < +transferAmount) {
                setError('Insufficient funds in the source account');
                return;
            }


            const accountsCollection = collection(db, 'accounts');
            const queryByEmail = query(accountsCollection, where("email", "==", recipientEmail));
            const querySnapshot = await getDocs(queryByEmail);

            let recipientAccountFound = false;
            querySnapshot.forEach(async (documentSnapshot) => {
                if (documentSnapshot.exists()) {
                    recipientAccountFound = true;
                    const recipientAccountData = documentSnapshot.data() as AccountData;
            
                   
                    bankAccounts[fromAccountIndex].balance -= +transferAmount;
                    await updateDoc(accountDocRef, { bankAccounts });
            
                    if (recipientAccountData.bankAccounts.length > 0) {
                        recipientAccountData.bankAccounts[0].balance += +transferAmount;
                        const recipientDocRef = doc(db, "accounts", documentSnapshot.id);
                        await updateDoc(recipientDocRef, {
                            bankAccounts: recipientAccountData.bankAccounts
                        });
                    }
            
                    navigate('/dashboard');
                }
            });
            
        
                if (!recipientAccountFound) {
                    setError('Recipient email not found in the system');
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
                            <h2 className='account-name'>Make Transfer</h2>
                            <form className='signupform' onSubmit={handleSubmit}>
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
                                        <label className='account-name'>Recipient Email: </label>
                                        <input
                                            type="email"
                                            placeholder='Recipient Email'
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
        
                                <h5 className='error'>{error}</h5>
                                <input
                                    type="number"
                                    placeholder='$XXX'
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
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
