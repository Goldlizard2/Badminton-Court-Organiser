import React from "react";
import {
  Box,
  List,
  ListItem,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import PlayerListItem from "./PlayerListItem";

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  skill_level: number;
  gender: "Male" | "Female";
  club_id: number;
  sit_out_count: number;
}

interface MembersListProps {
  players: Player[];
  selectedPlayers: Player[];
  loading: boolean;
  onSelectPlayer: (id: number) => void;
  onDeletePlayer: (playerId: number, playerName: string) => void;
  getGenderChipColor: (gender: string) => "primary" | "secondary";
  getPlayerBackgroundColor: (gender: string) => string;
}

const MembersList: React.FC<MembersListProps> = ({
  players,
  selectedPlayers,
  loading,
  onSelectPlayer,
  onDeletePlayer,
  getGenderChipColor,
  getPlayerBackgroundColor,
}) => {
  return (
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
              isSelected={selectedPlayers.some(p => p.id === player.id)}
              onSelect={onSelectPlayer}
              onDelete={onDeletePlayer}
              getGenderChipColor={getGenderChipColor}
              getPlayerBackgroundColor={getPlayerBackgroundColor}
            />
          ))}
        </List>
      )}
    </Paper>
  );
};

export default MembersList;