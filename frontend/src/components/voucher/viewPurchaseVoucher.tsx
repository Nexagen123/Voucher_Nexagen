import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Button,
  Pagination,
  Stack,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PurchaseVoucherDetail from "./purchaseVoucherDetail";
import EditPurchaseVoucher from "./editPurchaseVoucher";
import { getAllVouchers, getVoucherById } from "../../api/axios";

// TypeScript interface for Purchase Voucher Item (from metadata) - for future use
// interface PurchaseVoucherItem {
//   itemName: string;
//   quantity: number;
//   rate: number;
//   unit: string;
//   category: string;
//   gst: number;
//   total: number;
// }

// TypeScript interface for Purchase Voucher (matching backend voucher schema)
interface PurchaseVoucher {
  _id: string;
  voucher_id: string;
  date: string;
  type: string;
  created_by: string;
  updated_by: string;
  accounts: string[];
  is_void: boolean;
  is_posted: boolean;
  is_deleted: boolean;
  metadata: {
    supplier?: string;
    voucherType?: string;
    totalAmount?: number;
    itemsCount?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  entries?: any[]; // Will be populated when entries=true
}

const ViewPurchaseVoucher: React.FC = () => {
  // State for vouchers data
  const [vouchers, setVouchers] = useState<PurchaseVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered vouchers based on search
  const [filteredVouchers, setFilteredVouchers] = useState<PurchaseVoucher[]>(
    []
  );

  // Helper function to format description from metadata
  const formatDescription = (voucher: PurchaseVoucher): string => {
    // Check if it's a purchase voucher and has metadata
    if (voucher.type === "purchase" && voucher.metadata) {
      const { supplier, totalAmount, itemsCount } = voucher.metadata;
      if (supplier && totalAmount) {
        return `Purchase from ${supplier} - ${
          itemsCount || 1
        } item(s) - $${totalAmount.toFixed(2)}`;
      }
    }

    // Fallback to voucher type and ID
    return `${
      voucher.type.charAt(0).toUpperCase() + voucher.type.slice(1)
    } Voucher - ${voucher.voucher_id}`;
  };

  // State for view mode
  const [viewMode, setViewMode] = useState<"list" | "detail" | "edit">("list");
  const [selectedVoucher, setSelectedVoucher] =
    useState<PurchaseVoucher | null>(null);

  // API call to fetch vouchers using the axios function
  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Set dbprefix if not already set
      if (!localStorage.getItem("dbprefix")) {
        localStorage.setItem("dbprefix", "fast");
      }

      // Use the axios function with query parameters for purchase vouchers with entries
      const response = await getAllVouchers({
        type: "purchase",
        entries: true,
      });
      console.log("API Response:", response.data);

      // The API returns { items: [...], totalCount, page, limit, totalPages }
      const items = response.data.items || [];

      // Filter for purchase vouchers and exclude voided/deleted ones
      const purchaseVouchers = items.filter(
        (voucher: PurchaseVoucher) =>
          voucher.type === "purchase" && !voucher.is_void && !voucher.is_deleted
      );

      setVouchers(purchaseVouchers);
      setFilteredVouchers(purchaseVouchers);
    } catch (err: any) {
      setError(err.message || "Failed to fetch vouchers");
      console.error("Error fetching vouchers:", err);

      // Show empty state
      setVouchers([]);
      setFilteredVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect to fetch data on component mount and when page/limit changes
  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers, currentPage, entriesPerPage]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVouchers(vouchers);
    } else {
      const filtered = vouchers.filter((voucher) => {
        const description = formatDescription(voucher);
        const dateStr = new Date(voucher.date).toLocaleDateString();
        return (
          voucher.voucher_id
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          voucher._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          voucher.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (voucher.metadata?.supplier || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      });
      setFilteredVouchers(filtered);
    }
  }, [searchQuery, vouchers]);

  // Handle actions
  const handleView = async (voucherId: string) => {
    try {
      // First try to find the voucher in the current list
      let voucher = vouchers.find(
        (v) => v._id === voucherId || v.voucher_id === voucherId
      );

      if (voucher) {
        // If the voucher doesn't have entries, fetch it individually with entries
        if (!voucher.entries || voucher.entries.length === 0) {
          console.log("Fetching individual voucher with entries...");
          const response = await getVoucherById(voucherId, { entries: true });
          console.log("Individual voucher response:", response.data);

          if (response.data.voucher) {
            voucher = {
              ...response.data.voucher,
              entries: response.data.entries,
            };
          }
        }

        console.log("Selected voucher with entries:", voucher);
        setSelectedVoucher(voucher || null);
        setViewMode("detail");
      }
    } catch (error) {
      console.error("Error fetching voucher details:", error);
      // Fallback to the original voucher without entries
      const voucher = vouchers.find(
        (v) => v._id === voucherId || v.voucher_id === voucherId
      );
      if (voucher) {
        setSelectedVoucher(voucher);
        setViewMode("detail");
      }
    }
  };

  // Handle back from detail view
  const handleBack = () => {
    setViewMode("list");
    setSelectedVoucher(null);
  };

  // Handle edit voucher
  const handleEdit = async (voucher: PurchaseVoucher) => {
    try {
      // Always fetch the latest voucher details with entries from backend
      const response = await getVoucherById(voucher._id, { entries: true });
      let fetchedVoucher = response.data.voucher;
      if (fetchedVoucher) {
        fetchedVoucher = {
          ...fetchedVoucher,
          entries: response.data.entries || fetchedVoucher.entries || [],
        };
        setSelectedVoucher(fetchedVoucher);
        setViewMode("edit");
      } else {
        // fallback to original voucher if fetch fails
        setSelectedVoucher(voucher);
        setViewMode("edit");
      }
    } catch (error) {
      console.error("Error fetching voucher for edit:", error);
      setSelectedVoucher(voucher);
      setViewMode("edit");
    }
  };

  // Handle void voucher
  const handleVoid = (voucher: PurchaseVoucher) => {
    // Remove from local state for instant UI update
    setVouchers((prev) => prev.filter((v) => v._id !== voucher._id));
    setFilteredVouchers((prev) => prev.filter((v) => v._id !== voucher._id));
    handleBack();
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredVouchers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Show detail view if in detail mode
  if (viewMode === "detail" && selectedVoucher) {
    return (
      <PurchaseVoucherDetail
        voucher={selectedVoucher}
        onBack={handleBack}
        onEdit={handleEdit}
        onVoid={handleVoid}
      />
    );
  }

  // Show edit view if in edit mode
  if (viewMode === "edit" && selectedVoucher) {
    // Map entries to items if needed for the edit form
    const items = Array.isArray(selectedVoucher.entries)
      ? selectedVoucher.entries.flatMap((entryDoc: any) =>
          Array.isArray(entryDoc.entries) ? entryDoc.entries : []
        )
      : [];
    return (
      <EditPurchaseVoucher
        voucher={{
          ...selectedVoucher,
          id: (selectedVoucher as any).id || selectedVoucher._id,
          prvId: (selectedVoucher as any).prvId || selectedVoucher.voucher_id,
          dated: (selectedVoucher as any).dated || selectedVoucher.date,
          entries: selectedVoucher.entries ? selectedVoucher.entries.length : 0,
          items, // Pass items array for editing
        }}
        onBack={() => setViewMode("detail")}
        onSave={(updatedVoucher) => {
          // Convert to the main PurchaseVoucher type for the list
          const mergedVoucher = {
            ...selectedVoucher,
            ...updatedVoucher,
            voucher_id:
              selectedVoucher?.voucher_id ||
              (updatedVoucher as any).voucher_id ||
              (updatedVoucher as any).prvId,
            date: selectedVoucher?.date || updatedVoucher.dated,
            type: selectedVoucher?.type || "purchase",
            created_by: selectedVoucher?.created_by || "",
            updated_by: selectedVoucher?.updated_by || "",
            accounts: selectedVoucher?.accounts || [],
            is_void: false,
            is_posted: true,
            is_deleted: false,
            metadata: {
              ...selectedVoucher?.metadata,
              supplier: updatedVoucher.supplier,
              totalAmount: updatedVoucher.items?.reduce(
                (sum, i) => sum + (i.total || 0),
                0
              ),
              itemsCount: updatedVoucher.items?.length || 0,
            },
            created_at: selectedVoucher?.created_at || "",
            updated_at: new Date().toISOString(),
            entries: selectedVoucher?.entries || [],
            id: (selectedVoucher as any).id || selectedVoucher._id,
            prvId: (selectedVoucher as any).prvId || selectedVoucher.voucher_id,
            dated: (selectedVoucher as any).dated || selectedVoucher.date,
          };
          setVouchers((prev) =>
            prev.map((v) => (v._id === mergedVoucher._id ? mergedVoucher : v))
          );
          setSelectedVoucher(mergedVoucher);
          setViewMode("detail");
          fetchVouchers();
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "100vw" },
        position: { xs: "static", md: "relative" },
        left: { xs: "auto", md: "50%" },
        right: { xs: "auto", md: "50%" },
        marginLeft: { xs: "0", md: "calc(-50vw + 20vw)" },
        marginRight: { xs: "0", md: "-50vw" },
        padding: { xs: "16px", md: "24px" },
        backgroundColor: "#FFFFFF",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {/* Header Card */}
      <Box
        sx={{
          backgroundColor: "#3da0bd",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid #3da0bd",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#FFFFFF",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Purchase Vouchers List
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Controls Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Left side - Show Entries and Refresh */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography variant="body2">Show</Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  sx={{ backgroundColor: "#f8f9ff" }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2">entries</Typography>
            </Box>

            {/* Refresh Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchVouchers}
              disabled={loading}
              sx={{
                borderColor: "#3da0bd",
                color: "#3da0bd",
                "&:hover": {
                  borderColor: "#3da0bd",
                  backgroundColor: "#f8f9ff",
                },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Right side - Search Box */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Typography variant="body2">Search:</Typography>
            <TextField
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vouchers..."
              sx={{
                backgroundColor: "#f8f9ff",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
              slotProps={{
                input: {
                  endAdornment: <SearchIcon sx={{ color: "#666" }} />,
                },
              }}
            />
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ marginBottom: "16px" }}>
            <Typography color="error" variant="body2">
              Error loading vouchers: {error}. Please check if the backend
              server is running.
            </Typography>
          </Box>
        )}

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e0e0e0",
          }}
        >
          <Table>
            {/* Table Header */}
            <TableHead>
              <TableRow sx={{ backgroundColor: "#3da0bd" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  PV ID #
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Entries
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{ textAlign: "center", padding: "40px" }}
                  >
                    <Typography>Loading vouchers...</Typography>
                  </TableCell>
                </TableRow>
              ) : currentVouchers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{ textAlign: "center", padding: "40px" }}
                  >
                    <Typography>No vouchers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentVouchers.map((voucher, index) => (
                  <TableRow
                    key={voucher._id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                      "&:hover": { backgroundColor: "#f0f0f0" },
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold", color: "#333" }}>
                      {voucher.voucher_id}
                    </TableCell>
                    <TableCell>
                      {new Date(voucher.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ maxWidth: "400px" }}>
                      {formatDescription(voucher)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {(() => {
                        // Count the actual number of transaction items/rows
                        let itemCount = 0;
                        if (voucher.entries && voucher.entries.length > 0) {
                          voucher.entries.forEach((entryDoc: any) => {
                            if (
                              entryDoc.entries &&
                              Array.isArray(entryDoc.entries)
                            ) {
                              itemCount += entryDoc.entries.length;
                            }
                          });
                        }
                        return itemCount || voucher.metadata?.itemsCount || 0;
                      })()}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleView(voucher._id)}
                          sx={{
                            backgroundColor: "#2196F3",
                            "&:hover": { backgroundColor: "#1976D2" },
                            textTransform: "none",
                          }}
                        >
                          View
                        </Button>
                        {/* Print button removed as per requirements */}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Showing entries info */}
          <Typography variant="body2" sx={{ color: "#666" }}>
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredVouchers.length)} of{" "}
            {filteredVouchers.length} entries
          </Typography>

          {/* Pagination */}
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              shape="rounded"
              sx={{
                "& .MuiPaginationItem-root": {
                  backgroundColor: "#f8f9ff",
                  "&:hover": { backgroundColor: "#E3F2FD" },
                  "&.Mui-selected": {
                    backgroundColor: "#3da0bd",
                    color: "#FFFFFF",
                  },
                },
              }}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewPurchaseVoucher;
