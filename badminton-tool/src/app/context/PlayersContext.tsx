import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  skill_level: number;
  gender?: "Male" | "Female";
  club_id: number;
  sit_out_count: number;
}

interface PlayersContextType {
  players: Player[];
  selectedPlayers: Player[];
  setPlayers: (players: Player[]) => void;
  setSelectedPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: number) => void;
  selectPlayer: (player: Player) => void;
  deselectPlayer: (playerId: number) => void;
  clearSelectedPlayers: () => void;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

export const usePlayersContext = () => {
  const context = useContext(PlayersContext);
  if (context === undefined) {
    throw new Error('usePlayersContext must be used within a PlayersProvider');
  }
  return context;
};

interface PlayersProviderProps {
  children: ReactNode;
}

export const PlayersProvider: React.FC<PlayersProviderProps> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  const addPlayer = (player: Player) => {
    setPlayers(prev => [...prev, player]);
  };

  const removePlayer = (playerId: number) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const selectPlayer = (player: Player) => {
    setSelectedPlayers(prev => {
      if (prev.find(p => p.id === player.id)) {
        return prev;
      }
      return [...prev, player];
    });
  };

  const deselectPlayer = (playerId: number) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const clearSelectedPlayers = () => {
    setSelectedPlayers([]);
  };

  const value = {
    players,
    selectedPlayers,
    setPlayers,
    setSelectedPlayers,
    addPlayer,
    removePlayer,
    selectPlayer,
    deselectPlayer,
    clearSelectedPlayers,
  };

  return (
    <PlayersContext.Provider value={value}>
      {children}
    </PlayersContext.Provider>
  );
};