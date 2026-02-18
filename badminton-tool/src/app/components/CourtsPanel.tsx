import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import CourtControls from "./CourtControls";
import CourtGrid from "./CourtGrid";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  skill_level: number;
  club_id: number;
  sit_out_count: number;
}

interface Game {
  court: number;
  players: Player[];
}

interface CourtsPanelProps {
  maxCourts: number;
  onCourtChange: (delta: number) => void;
  numCourts: number;
  games: Game[];
  onCreateGames: () => void;
  loading: boolean;
  selectedPlayersCount: number;
}

const CourtsPanel: React.FC<CourtsPanelProps> = ({
  maxCourts,
  onCourtChange,
  numCourts,
  games,
  onCreateGames,
  loading,
  selectedPlayersCount,
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <CourtControls
        maxCourts={maxCourts}
        onCourtChange={onCourtChange}
        numCourts={numCourts}
      />
      <Typography variant="body2" sx={{ mb: 1 }}>
        Courts to use this round: <b>{numCourts}</b>
      </Typography>
      <CourtGrid games={games} />
      <Box mt={2}>
        <Button
          variant="contained"
          onClick={onCreateGames}
          disabled={loading || selectedPlayersCount < 4}
        >
          {loading ? "Creating..." : "Create Games"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CourtsPanel;