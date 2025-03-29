import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AdminPanel from './pages/AdminPanel'
import './index.css'


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

export default App
