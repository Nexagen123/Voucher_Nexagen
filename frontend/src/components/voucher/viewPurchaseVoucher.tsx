import React, {useState, useEffect, useCallback} from "react";
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
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import PurchaseVoucherDetail from "./purchaseVoucherDetail";
import EditPurchaseVoucher from "./editPurchaseVoucher";

// TypeScript interface for Purchase Voucher Item
interface PurchaseVoucherItem {
  itemName: string;
  quantity: number;
  rate: number;
  total?: number;
}

// TypeScript interface for Purchase Voucher
interface PurchaseVoucher {
  id: string;
  _id?: string;
  prvId: string;
  dated: string;
  date?: string; // Alternative date field
  description: string;
  entries: number;
  items?: PurchaseVoucherItem[];
  status?: 'Submitted' | 'Voided';
  createdAt?: string;
  updatedAt?: string;
}



const ViewPurchaseVoucher: React.FC = () => {
  // State for vouchers data
  const [vouchers, setVouchers] = useState<PurchaseVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered vouchers based on search
  const [filteredVouchers, setFilteredVouchers] = useState<PurchaseVoucher[]>([]);

  // Helper function to format description from items or description field
  const formatDescription = (voucher: PurchaseVoucher): string => {
    // If voucher has items, format them
    if (voucher.items && voucher.items.length > 0) {
      if (voucher.items.length === 1) {
        const item = voucher.items[0];
        return `${item.itemName} - ${item.quantity} - ${item.rate}`;
      }
      return `${voucher.items.length} items: ${voucher.items.map(item => item.itemName).join(', ')}`;
    }
    // Otherwise, use the description field
    return voucher.description || 'No description';
  };

  // State for view mode
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedVoucher, setSelectedVoucher] = useState<PurchaseVoucher | null>(null);

  // API call to fetch vouchers
  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vouchers/purchase', {
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
      console.log('API Response:', result);

      if (result.success) {
        const items = result.data?.vouchers || result.data?.items || result.data || [];
        // Filter out voided vouchers for the main view
        const activeVouchers = items.filter((item: any) => item.status !== 'Voided');
        setVouchers(activeVouchers);
        setFilteredVouchers(activeVouchers);
      } else {
        throw new Error(result.message || 'Failed to fetch vouchers');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vouchers');
      console.error('Error fetching vouchers:', err);

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
    if (searchQuery.trim() === '') {
      setFilteredVouchers(vouchers);
    } else {
      const filtered = vouchers.filter(voucher => {
        const description = formatDescription(voucher);
        return voucher.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
               voucher.prvId.toLowerCase().includes(searchQuery.toLowerCase()) ||
               description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (voucher.date || voucher.dated).toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredVouchers(filtered);
    }
  }, [searchQuery, vouchers]);

  // Handle actions
  const handleView = (voucherId: string) => {
    const voucher = vouchers.find(v => v.id === voucherId || v._id === voucherId);
    if (voucher) {
      setSelectedVoucher(voucher);
      setViewMode('detail');
    }
  };

  const handlePrint = (voucherId: string) => {
    console.log('Print voucher:', voucherId);
    // TODO: Implement print functionality
  };

  // Handle back from detail view
  const handleBack = () => {
    setViewMode('list');
    setSelectedVoucher(null);
  };

  // Handle edit voucher
  const handleEdit = (voucher: PurchaseVoucher) => {
    console.log('Edit voucher:', voucher);
    setSelectedVoucher(voucher);
    setViewMode('edit');
  };

  // Handle void voucher
  const handleVoid = (voucher: PurchaseVoucher) => {
    // Refresh the list after voiding
    fetchVouchers();
    handleBack();
  };

  // Handle save after edit
  const handleSave = (updatedVoucher: PurchaseVoucher) => {
    // Update the voucher in the list
    setVouchers(prev => prev.map(v =>
      v.id === updatedVoucher.id ? updatedVoucher : v
    ));
    setSelectedVoucher(updatedVoucher);
    setViewMode('detail');
    // Refresh the list to get latest data
    fetchVouchers();
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredVouchers.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Show detail view if in detail mode
  if (viewMode === 'detail' && selectedVoucher) {
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
  if (viewMode === 'edit' && selectedVoucher) {
    return (
      <EditPurchaseVoucher
        voucher={selectedVoucher}
        onBack={() => setViewMode('detail')}
        onSave={handleSave}
      />
    );
  }

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '100vw' },
        position: { xs: 'static', md: 'relative' },
        left: { xs: 'auto', md: '50%' },
        right: { xs: 'auto', md: '50%' },
        marginLeft: { xs: '0', md: 'calc(-50vw + 20vw)' },
        marginRight: { xs: '0', md: '-50vw' },
        padding: { xs: '16px', md: '24px' },
        backgroundColor: '#FFFFFF',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      {/* Header Card */}
      <Box
        sx={{
          backgroundColor: '#3da0bd',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #3da0bd',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Purchase Vouchers List
        </Typography>
      </Box>

      {/* Main Content Card */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Controls Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Left side - Show Entries and Refresh */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="body2">Show</Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={entriesPerPage}
                  onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  sx={{ backgroundColor: '#f8f9ff' }}
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
                borderColor: '#3da0bd',
                color: '#3da0bd',
                '&:hover': {
                  borderColor: '#3da0bd',
                  backgroundColor: '#f8f9ff',
                },
              }}
            >
              Refresh
            </Button>
          </Box>

          {/* Right side - Search Box */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="body2">Search:</Typography>
            <TextField
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vouchers..."
              sx={{
                backgroundColor: '#f8f9ff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
              }}
              slotProps={{
                input: {
                  endAdornment: <SearchIcon sx={{ color: '#666' }} />,
                },
              }}
            />
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ marginBottom: '16px' }}>
            <Typography color="error" variant="body2">
              Error loading vouchers: {error}. Please check if the backend server is running.
            </Typography>
          </Box>
        )}

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
          }}
        >
          <Table>
            {/* Table Header */}
            <TableHead>
              <TableRow sx={{ backgroundColor: '#3da0bd' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  PV ID #
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Description
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Entries
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body */}
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '40px' }}>
                    <Typography>Loading vouchers...</Typography>
                  </TableCell>
                </TableRow>
              ) : currentVouchers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '40px' }}>
                    <Typography>No vouchers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentVouchers.map((voucher, index) => (
                  <TableRow
                    key={voucher.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                      {voucher.id}
                    </TableCell>
                    <TableCell>{voucher.date || voucher.dated}</TableCell>
                    <TableCell sx={{ maxWidth: '400px' }}>
                      {formatDescription(voucher)}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {voucher.entries}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleView(voucher.id)}
                          sx={{
                            backgroundColor: '#2196F3',
                            '&:hover': { backgroundColor: '#1976D2' },
                            textTransform: 'none',
                          }}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<PrintIcon />}
                          onClick={() => handlePrint(voucher.id)}
                          sx={{
                            backgroundColor: '#4CAF50',
                            '&:hover': { backgroundColor: '#388E3C' },
                            textTransform: 'none',
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

        {/* Pagination Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Showing entries info */}
          <Typography variant="body2" sx={{ color: '#666' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredVouchers.length)} of {filteredVouchers.length} entries
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
                '& .MuiPaginationItem-root': {
                  backgroundColor: '#f8f9ff',
                  '&:hover': { backgroundColor: '#E3F2FD' },
                  '&.Mui-selected': {
                    backgroundColor: '#3da0bd',
                    color: '#FFFFFF',
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
