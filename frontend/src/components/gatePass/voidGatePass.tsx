import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  Pagination,
  useTheme,
  Breadcrumbs,
  Link,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert as MuiAlert,
} from "@mui/material";
import {
  Undo as UndoIcon,
  NavigateNext as NavigateNextIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

interface GatePass {
  _id: string;
  date: string;
  party: string;
  orderNo: string;
  type: string;
  status?: string;
  is_void?: boolean;
  previous_status?: string;
}

const VoidGatePass: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [selectedGatePass, setSelectedGatePass] = useState<GatePass | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch voided gate passes
  const fetchVoidedGatePasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/voidedgatepass", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setGatePasses(result.data || []);
    } catch (error) {
      setGatePasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoidedGatePasses();
  }, []);

  // Unvoid handler
  const handleUnvoid = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:8000/unvoidgatepass/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSnackbarMessage("Gate pass unvoided successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchVoidedGatePasses();
    } catch (error) {
      setSnackbarMessage("Failed to unvoid gate pass.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  // Filtered and paginated data
  const filtered = gatePasses.filter((gp) => {
    const matchesSearch =
      gp.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gp.orderNo.toLowerCase().includes(searchTerm.toLowerCase());
    const rowDate = gp.date ? gp.date.slice(0, 10) : "";
    const from = fromDate ? fromDate.slice(0, 10) : "";
    const to = toDate ? toDate.slice(0, 10) : "";
    let matchesDate = true;
    if (from && to) {
      matchesDate = rowDate >= from && rowDate <= to;
    } else if (from) {
      matchesDate = rowDate >= from;
    } else if (to) {
      matchesDate = rowDate <= to;
    }
    return matchesSearch && matchesDate;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / entriesPerPage));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentGatePasses = filtered.slice(startIndex, endIndex);

  // Dialog handlers
  const handleRowClick = (gp: GatePass) => {
    setSelectedGatePass(gp);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedGatePass(null);
  };

  return (
    <Box
      sx={{
        width: "97vw",
        height: "100vh",
        padding: 0,
        marginLeft: "-18vw",
        marginRight: "0vw",
        overflow: "auto",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "unset",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Link color="inherit" href="/" sx={{ textDecoration: "none" }}>
              Home
            </Link>
            <Typography color="text.primary">Voided Gate Passes</Typography>
          </Breadcrumbs>

          {/* Filter Section */}
          <Paper sx={{ mx: 2, mt: 2, p: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="From Date"
                type="date"
                value={fromDate ? fromDate.slice(0, 10) : ""}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
                placeholder="yyyy-mm-dd"
              />
              <TextField
                label="To Date"
                type="date"
                value={toDate ? toDate.slice(0, 10) : ""}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
                placeholder="yyyy-mm-dd"
              />
              <TextField
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by party or order no..."
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "#888", mr: 1 }} />,
                }}
                sx={{ minWidth: 220 }}
              />
            </Box>
          </Paper>

          {/* Main Content */}
          <Paper
            sx={{ m: 2, flex: 1, display: "flex", flexDirection: "column" }}
          >
            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : isMobile ? (
              <Box>
                {currentGatePasses.map((gp) => (
                  <Card key={gp._id} sx={{ mb: 2, borderRadius: 2 }}>
                    <CardContent>
                      <Typography
                        variant="h6"
                        sx={{ color: "#f44336", fontWeight: 600 }}
                      >
                        {gp.orderNo}
                      </Typography>
                      <Typography variant="body2">Party: {gp.party}</Typography>
                      <Typography variant="body2">Date: {gp.date}</Typography>
                      <Typography variant="body2">Type: {gp.type}</Typography>
                      <Chip
                        label="VOIDED"
                        color="error"
                        size="small"
                        sx={{ my: 1 }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<UndoIcon />}
                        onClick={() => handleUnvoid(gp._id)}
                        sx={{ mt: 1 }}
                      >
                        Unvoid
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>GP ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Order No
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Party</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentGatePasses.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          sx={{ textAlign: "center", py: 4, color: "#666" }}
                        >
                          {searchTerm || fromDate || toDate
                            ? "No voided gate passes found matching your search"
                            : "No voided gate passes found"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentGatePasses.map((gp) => (
                        <TableRow
                          key={gp._id}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRowClick(gp)}
                        >
                          <TableCell>{gp.orderNo}</TableCell>
                          <TableCell>{gp.orderNo}</TableCell>
                          <TableCell>{gp.party}</TableCell>
                          <TableCell>{gp.date}</TableCell>
                          <TableCell>{gp.type}</TableCell>
                          <TableCell>
                            <Chip label="VOIDED" color="error" size="small" />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<UndoIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnvoid(gp._id);
                              }}
                            >
                              Unvoid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {/* Pagination */}
            {currentGatePasses.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Typography variant="body2" color="textSecondary">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filtered.length)} of {filtered.length}{" "}
                  entries
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_e, page) => setCurrentPage(page)}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                />
              </Box>
            )}
          </Paper>
        </Paper>
      </Box>
      {/* Snackbar for feedback */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "auto",
          zIndex: 1400,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          pointerEvents: "none",
          p: 2,
        }}
      >
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ pointerEvents: "auto" }}
        >
          <MuiAlert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
      {/* Dialog for gate pass details */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gate Pass Details</DialogTitle>
        <DialogContent>
          {selectedGatePass && (
            <Box>
              <Typography>
                <b>GP ID:</b> {selectedGatePass._id}
              </Typography>
              <Typography>
                <b>Order No:</b> {selectedGatePass.orderNo}
              </Typography>
              <Typography>
                <b>Party:</b> {selectedGatePass.party}
              </Typography>
              <Typography>
                <b>Date:</b> {selectedGatePass.date}
              </Typography>
              <Typography>
                <b>Type:</b> {selectedGatePass.type}
              </Typography>
              <Typography>
                <b>Status:</b>{" "}
                <Chip label="VOIDED" color="error" size="small" />
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoidGatePass;
