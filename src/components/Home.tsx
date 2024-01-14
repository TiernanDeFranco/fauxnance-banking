import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react'


export const Home = () => {

 const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
 const auth = getAuth(); 


 useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <div>
        <nav className="navbar">
           
            <div className="login-link">
            {!isLoggedIn && <a href="/dashboard">Log In</a> }
            {isLoggedIn && <a href="/dashboard">Dashboard</a>}
            </div>
        </nav>

        <div>
            <h1>Offering $10,000 sign-up bonus for new accounts!</h1>
            <h5>**Terms Apply*** (NOT backed by the full faith and credit of US Government on account of this being a fake banking website)</h5>
        </div>

        <div>
        <img className='logo' src='./assets/fauxnancebanking.png' width={550}/>
        </div>


        <button className='open-account-button'> <a  href="/create-account">Open an Account</a></button>

    </div>
  )
}
