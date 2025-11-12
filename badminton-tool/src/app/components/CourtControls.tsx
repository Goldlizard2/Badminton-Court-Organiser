import React from "react";
import { Box, Typography, IconButton, TextField } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

interface CourtControlsProps {
  maxCourts: number;
  onCourtChange: (delta: number) => void;
  numCourts: number;
  minCourts?: number;
  maxCourtsLimit?: number;
}

const CourtControls: React.FC<CourtControlsProps> = ({
  maxCourts,
  onCourtChange,
  numCourts,
  minCourts = 1,
  maxCourtsLimit = 12,
}) => {
  return (
    <Box display="flex" alignItems="center" mb={2}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Courts
      </Typography>
      <IconButton
        onClick={() => onCourtChange(-1)}
        disabled={maxCourts <= minCourts}
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
        onClick={() => onCourtChange(1)}
        disabled={maxCourts >= maxCourtsLimit}
      >
        <Add />
      </IconButton>
      <Typography sx={{ ml: 2 }} color="text.secondary">
        (Max courts)
      </Typography>
    </Box>
  );
};

export default CourtControls;