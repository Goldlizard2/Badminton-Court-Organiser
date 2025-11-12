import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { usePlayersContext } from "../context/PlayersContext";

const SelectedPlayersPanel: React.FC = () => {
  const { selectedPlayers } = usePlayersContext();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Selected Members</Typography>
      <Stack spacing={1}>
        {selectedPlayers.map((player) => (
          <Box key={player.id} display="flex" alignItems="center">
            <Typography>
              {player.first_name} {player.last_name}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default SelectedPlayersPanel;