import React, { useState, useEffect } from "react";
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
import PurchaseReturnDetail from "./purchaseReturnDetail";
import EditPurchaseReturn from "./editPurchaseReturn";

// TypeScript interface for Purchase Return
interface PurchaseReturn {
  id: string;
  _id?: string;
  date: string;
  description: string;
  numberOfEntries: number;
  status?: 'Submitted' | 'Voided';
  createdAt?: string;
  updatedAt?: string;
}

const ViewPurchaseReturn: React.FC = () => {
  // State for returns data
  const [returns, setReturns] = useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filtered returns based on search
  const [filteredReturns, setFilteredReturns] = useState<PurchaseReturn[]>([]);

  // State for view mode
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);

  // API call to fetch returns
  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/purchase-returns?page=${currentPage}&limit=${entriesPerPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      const data = result.data || {};
      const items = data.items || [];

      // Filter out voided returns for the main view
      const activeReturns = items.filter((item: any) => item.status !== 'Voided');
      
      setReturns(activeReturns);
      setFilteredReturns(activeReturns);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch returns');
      console.error('Error fetching returns:', err);
      setReturns([]);
      setFilteredReturns([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch data on component mount and when page/limit changes
  useEffect(() => {
    fetchReturns();
  }, [currentPage, entriesPerPage]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredReturns(returns);
    } else {
      const filtered = returns.filter(returnItem => {
        return returnItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
               returnItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               returnItem.date.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredReturns(filtered);
    }
  }, [searchQuery, returns]);

  // Handle actions
  const handleView = (returnId: string) => {
    const returnItem = returns.find(r => r.id === returnId || r._id === returnId);
    if (returnItem) {
      setSelectedReturn(returnItem);
      setViewMode('detail');
    }
  };

  const handlePrint = (returnId: string) => {
    console.log('Print return:', returnId);
    // TODO: Implement print functionality
  };

  // Handle back from detail view
  const handleBack = () => {
    setViewMode('list');
    setSelectedReturn(null);
  };

  // Handle edit return
  const handleEdit = (returnItem: PurchaseReturn) => {
    console.log('Edit return:', returnItem);
    setSelectedReturn(returnItem);
    setViewMode('edit');
  };

  // Handle void return
  const handleVoid = (returnItem: PurchaseReturn) => {
    // Refresh the list after voiding
    fetchReturns();
    handleBack();
  };

  // Handle save after edit
  const handleSave = (updatedReturn: PurchaseReturn) => {
    setReturns(prev => prev.map(r => 
      r.id === updatedReturn.id ? updatedReturn : r
    ));
    setSelectedReturn(updatedReturn);
    setViewMode('detail');
    fetchReturns();
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredReturns.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentReturns = filteredReturns.slice(startIndex, endIndex);

  // Show detail view if in detail mode
  if (viewMode === 'detail' && selectedReturn) {
    return (
      <PurchaseReturnDetail
        returnItem={selectedReturn}
        onBack={handleBack}
        onEdit={handleEdit}
        onVoid={handleVoid}
      />
    );
  }

  // Show edit view if in edit mode
  if (viewMode === 'edit' && selectedReturn) {
    return (
      <EditPurchaseReturn
        returnItem={selectedReturn}
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
        backgroundColor: 'white',
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
          border: '1px solidrgb(32, 48, 107)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Purchase Returns List
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
              onClick={fetchReturns}
              disabled={loading}
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

          {/* Right side - Search Box */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="body2">Search:</Typography>
            <TextField
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search returns..."
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
              Error loading returns: {error}. Please check if the backend server is running.
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
                  PR ID #
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
                    <Typography>Loading returns...</Typography>
                  </TableCell>
                </TableRow>
              ) : currentReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', padding: '40px' }}>
                    <Typography>No returns found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                currentReturns.map((returnItem, index) => (
                  <TableRow
                    key={returnItem.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>
                      {returnItem.id || returnItem._id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {returnItem.date ? new Date(returnItem.date).toLocaleDateString('en-GB') : 'Invalid Date'}
                    </TableCell>
                    <TableCell sx={{ maxWidth: '400px' }}>
                      {returnItem.description || 'No description'}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {returnItem.numberOfEntries || 0}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleView(returnItem.id)}
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
                          onClick={() => handlePrint(returnItem.id)}
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredReturns.length)} of {filteredReturns.length} entries
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
                  '&:hover': { backgroundColor: 'white' },
                  '&.Mui-selected': {
                    backgroundColor: 'white',
                    color: '#333',
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

export default ViewPurchaseReturn;
