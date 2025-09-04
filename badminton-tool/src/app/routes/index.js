import { Route, Switch } from "react-router-dom";
import ClubsListPage from "../pages/ClubsList";
import Members from "../pages/Members";
import Lobby from "../pages/Lobby";

const Routes = () => {
  return (
    <Switch>
      <Route path="/" element={<ClubsListPage />} />
      <Route path="/clubs/:clubId/members" element={<Members />} />
      <Route path="/clubs/:clubId/lobby" element={<Lobby />} />
    </Switch>
  );
};

export default Routes;
