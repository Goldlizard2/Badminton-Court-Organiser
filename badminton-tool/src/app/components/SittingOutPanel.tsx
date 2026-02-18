import React from "react";
import { Box, Stack, Typography } from "@mui/material";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  skill_level: number;
  club_id: number;
  sit_out_count: number;
}

interface SittingOutPanelProps {
  players: Player[];
}

const SittingOutPanel: React.FC<SittingOutPanelProps> = ({ players }) => {
  if (players.length === 0) {
    return null;
  }

  return (
    <Box mt={2}>
      <Typography variant="h6">Sitting Out</Typography>
      <Stack spacing={1}>
        {players.map((player) => (
          <Typography key={player.id}>
            {player.first_name} {player.last_name}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

export default SittingOutPanel;