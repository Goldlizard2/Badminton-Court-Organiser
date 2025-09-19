import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClubsListPage from "./pages/ClubsList";
import Members from "./pages/Members";
import Lobby from "./pages/Lobby";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubsListPage />} />
        <Route path="/clubs/:clubId/members" element={<Members />} />
        <Route path="/clubs/:clubId/lobby" element={<Lobby />} />
      </Routes>
    </Router>
  );
};

export default App;
