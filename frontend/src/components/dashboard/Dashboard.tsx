import React from "react";
import { Box, Typography, Grid, Paper, Card, CardContent } from "@mui/material";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "User Registrations",
      data: [30, 45, 60, 40, 80, 70],
      fill: false,
      borderColor: "#1976d2",
      tension: 0.4,
    },
  ],
};

const pieData = {
  labels: ["Admin", "Editor", "Viewer"],
  datasets: [
    {
      label: "User Roles",
      data: [10, 20, 70],
      backgroundColor: ["#1976d2", "#42a5f5", "#90caf9"],
      borderWidth: 1,
    },
  ],
};

const Dashboard: React.FC = () => {
  // Example authentication check (replace with real logic)
  const isAuthenticated = Boolean(localStorage.getItem("token"));
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#f4f6fa", p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={3} color="#1976d2">
        Dashboard
      </Typography>
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#1976d2", color: "#fff" }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">100</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#42a5f5", color: "#fff" }}>
            <CardContent>
              <Typography variant="h6">Active Users</Typography>
              <Typography variant="h4">80</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#90caf9", color: "#1976d2" }}>
            <CardContent>
              <Typography variant="h6">Admins</Typography>
              <Typography variant="h4">10</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: "#fff",
              color: "#1976d2",
              border: "1px solid #1976d2",
            }}
          >
            <CardContent>
              <Typography variant="h6">Editors</Typography>
              <Typography variant="h4">20</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              User Registrations Over Time
            </Typography>
            <Line data={lineData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              User Role Distribution
            </Typography>
            <Pie data={pieData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
