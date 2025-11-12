import React from "react";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface FooterProps {
  onBack?: () => void;
  onForward?: () => void;
  backLabel?: string;
  forwardLabel?: string;
  backIcon?: React.ReactNode;
  forwardIcon?: React.ReactNode;
  forwardDisabled?: boolean;
  backDisabled?: boolean;
  sx?: object;
}

const Footer: React.FC<FooterProps> = ({
  onBack,
  onForward,
  backLabel = "Back",
  forwardLabel = "Forward",
  backIcon = <ArrowBackIcon />,
  forwardIcon = <ArrowForwardIcon />,
  forwardDisabled = false,
  backDisabled = false,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        ...sx,
      }}
    >
      <Button
        variant="contained"
        startIcon={backIcon}
        onClick={onBack}
        disabled={backDisabled}
        sx={{ justifyContent: "flex-start" }}
      >
        {backLabel}
      </Button>
      <Button
        variant="contained"
        endIcon={forwardIcon}
        onClick={onForward}
        disabled={forwardDisabled}
        sx={{ justifyContent: "flex-end" }}
      >
        {forwardLabel}
      </Button>
    </Box>
  );
};

export default Footer;