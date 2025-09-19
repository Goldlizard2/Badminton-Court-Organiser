import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Avatar,
  Stack,
  Container,
} from "@mui/material";
import {
  SportsTennis,
  Groups,
  Stadium,
  PlayArrow,
  Refresh,
  Person,
} from "@mui/icons-material";

interface Player {
  id: number;
  name: string;
  skill_level: number;
  club_id: number;
}

interface Game {
  court_number: number;
  player1: Player;
  player2: Player;
}

interface Club {
  id: number;
  name: string;
  total_courts: number;
}

const Lobby: React.FC = () => {
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [availableCourts, setAvailableCourts] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    if (selectedClubId) {
      loadPlayersForClub(selectedClubId);
      loadClubInfo(selectedClubId);
    }
  }, [selectedClubId]);

  const loadClubs = async () => {
    try {
      const clubsData = await invoke<Club[]>("get_all_clubs");
      setClubs(clubsData);
    } catch (err) {
      setError("Failed to load clubs");
      console.error(err);
    }
  };

  const loadPlayersForClub = async (clubId: number) => {
    try {
      const playersData = await invoke<Player[]>("get_players_by_club", {
        clubId,
      });
      setPlayers(playersData);
    } catch (err) {
      setError("Failed to load players");
      console.error(err);
    }
  };

  const loadClubInfo = async (clubId: number) => {
    try {
      const club = await invoke<Club>("get_club_by_id", { id: clubId });
      setAvailableCourts(club.total_courts);
    } catch (err) {
      setError("Failed to load club info");
      console.error(err);
    }
  };

  const generateGames = async () => {
    if (!selectedClubId) {
      setError("Please select a club first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const gamesData = await invoke<Game[]>("make_games", {
        clubId: selectedClubId,
      });
      setGames(gamesData);
    } catch (err) {
      setError("Failed to generate games");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetGames = () => {
    setGames([]);
  };

  const getSkillLevelColor = (level: number) => {
    if (level <= 3) return "success";
    if (level <= 6) return "warning";
    return "error";
  };

  const renderCourt = (courtNumber: number) => {
    const game = games.find((g) => g.court_number === courtNumber);

    if (!game) {
      return (
        <Grid item xs={12} sm={6} md={4} key={courtNumber}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              border: 2,
              borderColor: "grey.300",
              "&:hover": {
                boxShadow: 3,
                transform: "translateY(-4px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardHeader
              avatar={<Stadium color="disabled" />}
              title={`Court ${courtNumber}`}
              action={<Chip label="Available" color="default" size="small" />}
              sx={{ backgroundColor: "grey.50" }}
            />
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 120,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                fontStyle="italic"
              >
                No players assigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      );
    }

    return (
      <Grid item xs={12} sm={6} md={4} key={courtNumber}>
        <Card
          variant="outlined"
          sx={{
            height: "100%",
            border: 2,
            borderColor: "success.main",
            backgroundColor: "success.50",
            "&:hover": {
              boxShadow: 3,
              transform: "translateY(-4px)",
              transition: "all 0.3s ease",
            },
          }}
        >
          <CardHeader
            avatar={<SportsTennis color="success" />}
            title={`Court ${courtNumber}`}
            action={<Chip label="In Use" color="success" size="small" />}
            sx={{ backgroundColor: "success.100" }}
          />
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "white" }}>
                  <Avatar sx={{ mb: 1, mx: "auto", bgcolor: "primary.main" }}>
                    <Person />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {game.player1.name}
                  </Typography>
                  <Chip
                    label={`Level ${game.player1.skill_level}`}
                    size="small"
                    color={getSkillLevelColor(game.player1.skill_level)}
                    variant="outlined"
                  />
                </Paper>
              </Box>

              <Chip
                label="VS"
                color="error"
                size="small"
                sx={{
                  fontWeight: "bold",
                  minWidth: 40,
                }}
              />

              <Box sx={{ flex: 1, textAlign: "center" }}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: "white" }}>
                  <Avatar sx={{ mb: 1, mx: "auto", bgcolor: "secondary.main" }}>
                    <Person />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {game.player2.name}
                  </Typography>
                  <Chip
                    label={`Level ${game.player2.skill_level}`}
                    size="small"
                    color={getSkillLevelColor(game.player2.skill_level)}
                    variant="outlined"
                  />
                </Paper>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          align="center"
          color="primary"
        >
          Badminton Court Organiser - Lobby
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3} alignItems="center">
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel id="club-select-label">Select Club</InputLabel>
              <Select
                labelId="club-select-label"
                value={selectedClubId || ""}
                label="Select Club"
                onChange={(e) =>
                  setSelectedClubId(Number(e.target.value) || null)
                }
              >
                <MenuItem value="">
                  <em>Choose a club...</em>
                </MenuItem>
                {clubs.map((club) => (
                  <MenuItem key={club.id} value={club.id}>
                    {club.name} ({club.total_courts} courts)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedClubId && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <PlayArrow />
                  }
                  onClick={generateGames}
                  disabled={loading || players.length < 2}
                  size="large"
                >
                  {loading ? "Generating..." : "Generate Games"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Refresh />}
                  onClick={resetGames}
                  disabled={games.length === 0}
                  size="large"
                >
                  Reset Courts
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedClubId && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom align="center" color="primary">
            Statistics
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Stadium color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {availableCourts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Courts
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Groups color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {players.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Players
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <SportsTennis color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {games.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Courts in Use
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Stadium color="action" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="text.primary" fontWeight="bold">
                  {availableCourts - games.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Courts
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {selectedClubId && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center" color="primary">
            Courts Overview
          </Typography>
          <Grid container spacing={3}>
            {Array.from({ length: availableCourts }, (_, index) =>
              renderCourt(index + 1)
            )}
          </Grid>
        </Box>
      )}

      {selectedClubId && players.length > 0 && games.length === 0 && (
        <Paper elevation={2} sx={{ p: 3, backgroundColor: "warning.50" }}>
          <Typography
            variant="h5"
            gutterBottom
            align="center"
            color="warning.dark"
          >
            Players Ready to Play ({players.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {players.map((player) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={player.id}>
                <Card variant="outlined" sx={{ height: "100%" }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "warning.main" }}>
                      <Person />
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {player.name}
                    </Typography>
                    <Chip
                      label={`Level ${player.skill_level}`}
                      size="small"
                      color={getSkillLevelColor(player.skill_level)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default Lobby;
