import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Club = {
  id: number;
  name: string;
};

const ClubsListPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newClubName, setNewClubName] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameClubId, setRenameClubId] = useState<string | null>(null);
  const [renameClubName, setRenameClubName] = useState("");
  const navigate = useNavigate();

  const fetchClubs = () => {
    setLoading(true);
    invoke<Club[]>("get_clubs")
      .then((data) => {
        setClubs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleCreateClub = async () => {
    if (!newClubName.trim()) return;
    await invoke<Club>("create_club", { request: { name: newClubName } });
    setNewClubName("");
    fetchClubs();
  };

  // const handleOpenRenameDialog = (club: Club) => {
  //   setRenameClubId(club.id);
  //   setRenameClubName(club.name);
  //   setRenameDialogOpen(true);
  // };

  //   const handleRenameClub = async () => {
  //     if (!renameClubId || !renameClubName.trim()) return;
  //     await invoke("rename_club", { id: renameClubId, new_name: renameClubName });
  //     setRenameDialogOpen(false);
  //     setRenameClubId(null);
  //     setRenameClubName("");
  //     fetchClubs();
  //   };

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
      <Typography variant="h4" gutterBottom>
        My Clubs
      </Typography>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="New Club Name"
          value={newClubName}
          onChange={(e) => setNewClubName(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleCreateClub}>
          Create
        </Button>
      </Box>
      <Paper sx={{ width: "100%", flex: 1, overflow: "auto" }}>
        {loading ? (
          <List>
            {[...Array(5)].map((_, i) => (
              <ListItem key={i}>
                <Skeleton variant="rectangular" width="100%" height={32} />
              </ListItem>
            ))}
          </List>
        ) : (
          <List>
            {clubs.map((club) => (
              <ListItem
                key={club.id}
                divider
                secondaryAction={
                  <IconButton edge="end">
                    <EditIcon />
                  </IconButton>
                }
              >
                <Button
                  onClick={() => navigate(`/clubs/${club.id}/members`)}
                  sx={{
                    textTransform: "none",
                    fontWeight: "normal",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    width: "100%",
                    color: "inherit",
                  }}
                >
                  {club.name}
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>Rename Club</DialogTitle>
        <DialogContent>
          <TextField
            label="Club Name"
            value={renameClubName}
            onChange={(e) => setRenameClubName(e.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Rename</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClubsListPage;
