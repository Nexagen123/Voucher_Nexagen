import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Fab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "./Sidebar";

// Styled components
const Main = styled("main")(() => ({
  flexGrow: 1,
  padding: 0,
  margin: 0,
  width: "100%",
  marginLeft: 0, // Always keep content at left edge
  position: "relative",
  zIndex: 1,
}));

const FloatingMenuButton = styled(Fab)(() => ({
  position: "fixed",
  top: "20px",
  left: "20px",
  backgroundColor: "#FFFFFF",
  color: "#333333",
  zIndex: 1300,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  "&:hover": {
    backgroundColor: "#F5F5F5",
  },
}));

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onNavigate: (section: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentSection,
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };



  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <CssBaseline />

      {/* Floating Menu Button - Only visible when sidebar is closed */}
      {!sidebarOpen && (
        <FloatingMenuButton onClick={handleDrawerToggle} aria-label="open menu">
          <MenuIcon />
        </FloatingMenuButton>
      )}

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={onNavigate}
        currentSection={currentSection}
      />

      {/* Main Content Area */}
      <Main>
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            minHeight: "calc(100vh - 64px)",
            borderRadius: "0",
            padding: 0,
            margin: 0,
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Layout;
