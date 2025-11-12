import React from "react";
import { Grid, Paper, Stack, Typography } from "@mui/material";

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

interface CourtGridProps {
  games: Game[];
}

const CourtGrid: React.FC<CourtGridProps> = ({ games }) => {
  return (
    <Grid container spacing={2}>
      {games.map((game, idx) => (
        <Grid item xs={6} sm={3} key={idx}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="subtitle1">
              Court {game.court}
            </Typography>
            <Stack spacing={1}>
              {game.players.map((player) => (
                <Typography key={player.id}>
                  {player.first_name} {player.last_name}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default CourtGrid;