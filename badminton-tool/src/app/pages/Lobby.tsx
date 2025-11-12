import React, { useState } from "react";
import { Grid } from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import { usePlayersContext } from "../context/PlayersContext";
import SelectedPlayersPanel from "../components/SelectedPlayersPanel";
import CourtsPanel from "../components/CourtsPanel";
import SittingOffPanel from "../components/SittingOffPanel";

const MAX_COURTS = 12;
const MIN_COURTS = 1;

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  skill_level: number;
  club_id: number;
  sit_off_count: number;
}

interface Game {
  court: number;
  players: Player[];
}

interface GamesRound {
  games: Game[];
  sitting_off: Player[];
}

interface LobbyProps {
  initialAvailableCourts?: number;
}

const Lobby: React.FC<LobbyProps> = ({
  initialAvailableCourts = 4,
}) => {
  const { selectedPlayers } = usePlayersContext();
  const [maxCourts, setMaxCourts] = useState<number>(initialAvailableCourts);
  const [games, setGames] = useState<GamesRound>({
    games: [],
    sitting_off: [],
  });
  const [loading, setLoading] = useState(false);
  const [sittingOffPlayers, setSittingOffPlayers] = useState<Player[]>([]);

  const numCourts = Math.min(
    maxCourts,
    Math.floor(selectedPlayers.length / 4) || (selectedPlayers.length >= 4 ? 1 : 0)
  );

  const handleCreateGames = async () => {
    setLoading(true);
    try {
      const result = await invoke<GamesRound>("make_games", {
        players: selectedPlayers.map((p) => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          skill_level: p.skill_level,
          sit_off_count: p.sit_off_count,
        })),
        numCourts: numCourts,
        previous_sit_offs: null,
      });

      console.log("make_games output:", result);
      setGames(result);
      if (result.sitting_off) {
        setSittingOffPlayers(result.sitting_off);
      }
    } catch (e) {
      console.error("Error creating games:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCourtChange = (delta: number) => {
    setMaxCourts((prev) => {
      const next = prev + delta;
      if (next < MIN_COURTS) return MIN_COURTS;
      if (next > MAX_COURTS) return MAX_COURTS;
      return next;
    });
  };

  return (
    <Grid container spacing={2}>
      {/* Left: Selected Members */}
      <Grid item xs={12} md={4}>
        <SelectedPlayersPanel />
      </Grid>

      {/* Right: Courts Grid */}
      <Grid item xs={12} md={8}>
        <CourtsPanel
          maxCourts={maxCourts}
          onCourtChange={handleCourtChange}
          numCourts={numCourts}
          games={games.games}
          onCreateGames={handleCreateGames}
          loading={loading}
          selectedPlayersCount={selectedPlayers.length}
        />
      </Grid>

      {/* Sitting Off */}
      <SittingOffPanel players={sittingOffPlayers} />
    </Grid>
  );
};

export default Lobby;
