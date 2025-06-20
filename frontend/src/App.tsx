import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import Header from "./components/header/header";
import Layout from "./components/layout/Layout";
import AddCategory from "./components/inventory/addCategory";
import CreateStocks from "./components/inventory/addStock";
import StocksItemList from "./components/inventory/stocksItemList";
import StockSummary from "./components/inventory/stockSummary";
import NilStocks from "./components/inventory/nilStocks";
import PurchaseVoucher from "./components/voucher/purchaseVoucher";
import PurchaseReturnList from "./components/Return Voucher/purchaseReturnList";
import EntryPurchaseReturn from "./components/Return Voucher/entryPurchaseReturn";
import EntrySalesReturn from "./components/Return Voucher/entrySalesReturn";
import SalesVoucher from "./components/voucher/salesVoucher";
import SalesReturnList from "./components/Return Voucher/salesReturnList";
import ViewPurchaseVoucher from "./components/voucher/viewPurchaseVoucher";
import ViewSalesVoucher from "./components/voucher/viewSalesVoucher";
import ViewPurchaseReturn from "./components/Return Voucher/viewPurchaseReturn";
import VoidPurchaseVoucher from "./components/voucher/voidPurchaseVoucher";
import VoidSalesVoucher from "./components/voucher/voidSalesVoucher";
import VoidSalesReturn from "./components/Return Voucher/voidSalesReturn";
import VoidPurchaseReturn from "./components/Return Voucher/voidPurchaseReturn";
import Login from "./components/auth/Login";
import AddGatePass from "./components/gatePass/addGatePass";
import ViewGatePass from "./components/gatePass/viewGatePass";
import "./App.css";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#FFFFFF",
    },
    secondary: {
      main: "#ffffff",
    },
    background: {
      default: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  // Load initial section from localStorage, default to "dashboard"
  const [currentSection, setCurrentSection] = useState<string>(() => localStorage.getItem("currentSection") || "dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    console.log('🚀 App useEffect triggered');
    const token = localStorage.getItem("token");
    console.log('🔍 Auth Check - Token found:', !!token);
    console.log('🔍 Current state - isAuthenticated:', isAuthenticated, 'checkingAuth:', checkingAuth);

    if (!token) {
      console.log('❌ No token found - showing login');
      setCheckingAuth(false);
      // setIsAuthenticated(false);
      return;
    }

    console.log('🔍 Verifying token with backend...');
    // Verify token with backend
    fetch("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        console.log('🔍 Token verification response:', res.status);
        return res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`);
      })
      .then((data) => {
        console.log('✅ Token valid - user authenticated:', data);
        setIsAuthenticated(true);
        setCheckingAuth(false);
      })
      .catch((error) => {
        console.log('❌ Token verification failed:', error);
        console.log('🗑️ Removing invalid token');
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCheckingAuth(false);
      });
  }, []);

  // Persist currentSection to localStorage on change
  useEffect(() => {
    localStorage.setItem("currentSection", currentSection);
  }, [currentSection]);

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  // const handleLoginSuccess = () => {
  //   setIsAuthenticated(true);
  // };

  const renderContent = () => {
    switch (currentSection) {
      case "add-category":
        return <AddCategory />;
      case "dashboard":
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Dashboard - Coming Soon</h2>
          </div>
        );
      case "add-stock":
        return <CreateStocks />;
      case "stock-list":
        return <StocksItemList />;
      case "stock-summary":
        return <StockSummary />;
      case "nil-stocks":
        return <NilStocks />;
      case "purchase-voucher":
        return <PurchaseVoucher />;
      case "view-purchase-voucher":
        return <ViewPurchaseVoucher />;
      case "void-purchase-voucher":
        return <VoidPurchaseVoucher />;
      case "entry-purchase-return":
        return <EntryPurchaseReturn />;
      case "purchase-return-list":
        return <PurchaseReturnList />;
      case "view-purchase-return":
        return <ViewPurchaseReturn />;
      case "void-purchase-return":
        return <VoidPurchaseReturn />;
      case "entry-sales-return":
        return <EntrySalesReturn />;
      case "view-sales-return":
        return <SalesReturnList />;
      case "void-sales-return":
        return <VoidSalesReturn />;
      case "sales-voucher":
        return <SalesVoucher />;
      case "view-sales-voucher":
        return <ViewSalesVoucher />;
      case "void-sales-voucher":
        return <VoidSalesVoucher />;
      case "add-gate-pass":
        return <AddGatePass />;
      case "view-gate-pass":
        return <ViewGatePass />;
      case "reports":
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Reports - Coming Soon</h2>
          </div>
        );
      case "settings":
        return (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Settings - Coming Soon</h2>
          </div>
        );
      default:
        return <AddCategory />;
    }
  };

  console.log('🎨 Rendering App - checkingAuth:', checkingAuth, 'isAuthenticated:', isAuthenticated);

  if (checkingAuth) {
    console.log('🔄 Showing loading screen');
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div>Loading...</div>
        </Box>
      </ThemeProvider>
    );
  }

  // if (!isAuthenticated) {
  //   console.log('🔐 Showing login page');
  //   return (
  //     <ThemeProvider theme={theme}>
  //       <CssBaseline />
  //       <Login onLoginSuccess={handleLoginSuccess} />
  //     </ThemeProvider>
  //   );
  // }

  console.log('✅ Showing main app');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <Header onNavigate={handleNavigate} />

        {/* Main Content with Sidebar */}
        <Box sx={{ display: "flex", flex: 1 }}>
          <Layout currentSection={currentSection} onNavigate={handleNavigate}>
            {renderContent()}
          </Layout>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
