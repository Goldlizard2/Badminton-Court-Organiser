import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClubsListPage from "./pages/ClubsList";
import Members from "./pages/Members";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubsListPage />} />
        <Route path="/clubs/:clubId/members" element={<Members />} />
      </Routes>
    </Router>
  );
};

export default App;
