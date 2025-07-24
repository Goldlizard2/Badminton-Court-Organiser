import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClubsListPage from "./components/ClubsList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubsListPage />} />
        <Route
          path="/clubs/:clubId/members"
          element={<div>Members Page</div>}
        />
      </Routes>
    </Router>
  );
};

export default App;
