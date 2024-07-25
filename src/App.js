import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TeamCreate from './TeamCreate';
import LeagueCreate from './LeagueCreate';
import TeamDetail from './TeamDetail';
import HomePage from './homePage';
import DivisionCreate from './DivisionCreate';
import LeagueEdit from './LeagueEdit';
import TeamsView from './TeamsView';
import TimeSlotCreate from './TimeslotCreate';
import TeamEdit from './TeamEdit';
import TimeslotEdit from './TimeslotEdit';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />}></Route>
          <Route path='/league/create' element={<LeagueCreate />}></Route>
          <Route path='/league/:id/create' element={<DivisionCreate />}></Route>
          <Route path='/team/detail/:teamid' element={<TeamDetail />}></Route>
          <Route path='/league/:id' element={<LeagueEdit />}></Route>
          <Route path="/league/:leagueID/division/:divisionID/teams" element={<TeamsView />} />
          <Route path = '/league/:leagueID/division/:divisionID/team' element={<TeamCreate/>}></Route>
          <Route path = '/league/:leagueID/division/:divisionID/timeslot' element={<TimeSlotCreate/>}></Route>
          <Route path = '/league/:leagueID/division/:divisionID/team/:teamID' element={<TeamEdit/>}></Route>
          <Route path = '/league/:leagueID/division/:divisionID/timeslot/:timeslotID' element={<TimeslotEdit/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );

}

export default App;
