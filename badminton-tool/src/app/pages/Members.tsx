import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import { Alert, Box } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import Header from "../components/Header";
import Footer from "../components/Footer";
import MembersList from "../components/MembersList";
import CreatePlayerDialog from "../components/CreatePlayerDialog";
import { usePlayersContext, Player } from "../context/PlayersContext";


const Members: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const {
    players,
    selectedPlayers,
    setPlayers,
    selectPlayer,
    deselectPlayer,
    clearSelectedPlayers,
  } = usePlayersContext();

  const [clubName, setClubName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Omit<CreatePlayerRequest, "club_id">>({
    first_name: "",
    last_name: "",
    email: "",
    gender: "Male",
    skill_level: 1,
  });

  const selectedClubId = clubId ? parseInt(clubId, 10) : null;

  useEffect(() => {
    if (selectedClubId) {
      loadClubData();
      loadPlayers();
    }
  }, [selectedClubId]);

  const loadClubData = async () => {
    if (!selectedClubId) return;

    try {
      const club = await invoke<{ id: number; name: string }>("get_club_by_id", {
        clubId: selectedClubId,
      });
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

  const handleSelectPlayer = (id: number) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;

    const isSelected = selectedPlayers.some((p) => p.id === id);
    isSelected ? deselectPlayer(id) : selectPlayer(player);
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

      setNewPlayer({
        first_name: "",
        last_name: "",
        email: "",
        gender: "Male",
        skill_level: 1,
      });
      setCreateDialogOpen(false);
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
      deselectPlayer(playerId);
      await loadPlayers();
    } catch (err) {
      setError(err as string);
      console.error("Error deleting player:", err);
    }
  };

  const handleDialogChange = (field: string, value: any) => {
    setNewPlayer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getSubtitle = () => {
    const memberText = `${players.length} member${players.length !== 1 ? "s" : ""}`;
    const playingText =
      selectedPlayers.length > 0 ? `, ${selectedPlayers.length} playing today` : "";
    return memberText + playingText;
  };

  const getGenderChipColor = (gender: string) =>
    gender === "Female" ? "secondary" : "primary";

  const getPlayerBackgroundColor = (gender: string) =>
    gender === "Female" ? "#fce4ec" : "#e3f2fd";

  if (!selectedClubId) {
    return (
      <Box sx={{ p: 3 }}>
        <Header title="Club Members" subtitle="Invalid club ID" />
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
        alignItems: "flex-start",
        p: 3,
        boxSizing: "border-box",
        overflow: "auto",
      }}
    >
      <Header
        title={`Members of ${clubName}`}
        subtitle={getSubtitle()}
        actionButton={{
          label: "Add Member",
          icon: <PersonAddIcon />,
          onClick: () => setCreateDialogOpen(true),
        }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <MembersList
        players={players}
        selectedPlayers={selectedPlayers}
        loading={loading}
        onSelectPlayer={handleSelectPlayer}
        onDeletePlayer={handleDeletePlayer}
        getGenderChipColor={getGenderChipColor}
        getPlayerBackgroundColor={getPlayerBackgroundColor}
      />

      <CreatePlayerDialog
        open={createDialogOpen}
        newPlayer={newPlayer}
        onClose={() => setCreateDialogOpen(false)}
        onChange={handleDialogChange}
        onSubmit={handleCreatePlayer}
      />

      <Footer
        onBack={() => navigate("/")}
        onForward={() => navigate(`/clubs/${clubId}/lobby`)}
        backLabel="Clubs"
        forwardLabel={`Lobby (${selectedPlayers.length})`}
        forwardDisabled={selectedPlayers.length === 0}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default Members;
