import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ClubsListPage from "./components/ClubsList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClubsListPage />} />
        {/* Add more routes here as needed */}
      </Routes>
    </Router>
  );
};

export default App;
