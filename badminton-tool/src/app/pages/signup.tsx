"use client";

import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  Alert,
  Link,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AppProvider } from "@toolpad/core/AppProvider";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "../contexts/AuthContext";

function Title() {
  return <h2 style={{ marginBottom: 8 }}>Sign Up</h2>;
}

function CustomUsernameField({ value, onChange }: any) {
  return (
    <TextField
      label="Username"
      name="username"
      type="username"
      size="small"
      required
      fullWidth
      variant="outlined"
      value={value}
      onChange={onChange}
      sx={{ my: 1 }}
    />
  );
}

function CustomPasswordField({ value, onChange }: any) {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <FormControl sx={{ my: 1 }} fullWidth variant="outlined">
      <InputLabel size="small" htmlFor="outlined-adornment-password">
        Password
      </InputLabel>
      <OutlinedInput
        id="outlined-adornment-password"
        type={showPassword ? "text" : "password"}
        name="password"
        size="small"
        value={value}
        onChange={onChange}
        endAdornment={
          <Button
            onClick={handleClickShowPassword}
            size="small"
            tabIndex={-1}
            sx={{ minWidth: 0, px: 1 }}
          >
            {showPassword ? "Hide" : "Show"}
          </Button>
        }
        label="Password"
      />
    </FormControl>
  );
}

function LoginLink() {
  return (
    <div style={{ marginTop: 8 }}>
      <Link href="/" variant="body2">
        Already have an account? Log in
      </Link>
    </div>
  );
}

export default function SignUpPage() {
  const theme = useTheme();
  const router = useRouter();
  const { signup, isLoading, error } = useAuth?.() || {};

  const [form, setForm] = React.useState({
    username: "",
    password: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.username || !form.password) {
      setFormError("All fields are required.");
      return;
    }

    if (signup) {
      const success = await signup(form.username, form.password);
      if (success) {
        router.push("/");
      } else {
        setFormError("Sign up failed. Please try again.");
      }
    } else {
      setFormError("Signup not available.");
    }
  };

  return (
    <AppProvider theme={theme}>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 400,
          margin: "40px auto",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          background: "#fff",
        }}
      >
        <Title />
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <CustomUsernameField value={form.username} onChange={handleChange} />
        <CustomPasswordField value={form.password} onChange={handleChange} />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          sx={{ my: 2 }}
        >
          {isLoading ? <CircularProgress size={20} /> : "Sign Up"}
        </Button>
        <LoginLink />
      </form>
    </AppProvider>
  );
}
