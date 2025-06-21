import React, { useState, useEffect } from "react";
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
  FormControl,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Delete as VoidIcon } from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// Interface for Voided Purchase Voucher or Entry
interface VoidedPurchaseVoucher {
  id: string;
  _id?: string;
  prvId: string;
  dated: string;
  description: string;
  entries: number;
  status: "Voided" | "EntryVoided";
  voidedAt?: string;
  entryDetails?: any; // For voided entries
}

interface VoidPurchaseVoucherProps {
  vouchers?: VoidedPurchaseVoucher[];
  loading?: boolean;
}

const VoidPurchaseVoucher: React.FC<VoidPurchaseVoucherProps> = ({
  vouchers = [],
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredVouchers, setFilteredVouchers] = useState<
    VoidedPurchaseVoucher[]
  >([]);

  // State for API data
  const [apiVouchers, setApiVouchers] = useState<VoidedPurchaseVoucher[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // State for snackbar feedback
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Use API data if available, otherwise use props
  const displayVouchers = apiVouchers.length > 0 ? apiVouchers : vouchers;

  // Fetch voided purchase vouchers and entries from API
  const fetchVoidedVouchers = async () => {
    try {
      setApiLoading(true);
      // Fetch all purchase vouchers with entries
      const response = await fetch(
        "http://localhost:8000/vouchers/getvoucher?type=purchase&entries=true",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            dbprefix: localStorage.getItem("dbprefix") || "fast",
          },
        }
      );
      if (!response.ok) {
        setApiVouchers([]);
        return;
      }
      const result = await response.json();
      // Always use result.items for vouchers with entries
      const items = result.items || [];
      // Voided vouchers
      const voidedVouchers = items
        .filter((item: any) => item.is_void === true)
        .map((item: any) => ({
          id: item._id,
          prvId: item.voucher_id,
          dated: item.date,
          description:
            item.metadata?.description || `${item.metadata?.supplier || ""}`,
          entries: item.entries?.length || 0,
          status: "Voided",
          voidedAt: item.updated_at,
        }));
      // Voided entries (from non-voided vouchers)
      const entryVoids: VoidedPurchaseVoucher[] = [];
      items
        .filter((item: any) => !item.is_void && item.entries)
        .forEach((voucher: any) => {
          voucher.entries.forEach((entryDoc: any) => {
            if (Array.isArray(entryDoc.entries)) {
              entryDoc.entries.forEach((entry: any) => {
                if (entry.isVoid) {
                  entryVoids.push({
                    id: entry._id || entry.id,
                    prvId: voucher.voucher_id,
                    dated: entry.date || voucher.date,
                    description:
                      entry.description || entry.metadata?.itemName || "",
                    entries: 1,
                    status: "EntryVoided",
                    voidedAt: entry.updatedAt || entry.updated_at,
                    entryDetails: entry,
                  });
                }
              });
            }
          });
        });
      setApiVouchers([...voidedVouchers, ...entryVoids]);
    } catch (error) {
      setApiVouchers([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVoidedVouchers();
  }, []);

  // Filter vouchers based on search term
  useEffect(() => {
    let filtered = displayVouchers;

    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.prvId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1);
  }, [searchTerm, displayVouchers]);

  // Calculate pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVouchers.length / Math.max(1, entriesPerPage))
  );
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  // Handle entries per page change
  const handleEntriesPerPageChange = (event: SelectChangeEvent<number>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // Unvoid voucher or entry
  const handleUnvoid = async (voucher: VoidedPurchaseVoucher) => {
    try {
      setApiLoading(true);
      let response;
      if (voucher.status === "Voided") {
        response = await fetch(
          `http://localhost:8000/vouchers/${voucher.id}/void`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              dbprefix: localStorage.getItem("dbprefix") || "fast",
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify({ is_void: false }),
          }
        );
      } else if (voucher.status === "EntryVoided" && voucher.entryDetails) {
        response = await fetch(
          `http://localhost:8000/vouchers/${voucher.entryDetails.voucherId}/entries/${voucher.id}/void`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              dbprefix: localStorage.getItem("dbprefix") || "fast",
              "Cache-Control": "no-cache",
            },
            body: JSON.stringify({ isVoid: false }),
          }
        );
      }
      if (response && response.ok) {
        setSnackbarMessage("Unvoid successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        // Remove the unvoided voucher/entry from the current list dynamically
        setApiVouchers((prev) => prev.filter((v) => v.id !== voucher.id));
      } else {
        setSnackbarMessage("Unvoid failed!"); // Corrected message for failure
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Unvoid failed!"); // Corrected message for failure
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "100vw" },
        position: { xs: "static", md: "relative" },
        left: { xs: "auto", md: "50%" },
        right: { xs: "auto", md: "50%" },
        marginLeft: { xs: "0", md: "calc(-50vw + 20vw)" },
        marginRight: { xs: "0", md: "-50vw" },
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 6 },
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            mb: { xs: 2, md: 3 },
            fontWeight: "bold",
            backgroundColor: "#3da0bd",
            color: "white",
            py: { xs: 1.5, md: 2 },
            px: { xs: 1, md: 0 },
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, md: 2 },
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <VoidIcon fontSize="large" />
          Void Purchase Vouchers
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          width: "100%",
        }}
      >
        {/* Controls Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 2 },
          }}
        >
          {/* Show entries dropdown */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Typography variant="body2">Show</Typography>
            <FormControl size="small" sx={{ minWidth: 60 }}>
              <Select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2">entries</Typography>
          </Box>

          {/* Search box */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Typography variant="body2">Search:</Typography>
            <TextField
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
              placeholder="Search voided vouchers..."
            />
          </Box>
        </Box>

        {/* Mobile Card View */}
        {isMobile ? (
          <Box sx={{ mb: 3 }}>
            {loading || apiLoading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : currentVouchers.length === 0 ? (
              <Paper
                sx={{ p: 4, textAlign: "center", backgroundColor: "#f5f5f5" }}
              >
                <Typography color="textSecondary">
                  {searchTerm
                    ? "No voided vouchers found matching your search"
                    : "No voided vouchers found"}
                </Typography>
              </Paper>
            ) : (
              currentVouchers.map((voucher) => (
                <Card key={voucher.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#f44336",
                            fontWeight: "600",
                            fontSize: "1rem",
                          }}
                        >
                          {voucher.prvId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {voucher.dated}
                        </Typography>
                      </Box>
                      <Chip
                        label={
                          voucher.status === "Voided"
                            ? "VOIDED VOUCHER"
                            : "VOIDED ENTRY"
                        }
                        color={
                          voucher.status === "Voided" ? "error" : "warning"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Entries:</strong> {voucher.entries}
                    </Typography>
                    <Typography variant="body2">
                      {voucher.description}
                    </Typography>
                    {voucher.status === "Voided" ? (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={<VoidIcon />}
                          label="VOIDED VOUCHER"
                          color="error"
                          sx={{ fontWeight: 600, fontSize: "0.95rem", mb: 1 }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          icon={<VoidIcon style={{ color: "#ff9800" }} />}
                          label={`VOIDED ENTRY${
                            voucher.entryDetails?.description
                              ? ": " + voucher.entryDetails.description
                              : ""
                          }`}
                          color="warning"
                          sx={{ fontWeight: 600, fontSize: "0.95rem", mb: 1 }}
                        />
                      </Box>
                    )}
                    {(voucher.status === "Voided" ||
                      voucher.status === "EntryVoided") && (
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label="Unvoid"
                          color="success"
                          clickable
                          onClick={() => handleUnvoid(voucher)}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ mb: 3, borderRadius: 2 }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>PRV ID #</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dated</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Entries</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading || apiLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ textAlign: "center", py: 4, color: "#666" }}
                    >
                      {searchTerm
                        ? "No voided vouchers found matching your search"
                        : "No voided vouchers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell
                        sx={{
                          fontWeight: "600",
                          color:
                            voucher.status === "Voided" ? "#f44336" : "#ff9800",
                        }}
                      >
                        {voucher.prvId}
                      </TableCell>
                      <TableCell>{voucher.dated}</TableCell>
                      <TableCell>{voucher.description}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {voucher.entries}
                      </TableCell>
                      <TableCell>
                        {voucher.status === "Voided" ? (
                          <Chip
                            icon={<VoidIcon />}
                            label="VOIDED VOUCHER"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          />
                        ) : (
                          <Chip
                            icon={<VoidIcon style={{ color: "#ff9800" }} />}
                            label={`VOIDED ENTRY${
                              voucher.entryDetails?.description
                                ? ": " + voucher.entryDetails.description
                                : ""
                            }`}
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 600, fontSize: "0.95rem" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {(voucher.status === "Voided" ||
                          voucher.status === "EntryVoided") && (
                          <Chip
                            label="Unvoid"
                            color="success"
                            clickable
                            onClick={() => handleUnvoid(voucher)}
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        {currentVouchers.length > 0 && (
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
              {Math.min(endIndex, filteredVouchers.length)} of{" "}
              {filteredVouchers.length} entries
            </Typography>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        )}
      </Paper>
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VoidPurchaseVoucher;
