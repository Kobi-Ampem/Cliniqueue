import { Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Layout/Navbar'
import Home from './pages/Home'
import FirstAid from './pages/FirstAid'
import HospitalGuide from './pages/HospitalGuide'
import WaitTimes from './pages/WaitTimes'
import Journal from './pages/Journal'

export default function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="page-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/hospital-guide" element={<HospitalGuide />} />
          <Route path="/wait-times" element={<WaitTimes />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
    </LanguageProvider>
  )
}
