
import './App.css'
import SignUp from './components/SignUp'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home } from './components/Home'
import { Dashboard } from './components/Dashboard'
import { Login } from './components/Login'
import { OpenNewAccount } from './components/OpenNewAccount'

function App() {

  return (
    <BrowserRouter>
      <Routes>
      <Route path='/' element={< Home/>} />
      <Route path='/create-account' element={<SignUp />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/open-new' element={<OpenNewAccount />} />
      <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
