import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Inventory as InventoryIcon,
  Visibility as DetailsIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Interface for Stock Summary Item
interface StockSummaryItem {
  id: string;
  category: string;
  totalOpeningQty: number;
  totalPurchasesQty: number;
  totalPReturnQty: number;
  totalSoldQty: number;
  totalSReturnQty: number;
  totalStockQty: number;
  totalValue: number;
}

interface StockSummaryProps {
  items?: StockSummaryItem[];
  loading?: boolean;
}

const StockSummary: React.FC<StockSummaryProps> = ({
  items = [],
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredItems, setFilteredItems] = useState<StockSummaryItem[]>([]);

  // State for API data (placeholder for future implementation)
  const [apiItems, setApiItems] = useState<StockSummaryItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Use only API data or props
  const displayItems = apiItems.length > 0 ? apiItems : items;

  // Fetch stock summary from API (placeholder for future implementation)
  const fetchStockSummary = async () => {
    try {
      setApiLoading(true);

      console.log('Fetching stock summary...');

      // TODO: Replace with actual stock summary API when implemented
      // For now, just use sample data
      setApiItems([]);

    } catch (error) {
      console.error('Error fetching stock summary:', error);
      setApiItems([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStockSummary();
  }, []);

  // Filter items based on search term
  useEffect(() => {
    let filtered = displayItems;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, displayItems]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / Math.max(1, entriesPerPage)));
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

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

  // Handle details click
  const handleDetails = (itemId: string) => {
    console.log('View details for item:', itemId);
    // TODO: Implement details functionality
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return num.toFixed(2);
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
          <InventoryIcon fontSize="large" />
          Stock Summary
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
              placeholder="Search items..."
              InputProps={{
                endAdornment: <SearchIcon sx={{ color: '#666' }} />,
              }}
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
            ) : currentItems.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f5f5f5" }}>
                <Typography color="textSecondary">
                  {searchTerm ? 'No items found matching your search' : 'No stock items found'}
                </Typography>
              </Paper>
            ) : (
              currentItems.map((item) => (
                <Card key={item.id} sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: "#2196F3", fontWeight: "600", fontSize: "1rem" }}>
                          ID: {item.id}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {item.category}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DetailsIcon />}
                        onClick={() => handleDetails(item.id)}
                        sx={{
                          backgroundColor: '#FF9800',
                          '&:hover': { backgroundColor: '#F57C00' },
                          fontSize: '0.75rem',
                          px: 1,
                        }}
                      >
                        Details
                      </Button>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                      <Typography variant="body2">
                        <strong>Total Opening:</strong> {formatNumber(item.totalOpeningQty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Purchases:</strong> {formatNumber(item.totalPurchasesQty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total P Return:</strong> {formatNumber(item.totalPReturnQty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Sold:</strong> {formatNumber(item.totalSoldQty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total S Return:</strong> {formatNumber(item.totalSReturnQty)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Stock:</strong> <span style={{ color: '#f44336', fontWeight: 'bold' }}>{formatNumber(item.totalStockQty)}</span>
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Total Value:</strong> {formatCurrency(item.totalValue)}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        ) : (
          /* Desktop Table View */
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2, overflowX: 'auto' }}>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3da0bd" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "white", minWidth: 60 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", minWidth: 200 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total Opening Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total Purchases Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total P Return Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total Sold Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total S Return Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 120 }}>Total Stock Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 100 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white", textAlign: "center", minWidth: 100 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(loading || apiLoading) ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: "center", py: 4 }}>
                      <CircularProgress size={24} sx={{ mr: 2 }} />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: "center", py: 4, color: "#666" }}>
                      {searchTerm ? 'No items found matching your search' : 'No stock items found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item, index) => (
                    <TableRow
                      key={item.id}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "600", color: "#2196F3" }}>
                        {item.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "500" }}>
                        {item.category}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatNumber(item.totalOpeningQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatNumber(item.totalPurchasesQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatNumber(item.totalPReturnQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatNumber(item.totalSoldQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {formatNumber(item.totalSReturnQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", fontWeight: "bold", color: "#f44336" }}>
                        {formatNumber(item.totalStockQty)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                        {formatCurrency(item.totalValue)}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<DetailsIcon />}
                          onClick={() => handleDetails(item.id)}
                          sx={{
                            backgroundColor: '#FF9800',
                            '&:hover': { backgroundColor: '#F57C00' },
                            textTransform: 'none',
                            fontSize: '0.75rem',
                          }}
                        >
                          Details
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
        {currentItems.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} entries
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

export default StockSummary;