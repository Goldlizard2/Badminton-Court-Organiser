import React, { useEffect, useState } from "react";
import { Box, Button, Fab, Grid, IconButton, Typography } from "@mui/material";
import { useNavigate, useParams} from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { usePlayersContext } from "../context/PlayersContext";
import SelectedPlayersPanel from "../components/SelectedPlayersPanel";
import CourtsPanel from "../components/CourtsPanel";
import SittingOutPanel from "../components/SittingOutPanel";
import Footer from "../components/Footer";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Home } from "@mui/icons-material";

const MAX_COURTS = 12;
const MIN_COURTS = 1;

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

interface GamesRound {
  games: Game[];
  sitting_out: Player[];
}

interface LobbyProps {
  initialAvailableCourts?: number;
}

const Lobby: React.FC<LobbyProps> = ({ initialAvailableCourts = 4 }) => {
  const navigate = useNavigate();
  const { clubId } = useParams<{ clubId: string }>();
  const { selectedPlayers } = usePlayersContext();

  const [maxCourts, setMaxCourts] = useState<number>(initialAvailableCourts);
  const [games, setGames] = useState<GamesRound>({
    games: [],
    sitting_out: [],
  });
  const [loading, setLoading] = useState(false);
  const [sittingOutPlayers, setSittingOutPlayers] = useState<Player[]>([]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(10 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) return;

    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  const addMinute = () => setRemainingSeconds((prev) => prev + 60);
  const removeMinute = () => setRemainingSeconds((prev) => Math.max(0, prev - 60));

  const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const seconds = String(remainingSeconds % 60).padStart(2, "0");

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
          sit_out_count: p.sit_out_count ?? 0,
        })),
        numCourts: numCourts,
        previous_sit_out:
          sittingOutPlayers.length > 0
            ? sittingOutPlayers.map((p) => ({
                id: p.id,
                first_name: p.first_name,
                last_name: p.last_name,
                skill_level: p.skill_level,
                sit_out_count: p.sit_out_count ?? 0,
              }))
            : null,
      });

      setGames(result);
      setSittingOutPlayers(result.sitting_out ?? []);
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
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        p: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Top controls */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => navigate("/")}
          >
          </Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton aria-label="remove minute" onClick={removeMinute} size="small">
            <RemoveIcon />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 90, textAlign: "center" }}>
            {minutes}:{seconds}
          </Typography>
          <IconButton aria-label="add minute" onClick={addMinute} size="small">
            <AddIcon />
          </IconButton>
        </Box>

        <Box />
      </Box>

      <Grid container spacing={2} sx={{ flex: 1 }}>
        <Grid item xs={12} md={4}>
          <SelectedPlayersPanel />
        </Grid>

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

        <SittingOutPanel players={sittingOutPlayers} />
      </Grid>

      <Footer
        onBack={() => navigate(`/clubs/${clubId}/members`)}
        backLabel="Members"
        forwardDisabled={true}
        sx={{ mt: 2 }}
        
      />

      <Fab
        color="primary"
        onClick={() => setIsRunning((prev) => !prev)}
        sx={{ position: "fixed", right: 24, bottom: 24 }}
        aria-label={isRunning ? "pause timer" : "play timer"}
        >
        {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        
      </Fab>
    </Box>
  );
};

export default Lobby;
