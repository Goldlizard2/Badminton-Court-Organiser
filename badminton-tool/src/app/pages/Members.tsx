import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import {
  Alert,
  Box,
  Button,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreatePlayerDialog from "../components/CreatePlayerDialog";
import PlayerListItem from "../components/PlayerListItem";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  skill_level: number;
  gender: "Male" | "Female";
  club_id: number;
}

interface CreatePlayerRequest {
  first_name: string;
  last_name: string;
  email: string;
  gender: "Male" | "Female";
  club_id: number;
  skill_level: number;
}

const Members: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [clubName, setClubName] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState<
    Omit<CreatePlayerRequest, "club_id">
  >({
    first_name: "",
    last_name: "",
    email: "",
    gender: "Male",
    skill_level: 1,
  });

  const selectedClubId = clubId ? parseInt(clubId, 10) : null;
  const handleSelectPlayer = (id: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };
  // Load club name and players when component mounts
  useEffect(() => {
    if (selectedClubId) {
      loadClubData();
      loadPlayers();
    }
  }, [selectedClubId]);

  const loadClubData = async () => {
    if (!selectedClubId) return;

    try {
      // You'll need to add this command to get club by ID
      const club = await invoke<{ id: number; name: string }>(
        "get_club_by_id",
        {
          clubId: selectedClubId,
        }
      );
      setClubName(club.name);
    } catch (err) {
      console.error("Error loading club:", err);
    }
  };

  const loadPlayers = async () => {
    if (!selectedClubId) return;

    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Player[]>("get_players_by_club", {
        clubId: selectedClubId,
      });
      setPlayers(result);
    } catch (err) {
      setError(err as string);
      console.error("Error loading players:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (
      !selectedClubId ||
      !newPlayer.first_name.trim() ||
      !newPlayer.last_name.trim() ||
      !newPlayer.email.trim()
    )
      return;

    setError(null);
    try {
      const playerRequest: CreatePlayerRequest = {
        ...newPlayer,
        club_id: selectedClubId,
      };

      await invoke("create_player", { request: playerRequest });

      // Reset form
      setNewPlayer({
        first_name: "",
        last_name: "",
        email: "",
        gender: "Male",
        skill_level: 1,
      });
      setCreateDialogOpen(false);

      // Reload players list
      await loadPlayers();
    } catch (err) {
      setError(err as string);
      console.error("Error creating player:", err);
    }
  };

  const handleDeletePlayer = async (playerId: number, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName}?`)) return;

    setError(null);
    try {
      await invoke("delete_player", { playerId });
      await loadPlayers(); // Reload the list
    } catch (err) {
      setError(err as string);
      console.error("Error deleting player:", err);
    }
  };

  const getGenderChipColor = (gender: string) => {
    return gender === "Female" ? "secondary" : "primary";
  };

  const getPlayerBackgroundColor = (gender: string) => {
    return gender === "Female" ? "#fce4ec" : "#e3f2fd"; // Light pink or light blue
  };

  // Add this handler for CreatePlayerDialog
  const handleDialogChange = (field: string, value: any) => {
    setNewPlayer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!selectedClubId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Club Members
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Invalid club ID
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start", // align to left
        p: 3, // padding
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      {/* Header Section - Title on left, Button on right */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-center"
        mb={3}
        sx={{ width: "100%" }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 0.5 }}>
            Members of {clubName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {players.length} member{players.length !== 1 ? "s" : ""}
            {selectedPlayerIds.length > 0 &&
              `, ${selectedPlayerIds.length} playing today`}{" "}
            {/* Show loading state */}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Add Member
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Members Table */}
      <Paper sx={{ width: "100%", overflow: "auto" }}>
        {loading ? (
          <List>
            {[...Array(5)].map((_, i) => (
              <ListItem key={i}>
                <Skeleton variant="rectangular" width="100%" height={80} />
              </ListItem>
            ))}
          </List>
        ) : players.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No members found in this club
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: "100%" }}>
            {players.map((player) => (
              <PlayerListItem
                key={player.id}
                player={player}
                isSelected={selectedPlayerIds.includes(player.id)}
                onSelect={handleSelectPlayer}
                onDelete={handleDeletePlayer}
                getGenderChipColor={getGenderChipColor}
                getPlayerBackgroundColor={getPlayerBackgroundColor}
              />
            ))}
          </List>
        )}
      </Paper>

      {/* Create Player Dialog */}
      <CreatePlayerDialog
        open={createDialogOpen}
        newPlayer={newPlayer}
        onClose={() => setCreateDialogOpen(false)}
        onChange={handleDialogChange}
        onSubmit={handleCreatePlayer}
      />

      {/* Footer navigation */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ justifyContent: "flex-start" }}
        >
          Clubs
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() =>
            navigate(`/clubs/${clubId}/lobby`, {
              state: { selectedPlayerIds },
            })
          }
          sx={{ justifyContent: "flex-end" }}
        >
          Lobby
        </Button>
      </Box>
    </Box>
  );
};

export default Members;
