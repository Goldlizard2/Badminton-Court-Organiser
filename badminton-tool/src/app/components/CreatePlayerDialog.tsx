import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React from "react";

interface Props {
  open: boolean;
  newPlayer: {
    first_name: string;
    last_name: string;
    email: string;
    gender: "Male" | "Female";
    skill_level: number;
  };
  onClose: () => void;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
}

const CreatePlayerDialog: React.FC<Props> = ({
  open,
  newPlayer,
  onClose,
  onChange,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Add New Member</DialogTitle>
    <DialogContent>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="First Name"
          value={newPlayer.first_name}
          onChange={(e) => onChange("first_name", e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Last Name"
          value={newPlayer.last_name}
          onChange={(e) => onChange("last_name", e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Email"
          type="email"
          value={newPlayer.email}
          onChange={(e) => onChange("email", e.target.value)}
          fullWidth
          required
        />
        <TextField
          label="Skill Level"
          type="number"
          value={newPlayer.skill_level}
          onChange={(e) => onChange("skill_level", Number(e.target.value))}
          fullWidth
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Gender</InputLabel>
          <Select
            value={newPlayer.gender}
            label="Gender"
            onChange={(e) => onChange("gender", e.target.value)}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={
          !newPlayer.first_name.trim() ||
          !newPlayer.last_name.trim() ||
          !newPlayer.email.trim()
        }
      >
        Add Member
      </Button>
    </DialogActions>
  </Dialog>
);

export default CreatePlayerDialog;
