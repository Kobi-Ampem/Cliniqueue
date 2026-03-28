import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import FirstAidDetail from './pages/FirstAidDetail.jsx'
import FirstAidList from './pages/FirstAidList.jsx'
import Home from './pages/Home.jsx'
import HospitalGuideDetail from './pages/HospitalGuideDetail.jsx'
import HospitalGuideList from './pages/HospitalGuideList.jsx'
import ReportWait from './pages/ReportWait.jsx'
import VisitJournal from './pages/VisitJournal.jsx'
import WaitTimes from './pages/WaitTimes.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/first-aid" element={<FirstAidList />} />
        <Route path="/first-aid/:id" element={<FirstAidDetail />} />
        <Route path="/prepare" element={<HospitalGuideList />} />
        <Route path="/prepare/:id" element={<HospitalGuideDetail />} />
        <Route path="/wait-times" element={<WaitTimes />} />
        <Route path="/wait-times/report" element={<ReportWait />} />
        <Route path="/visits" element={<VisitJournal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
