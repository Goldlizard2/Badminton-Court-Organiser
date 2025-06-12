"use client";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AuthResponse } from "@toolpad/core";
import { AppProvider } from "@toolpad/core/AppProvider";
import { SignInPage } from "@toolpad/core/SignInPage";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";

const providers = [{ id: "credentials", name: "Username and Password" }];

function CustomUsernameField() {
  return (
    <TextField
      id="input-with-icon-textfield"
      label="Username"
      name="username"
      type="username"
      size="small"
      required
      fullWidth
      variant="outlined"
    />
  );
}

function CustomPasswordField() {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <FormControl sx={{ my: 2 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        name="password"
        size="small"
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
              edge="end"
              size="small"
            >
              {showPassword ? (
                <VisibilityOff fontSize="inherit" />
              ) : (
                <Visibility fontSize="inherit" />
              )}
            </IconButton>
          </InputAdornment>
        }
        label="Password"
      />
    </FormControl>
  );
}

function CustomButton() {
  const { isLoading } = useAuth();

  return (
    <Button
      type="submit"
      variant="outlined"
      color="info"
      size="small"
      disableElevation
      fullWidth
      disabled={isLoading}
      sx={{ my: 2 }}
    >
      {isLoading ? <CircularProgress size={20} /> : "Log In"}
    </Button>
  );
}

function SignUpLink() {
  return (
    <div
      style={{
        display: "inline-flex",
        justifyContent: "space-between",
        marginTop: 8,
        width: "100%",
      }}
    >
      <Link href="/signup" variant="body2">
        Sign up
      </Link>
      <Link href="/" variant="body2">
        Forgot password?
      </Link>
    </div>
  );
}

function Title() {
  return <h2 style={{ marginBottom: 8 }}>Login</h2>;
}

function RememberMe() {
  return (
    <FormControlLabel
      control={
        <Checkbox
          name="tandc"
          value="true"
          color="primary"
          sx={{ padding: 0.5, "& .MuiSvgIcon-root": { fontSize: 20 } }}
        />
      }
      slotProps={{
        typography: {
          fontSize: 14,
        },
      }}
      color="textSecondary"
      label="Remember me"
    />
  );
}

export default function SlotsSignIn() {
  const theme = useTheme();
  const { login, error, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard"); // Create this route for authenticated users
    }
  }, [isAuthenticated, router]);

  const handleSignIn = async (
    provider: any,
    formData: FormData
  ): Promise<AuthResponse> => {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return {
        error: "Username and password are required",
        type: "CredentialsSignin",
      };
    }

    const success = await login(username, password);
    if (success) {
      router.push("/dashboard");
      return { type: "success" };
    } else {
      return {
        error: "Invalid credentials",
        type: "CredentialsSignin",
      };
    }
  };

  return (
    <AppProvider theme={theme}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <SignInPage
        signIn={handleSignIn}
        slots={{
          title: Title,
          emailField: CustomUsernameField,
          passwordField: CustomPasswordField,
          submitButton: CustomButton,
          signUpLink: SignUpLink,
          rememberMe: RememberMe,
        }}
        providers={providers}
      />
    </AppProvider>
  );
}
