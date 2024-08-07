import { useState } from 'react'
import Header from "./components/Header"
import Dashboard from "./components/DashboardCOI"
import './App.css'
import SubCOIDashBoard from './components/SubCOI_Dashboard'
import {Routes, Route} from 'react-router-dom'
import COIMetaData from './components/COIMetaData'
import GraphUI from './components/GraphUI'
import XLSXReader from './components/XLSXReader'



function App() {
  const [coiDashboard, setDashboard] = useState({});
  const [profiles, setProfiles] = useState({});
  return (
    <>
    <Header/>
    
    
    <Routes>
      <Route path='/' element={<XLSXReader setDashboard={setDashboard} setProfiles={setProfiles}/>}></Route>
      {
        Object.keys(coiDashboard).length > 0 && 
        <>
          { 
            <Route key={crypto.randomUUID()} path='/possible' element={<Dashboard dashboardData={coiDashboard.possible} />}></Route>
          }
          { 
            <Route key={crypto.randomUUID()} path='/positive' element={<Dashboard dashboardData={coiDashboard.positive}/>}></Route>
          }
        </>
      }
      <Route path='/coidetails/:pageid' element={<COIMetaData/>}></Route>
      <Route path='/GraphUI' element={<GraphUI />}></Route>
    </Routes>
    </>

  )
}

export default App
