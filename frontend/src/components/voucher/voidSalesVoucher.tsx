import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Delete as VoidIcon,
} from '@mui/icons-material';

// Interface for Voided Sales Voucher
interface VoidedSalesVoucher {
  id: string;
  _id?: string;
  svId: string;
  dated: string;
  description: string;
  entries: number;
  status: 'Voided';
  voidedAt?: string;
}

interface VoidSalesVoucherProps {
  vouchers?: VoidedSalesVoucher[];
  loading?: boolean;
}

const VoidSalesVoucher: React.FC<VoidSalesVoucherProps> = ({
  vouchers = [],
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredVouchers, setFilteredVouchers] = useState<VoidedSalesVoucher[]>([]);
  
  // State for API data (placeholder for future implementation)
  const [apiVouchers, setApiVouchers] = useState<VoidedSalesVoucher[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Use API data if available, otherwise use props
  const displayVouchers = apiVouchers.length > 0 ? apiVouchers : vouchers;

  // Fetch voided sales vouchers from API
  const fetchVoidedVouchers = async () => {
    try {
      setApiLoading(true);

      console.log('Fetching voided sales vouchers...');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vouchers/sales', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        console.log('Sales vouchers endpoint not available');
        setApiVouchers([]);
        return;
      }

      const result = await response.json();
      console.log('Sales vouchers API response:', result);

      if (result.success) {
        const items = result.data?.vouchers || result.data?.items || result.data || [];
        console.log('All sales vouchers:', items);
        // Filter for voided vouchers only
        const voidedItems = items.filter((item: any) => {
          console.log('Checking voucher:', item.id, 'Status:', item.status);
          return item.status === 'Voided';
        });
        console.log('Voided sales vouchers found:', voidedItems);

        // Format for display
        const formattedVouchers = voidedItems.map((item: any) => ({
          id: item.id,
          svId: item.id,
          dated: item.date || item.dated,
          description: item.description || `${item.entries} entries`,
          entries: item.entries,
          status: item.status
        }));

        setApiVouchers(formattedVouchers);
      }

    } catch (error) {
      console.error('Error fetching voided sales vouchers:', error);
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
          voucher.svId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
    setCurrentPage(1);
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
      backgroundColor: '#FFFFFF'
    }}>
      {/* Header */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 1, md: 2 },
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
            color: "white",
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
          <VoidIcon fontSize="large" />
          Void Sales Vouchers
        </Typography>
      </Paper>

      {/* Main Content */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 1, md: 2 },
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
          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}>
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
            {(loading || apiLoading) ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Loading...</Typography>
              </Box>
            ) : currentVouchers.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f5f5f5" }}>
                <Typography color="textSecondary">
                  {searchTerm ? 'No voided sales vouchers found matching your search' : 'No voided sales vouchers found'}
                </Typography>
              </Paper>
            ) : (
              currentVouchers.map((voucher) => (
                <Card key={voucher.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: "#f44336", fontWeight: "600", fontSize: "1rem" }}>
                          {voucher.svId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {voucher.dated}
                        </Typography>
                      </Box>
                      <Chip
                        label="VOIDED"
                        color="error"
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Entries:</strong> {voucher.entries}
                    </Typography>
                    <Typography variant="body2">
                      {voucher.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>SV ID #</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Dated</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Entries</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(loading || apiLoading) ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#666" }}>
                      {searchTerm ? 'No voided sales vouchers found matching your search' : 'No voided sales vouchers found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentVouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell sx={{ fontWeight: "600", color: "#f44336" }}>
                        {voucher.svId}
                      </TableCell>
                      <TableCell>{voucher.dated}</TableCell>
                      <TableCell>{voucher.description}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{voucher.entries}</TableCell>
                      <TableCell>
                        <Chip label="VOIDED" color="error" size="small" />
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
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredVouchers.length)} of {filteredVouchers.length} entries
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
    </Box>
  );
};

export default VoidSalesVoucher;
