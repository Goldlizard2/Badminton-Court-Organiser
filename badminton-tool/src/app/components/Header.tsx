import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-center"
      mb={3}
      sx={{ width: "100%" }}
    >
      <Box sx={{ textAlign: "left" }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionButton && (
        <Button
          variant="contained"
          startIcon={actionButton.icon}
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default Header;