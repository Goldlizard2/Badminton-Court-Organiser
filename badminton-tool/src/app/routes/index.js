import React from "react";
import { Route, Switch } from "react-router-dom";
import ClubsListPage from "../components/ClubsList";

const Routes = () => {
  return (
    <Switch>
      <Route path="/" element={<ClubsListPage />} />
    </Switch>
  );
};

export default Routes;
