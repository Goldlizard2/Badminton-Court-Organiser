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
  const [games, setGames] = useState<GamesRound>({
    games: [],
    sitting_off: [],
  });
  const [loading, setLoading] = useState(false);
  const [sittingOffPlayers, setSittingOffPlayers] = useState<Player[]>([]);

  const numCourts = Math.min(
    maxCourts,
    Math.floor(players.length / 4) || (players.length >= 4 ? 1 : 0)
  );

  const handleCreateGames = async () => {
    setLoading(true);
    try {
      const result = await invoke<GamesRound>("make_games", {
        players: players.map((p) => ({
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
            {games.games.map((game, idx) => (
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

      {/* Sitting Off */}
      {sittingOffPlayers.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Sitting Off</Typography>
          <Stack spacing={1}>
            {sittingOffPlayers.map((player) => (
              <Typography key={player.id}>
                {player.first_name} {player.last_name}
              </Typography>
            ))}
          </Stack>
        </Box>
      )}
    </Grid>
  );
};

export default Lobby;
