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
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Button,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import SalesReturnDetail from "./salesReturnDetail";
import EditSalesReturn from "./editSalesReturn";

// Define interfaces for type safety
interface SalesReturnVoucher {
  id: string;
  _id?: string;
  srvId: string;
  dated: string;
  description: string;
  entries: number;
  customerName?: string;
  totalAmount?: number;
  status?: "Pending" | "Approved" | "Rejected" | "Submitted";
}

interface SalesReturnListProps {
  vouchers?: SalesReturnVoucher[];
  onView?: (voucher: SalesReturnVoucher) => void;
  onPrint?: (voucher: SalesReturnVoucher) => void;
  loading?: boolean;
}

const SalesReturnList: React.FC<SalesReturnListProps> = ({
  vouchers = [],
  onView,
  onPrint,
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredVouchers, setFilteredVouchers] = useState<SalesReturnVoucher[]>([]);

  // State for API data
  const [apiVouchers, setApiVouchers] = useState<SalesReturnVoucher[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Add state for selected voucher and view mode
  const [selectedVoucher, setSelectedVoucher] = useState<SalesReturnVoucher | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [editMode, setEditMode] = useState(false);

  // Conversion helpers
  function toSalesReturn(voucher: SalesReturnVoucher): any {
    return {
      id: voucher.id,
      _id: voucher._id,
      date: voucher.dated, // map 'dated' to 'date'
      description: voucher.description,
      numberOfEntries: voucher.entries, // map 'entries' to 'numberOfEntries'
      status: voucher.status,
      createdAt: undefined,
      updatedAt: undefined,
    };
  }
  function toSalesReturnVoucher(returnItem: any): SalesReturnVoucher {
    return {
      id: returnItem.id,
      _id: returnItem._id,
      srvId: returnItem.id,
      dated: returnItem.date,
      description: returnItem.description,
      entries: returnItem.numberOfEntries,
      status: returnItem.status,
      customerName: '',
      totalAmount: undefined,
    };
  }

  // Fetch sales returns from API
  const fetchSalesReturns = async () => {
    try {
      setApiLoading(true);
      setApiError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setApiError('No authentication token found. Please log in again.');
        setApiLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/sales-returns?page=1&limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        setApiError(`HTTP error! status: ${response.status}`);
        setApiVouchers([]);
        setApiLoading(false);
        return;
      }

      const result = await response.json();
      const items = result.data?.items || result.data || [];

      // Filter out voided returns for the main view
      const activeReturns = items.filter((item: any) => item.status !== 'Voided');

      // Robust mapping
      const mappedReturns: SalesReturnVoucher[] = activeReturns.map((item: any) => ({
        id: item._id || item.id || '',
        _id: item._id || item.id,
        srvId: item.srvId || item._id || item.id || '',
        dated: item.dated || item.date || '',
        description: item.description || '',
        entries: Array.isArray(item.entries) ? item.entries.length : (item.entries ?? item.numberOfEntries ?? 0),
        customerName: item.customerName || '',
        totalAmount: item.totalAmount ?? undefined,
        status: item.status || 'Submitted',
      }));

      setApiVouchers(mappedReturns);
    } catch (error: any) {
      setApiError(error.message || 'Failed to fetch returns');
      setApiVouchers([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSalesReturns();
  }, []);

  // Use API data if available, otherwise use props
  const displayVouchers = apiVouchers.length > 0 ? apiVouchers : vouchers;

  // Filter vouchers based on search term
  useEffect(() => {
    let filtered = displayVouchers;

    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.srvId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, displayVouchers]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / Math.max(1, entriesPerPage)));
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
  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Handle entries per page change
  const handleEntriesPerPageChange = (event: SelectChangeEvent<number>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  // Action handlers
  const handleView = (voucher: SalesReturnVoucher) => {
    setSelectedVoucher(voucher);
    setViewMode('detail');
    if (onView) {
      onView(voucher);
    }
  };

  const handlePrint = (voucher: SalesReturnVoucher) => {
    if (onPrint) {
      onPrint(voucher);
    }
  };

  const handleEdit = (voucher: SalesReturnVoucher) => {
    setSelectedVoucher(voucher);
    setEditMode(true);
  };

  const handleEditSave = (updatedVoucher: SalesReturnVoucher) => {
    // Update the voucher in the list
    setApiVouchers((prev) => prev.map((v) => v.id === updatedVoucher.id ? updatedVoucher : v));
    setSelectedVoucher(updatedVoucher);
    setEditMode(false);
    setViewMode('detail');
  };

  const handleEditBack = () => {
    setEditMode(false);
    setViewMode('detail');
  };

  // Handler for going back to list
  const handleBack = () => {
    setSelectedVoucher(null);
    setViewMode('list');
  };

  // Handler for void (could be expanded to update list)
  const handleVoid = (voucher: SalesReturnVoucher) => {
    // Implement void logic or refresh list here
    // For now, just log
    console.log('Void voucher:', voucher);
    handleBack(); // Go back to list after void
  };

  // Show edit mode if enabled
  if (editMode && selectedVoucher) {
    return (
      <EditSalesReturn
        returnItem={toSalesReturn(selectedVoucher)}
        onBack={handleEditBack}
        onSave={(updated) => handleEditSave(toSalesReturnVoucher(updated))}
      />
    );
  }

  // Show detail page if in detail mode
  if (viewMode === 'detail' && selectedVoucher) {
    return (
      <SalesReturnDetail
        returnItem={toSalesReturn(selectedVoucher)}
        onBack={handleBack}
        onEdit={(item) => handleEdit(toSalesReturnVoucher(item))}
        onVoid={(item) => handleVoid(toSalesReturnVoucher(item))}
      />
    );
  }

  return (
    <Box sx={{
      width: { xs: '100%', md: '100vw' },
      position: { xs: 'static', md: 'relative' },
      left: { xs: 'auto', md: '50%' },
      right: { xs: 'auto', md: '50%' },
      marginLeft: { xs: '0', md: 'calc(-50vw + 20vw)' },
      marginRight: { xs: '0', md: '-50vw' },
      py: { xs: 2, md: 4 },
      px: { xs: 2, md: 6 },
      minHeight: '100vh',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 1, md: 2 },
        mx: { xs: 0, md: 0 },
        width: '100%'
      }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          sx={{
            mb: { xs: 2, md: 3 },
            fontWeight: "bold",
            color: "white",
            backgroundColor: "#3da0bd",
            py: { xs: 1.5, md: 2 },
            px: { xs: 1, md: 0 },
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 1, md: 2 },
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          Sales Return List
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 1, md: 2 },
        mx: { xs: 0, md: 0 },
        width: '100%'
      }}>
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
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-start" }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
              Show
            </Typography>
            <FormControl size="small" sx={{ minWidth: { xs: 80, sm: 60 } }}>
              <Select
                value={entriesPerPage}
                onChange={handleEntriesPerPageChange}
                sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
              entries
            </Typography>
          </Box>

          {/* Search box */}
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "center", sm: "flex-end" }
          }}>
            <Typography variant="body2" sx={{ fontSize: { xs: "0.875rem", sm: "0.875rem" } }}>
              Search:
            </Typography>
            <TextField
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: { xs: 180, sm: 200 },
                "& .MuiOutlinedInput-root": {
                  fontSize: { xs: "0.875rem", sm: "0.875rem" }
                }
              }}
              variant="outlined"
              placeholder="Search sales returns..."
            />
          </Box>
        </Box>

        {/* Mobile Card View */}
        {isMobile ? (
          <Box sx={{ mb: 3 }}>
            {(loading || apiLoading) ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : currentVouchers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f5f5f5" }}>
                <Typography color="textSecondary">No data available</Typography>
              </Paper>
            ) : (
              currentVouchers.map((voucher) => (
                <Card key={voucher.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "600", fontSize: "1rem" }}>
                          {voucher.srvId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                          {voucher.dated}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${voucher.entries} entries`}
                        size="small"
                        sx={{ backgroundColor: "white", color: "#333" }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2, fontSize: "0.875rem" }}>
                      {voucher.description}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary" onClick={() => handleView(voucher)}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Sales Return">
                        <IconButton size="small" color="secondary" onClick={() => handlePrint(voucher)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiTableCell-root": {
                padding: "16px",
                fontSize: "0.875rem",
              },
              "& .MuiTableCell-head": {
                fontSize: "0.875rem",
                fontWeight: "bold",
                backgroundColor: "#f5f5f5",
              },
            }}
          >
          <Table sx={{ minWidth: { xs: 600, md: "auto" } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{
                  fontWeight: "bold",
                  minWidth: { xs: "80px", md: "auto" }
                }}>
                  SRV ID #
                </TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  minWidth: { xs: "90px", md: "auto" }
                }}>
                  Dated
                </TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  minWidth: { xs: "150px", md: "auto" }
                }}>
                  Description
                </TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  minWidth: { xs: "70px", md: "auto" }
                }}>
                  Entries
                </TableCell>
                <TableCell sx={{
                  fontWeight: "bold",
                  minWidth: { xs: "100px", md: "auto" }
                }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(loading || apiLoading) ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      textAlign: "center",
                      py: 4,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                    }}
                  >
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    Loading...
                  </TableCell>
                </TableRow>
              ) : currentVouchers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{
                      textAlign: "center",
                      py: 4,
                      backgroundColor: "#f5f5f5",
                      color: "#666",
                    }}
                  >
                    No data available in table
                  </TableCell>
                </TableRow>
              ) : (
                currentVouchers.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
                      fontWeight: "600",
                      color: "#1976d2"
                    }}>
                      {voucher.srvId}
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" }
                    }}>
                      {voucher.dated}
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
                      maxWidth: { xs: "150px", md: "none" },
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      <Tooltip title={voucher.description} arrow>
                        <span>{voucher.description}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" },
                      textAlign: "center"
                    }}>
                      {voucher.entries}
                    </TableCell>
                    <TableCell>
                      <Box sx={{
                        display: "flex",
                        gap: { xs: 0.5, md: 1 },
                        justifyContent: "center"
                      }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleView(voucher)}
                          sx={{
                            backgroundColor: '#2196F3',
                            '&:hover': { backgroundColor: '#1976D2' },
                            textTransform: 'none',
                            minWidth: '70px',
                            color: 'white'
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrint(voucher)}
                          sx={{
                            backgroundColor: '#4CAF50',
                            '&:hover': { backgroundColor: '#388E3C' },
                            textTransform: 'none',
                            minWidth: '70px',
                            color: 'white'
                          }}
                        >
                          Print
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 1 },
          }}
        >
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              textAlign: { xs: "center", sm: "left" }
            }}
          >
            Showing {filteredVouchers.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredVouchers.length)} of{" "}
            {filteredVouchers.length} entries
          </Typography>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            flexWrap: "wrap",
            justifyContent: "center"
          }}>
            <Button
              variant="outlined"
              size="small"
              disabled={currentPage === 1 || filteredVouchers.length === 0}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              sx={{
                borderColor: "white",
                color: "#333",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                minWidth: { xs: "70px", sm: "auto" },
                "&:hover": {
                  borderColor: "#B8C5F2",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Prev
            </Button>

            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              size="small"
              showFirstButton={false}
              showLastButton={false}
              siblingCount={0}
              boundaryCount={1}
              disabled={filteredVouchers.length === 0}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#333",
                  borderColor: "#E0E0E0",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: { xs: "28px", sm: "32px" },
                  height: { xs: "28px", sm: "32px" },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#3da0bd",
                    color: "#FFFFFF",
                    "&:hover": {
                      backgroundColor: "#3da0bd",
                    },
                  },
                },
              }}
            />

            <Button
              variant="outlined"
              size="small"
              disabled={
                currentPage === totalPages || filteredVouchers.length === 0
              }
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              sx={{
                borderColor: "white",
                color: "#333",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                minWidth: { xs: "70px", sm: "auto" },
                "&:hover": {
                  borderColor: "#B8C5F2",
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalesReturnList;
