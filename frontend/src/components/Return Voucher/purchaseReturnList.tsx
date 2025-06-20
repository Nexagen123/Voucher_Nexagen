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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Define interfaces for type safety
interface PurchaseReturnVoucher {
  id: string;
  _id?: string;
  prvId: string;
  dated: string;
  description: string;
  entries: number;
  supplierName?: string;
  totalAmount?: number;
  status?: "Pending" | "Approved" | "Rejected" | "Submitted";
}

interface PurchaseReturnListProps {
  vouchers?: PurchaseReturnVoucher[];
  onEdit?: (voucher: PurchaseReturnVoucher) => void;
  onDelete?: (id: string) => void;
  onView?: (voucher: PurchaseReturnVoucher) => void;
  loading?: boolean;
}

const PurchaseReturnList: React.FC<PurchaseReturnListProps> = ({
  vouchers = [],
  onEdit,
  onDelete,
  onView,
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredVouchers, setFilteredVouchers] = useState<
    PurchaseReturnVoucher[]
  >([]);

  // State for API data
  const [apiVouchers, setApiVouchers] = useState<PurchaseReturnVoucher[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // API call to fetch returns
  const fetchReturns = async () => {
    try {
      setApiLoading(true);
      setApiError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/purchase-returns?page=1&limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      const data = result.data || {};
      const items = data.items || [];

      // Filter out voided returns for the main view
      const activeReturns = items.filter((item: any) => item.status !== 'Voided');

      // Map to the expected format
      const mappedReturns = activeReturns.map((item: any) => ({
        id: item.id || item._id,
        _id: item._id,
        prvId: item.prvId || item.prv_id || item.PRV_ID || item.prvid || item.purchaseReturnId || item.PRV_NO || item.PR_NO || item.id || '', // add PR_NO
        dated: item.dated || item.date || item.datedAt || item.createdAt || item.return_date || '', // add return_date
        description: item.description,
        entries: item.numberOfEntries || item.entries || 0,
        status: item.status || 'Submitted'
      }));

      setApiVouchers(mappedReturns);
    } catch (err: any) {
      setApiError(err.message || 'Failed to fetch returns');
      console.error('Error fetching returns:', err);
      setApiVouchers([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReturns();
  }, []);

  // Use API data if available, otherwise use props
  const displayVouchers = apiVouchers.length > 0 ? apiVouchers : vouchers;

  // Filter vouchers based on search term
  useEffect(() => {
    let filtered = displayVouchers;

    if (searchTerm) {
      filtered = filtered.filter(
        (voucher) =>
          voucher.prvId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          voucher.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
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

  // Action handlers
  const handleEdit = (voucher: PurchaseReturnVoucher) => {
    if (onEdit) {
      onEdit(voucher);
    }
  };

  const handleDelete = async (id: string) => {
    if (onDelete) {
      onDelete(id);
      return;
    }

    // Handle API delete
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/purchase-returns/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Remove from local state
        setApiVouchers(prev => prev.filter(voucher => voucher.id !== id && voucher._id !== id));
      } else {
        throw new Error(result.message || 'Failed to delete purchase return');
      }
    } catch (error) {
      console.error('Error deleting purchase return:', error);
      alert('Failed to delete purchase return. Please try again.');
    }
  };

  const handleView = (voucher: PurchaseReturnVoucher) => {
    if (onView) {
      onView(voucher);
    }
  };

  const handlePrint = (_voucher: PurchaseReturnVoucher) => {
    // TODO: Implement print functionality
    window.print();
  };

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
            color: "black",
            backgroundColor: "#3da0bd",
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
          P Return Vouchers List
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
          {/* Show entries dropdown and refresh */}
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

            {/* Refresh Button */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchReturns}
              disabled={apiLoading}
              sx={{
                borderColor: 'white',
                color: '#333',
                '&:hover': {
                  borderColor: '#B8C5F2',
                  backgroundColor: '#f8f9ff',
                },
              }}
            >
              Refresh
            </Button>
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
              placeholder="Search vouchers..."
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
                          {voucher.prvId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                          {voucher.dated ? new Date(voucher.dated).toLocaleDateString('en-GB') : 'Invalid Date'}
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
                      <Tooltip title="Print Voucher">
                        <IconButton size="small" color="success" onClick={() => handlePrint(voucher)}>
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Voucher">
                        <IconButton size="small" color="secondary" onClick={() => handleEdit(voucher)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Voucher">
                        <IconButton size="small" color="error" onClick={() => handleDelete(voucher.id)}>
                          <DeleteIcon fontSize="small" />
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
                  PRV ID #
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
                      {voucher.prvId}
                    </TableCell>
                    <TableCell sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.875rem" }
                    }}>
                      {voucher.dated ? new Date(voucher.dated).toLocaleDateString('en-GB') : 'Invalid Date'}
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
                        justifyContent: "center",
                        flexWrap: "wrap"
                      }}>
                        <Button
                          variant="contained"
                          size="small"
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
                        <Tooltip title="Edit Voucher">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => handleEdit(voucher)}
                            sx={{
                              padding: { xs: "4px", md: "8px" }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Voucher">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(voucher.id)}
                            sx={{
                              padding: { xs: "4px", md: "8px" }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                  borderColor: "white",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  minWidth: { xs: "28px", sm: "32px" },
                  height: { xs: "28px", sm: "32px" },
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "white",
                    color: "#333",
                    "&:hover": {
                      backgroundColor: "#B8C5F2",
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

export default PurchaseReturnList;
