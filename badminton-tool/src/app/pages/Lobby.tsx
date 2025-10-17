import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { invoke } from "@tauri-apps/api/core";
import { useLocation } from "react-router-dom";

const MAX_COURTS = 12;
const MIN_COURTS = 1;

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  skill_level: number;
  club_id: number;
}

interface Game {
  court: number;
  players: Player[];
}

interface LobbyProps {
  initialPlayers?: Player[];
  initialAvailableCourts?: number;
}

const Lobby: React.FC<LobbyProps> = ({
  initialPlayers = [],
  initialAvailableCourts = 4,
}) => {
  const location = useLocation();
  const playersList: Player[] =
    location.state?.selectedPlayers || initialPlayers || [];
  const [players] = useState<Player[]>(playersList);
  const [maxCourts, setMaxCourts] = useState<number>(initialAvailableCourts);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const numCourts = Math.min(
    maxCourts,
    Math.floor(players.length / 4) || (players.length >= 4 ? 1 : 0)
  );

  const handleCreateGames = async () => {
    setLoading(true);
    console.log(
      "Creating games for players:",
      players,
      "with courts:",
      numCourts
    );
    try {
      const result = await invoke<{ games: Game[] }>("make_games", {
        players,
        numCourts,
      });
      console.log("make_games output:", result);
      setGames(result.games);
    } catch (e) {
      // handle error
    }
    setLoading(false);
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
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Selected Members</Typography>
          <Stack spacing={1}>
            {players.map((player) => (
              <Box key={player.id} display="flex" alignItems="center">
                <Typography>
                  {player.first_name} {player.last_name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>

      {/* Right: Courts Grid */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Courts
            </Typography>
            <IconButton
              onClick={() => handleCourtChange(-1)}
              disabled={maxCourts <= 1}
            >
              <Remove />
            </IconButton>
            <TextField
              value={maxCourts}
              size="small"
              sx={{ width: 50, mx: 1 }}
              inputProps={{ readOnly: true, style: { textAlign: "center" } }}
            />
            <IconButton
              onClick={() => handleCourtChange(1)}
              disabled={maxCourts >= 12}
            >
              <Add />
            </IconButton>
            <Typography sx={{ ml: 2 }} color="text.secondary">
              (Max courts)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Courts to use this round: <b>{numCourts}</b>
          </Typography>
          <Grid container spacing={2}>
            {[...Array(numCourts)].map((_, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="subtitle1">Court {idx + 1}</Typography>
                  {games.length > 0 && games[idx] ? (
                    <Stack spacing={1}>
                      {games[idx].players.map((p) => (
                        <Typography key={p.id}>
                          {p.first_name} {p.last_name}
                        </Typography>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">No game yet</Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box mt={2}>
            <Button
              variant="contained"
              onClick={handleCreateGames}
              disabled={loading || players.length < 4}
            >
              {loading ? "Creating..." : "Create Games"}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Lobby;
