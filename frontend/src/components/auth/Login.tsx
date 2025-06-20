import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("admin@voucher.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || data.message || "Login failed");
      localStorage.setItem("token", data.token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      minWidth="100vw"
      sx={{
        background: "#1976d2",
        overflow: "hidden", // Prevent scrollbars
        position: "fixed", // Make the background and content fixed
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          minWidth: 350,
          borderRadius: 4,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
          background: "rgba(255,255,255,0.95)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mb: 2,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.1)",
          }}
        >
          <img src="/vite.svg" alt="Logo" style={{ width: 36, height: 36 }} />
        </Box>
        <Typography
          variant="h5"
          mb={1}
          align="center"
          fontWeight={700}
          color="#2d3a4a"
        >
          Welcome Back
        </Typography>
        <Typography variant="body2" mb={2} align="center" color="#6b7280">
          Sign in to your admin account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={handleInputChange(setEmail)}
            fullWidth
            margin="normal"
            required
            autoFocus
            sx={{
              background: "#f8f9ff",
              borderRadius: 2,
            }}
            disabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={handleInputChange(setPassword)}
            fullWidth
            margin="normal"
            required
            sx={{
              background: "#f8f9ff",
              borderRadius: 2,
            }}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              py: 1.2,
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 2,
              background: "linear-gradient(135deg, #B8C5F2 0%, white 100%)",
              color: "#2d3a4a",
              boxShadow: "0 2px 8px 0 rgba(31, 38, 135, 0.08)",
              "&:hover": {
                background: "linear-gradient(135deg, white 0%, #B8C5F2 100%)",
              },
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
