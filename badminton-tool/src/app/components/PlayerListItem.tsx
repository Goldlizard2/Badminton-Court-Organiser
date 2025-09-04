import { Box, Chip, IconButton, ListItem, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  skill_level: number;
  gender: "Male" | "Female";
  club_id: number;
}

interface Props {
  player: Player;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number, name: string) => void;
  getGenderChipColor: (gender: string) => "primary" | "secondary";
  getPlayerBackgroundColor: (gender: string) => string;
}

const PlayerListItem: React.FC<Props> = ({
  player,
  isSelected,
  onSelect,
  onDelete,
  getGenderChipColor,
  getPlayerBackgroundColor,
}) => {
  const baseColor = getPlayerBackgroundColor(player.gender);
  const selectedColor = player.gender === "Female" ? "#f06292" : "#1976d2";

  return (
    <ListItem
      divider
      onClick={() => onSelect(player.id)}
      sx={{
        backgroundColor: isSelected ? selectedColor : baseColor,
        color: isSelected ? "#fff" : "inherit",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: isSelected
            ? selectedColor
            : player.gender === "Female"
              ? "#f8bbd9"
              : "#bbdefb",
        },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        transition: "background-color 0.2s",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {player.first_name} {player.last_name}
          </Typography>
          <Chip
            label={player.gender}
            size="small"
            color={getGenderChipColor(player.gender)}
            sx={{
              backgroundColor: isSelected ? "#fff" : undefined,
              color: isSelected ? selectedColor : undefined,
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {player.email}
        </Typography>
      </Box>
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete(player.id, `${player.first_name} ${player.last_name}`);
        }}
        color="error"
        sx={{ ml: 2, flexShrink: 0 }}
      >
        <DeleteIcon />
      </IconButton>
    </ListItem>
  );
};

export default PlayerListItem;
