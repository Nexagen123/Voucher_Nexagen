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

// Interface for Voided Purchase Return
interface VoidedPurchaseReturn {
  id: string;
  _id?: string;
  date: string;
  description: string;
  numberOfEntries: number;
  status: 'Voided';
  voidedAt?: string;
}

interface VoidPurchaseReturnProps {
  returns?: VoidedPurchaseReturn[];
  loading?: boolean;
}

const VoidPurchaseReturn: React.FC<VoidPurchaseReturnProps> = ({
  returns = [],
  loading = false,
}) => {
  // Theme and responsive hooks
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredReturns, setFilteredReturns] = useState<VoidedPurchaseReturn[]>([]);
  
  // State for API data
  const [apiReturns, setApiReturns] = useState<VoidedPurchaseReturn[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Use API data if available, otherwise use props
  const displayReturns = apiReturns.length > 0 ? apiReturns : returns;

  // Fetch voided purchase returns from API
  const fetchVoidedReturns = async () => {
    try {
      setApiLoading(true);
      
      console.log('Fetching voided purchase returns...');
      
      // Get all purchase returns and filter for voided ones
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/purchase-returns', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        console.log('Purchase returns endpoint not available');
        setApiReturns([]);
        return;
      }

      const result = await response.json();
      console.log('Purchase returns API response:', result);

      if (result.success) {
        const items = result.data?.items || result.data || [];
        // Filter for voided returns only
        const voidedItems = items.filter((item: any) => item.status === 'Voided');
        setApiReturns(voidedItems);
      }
    } catch (error) {
      console.error('Error fetching voided purchase returns:', error);
      setApiReturns([]);
    } finally {
      setApiLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVoidedReturns();
  }, []);

  // Filter returns based on search term
  useEffect(() => {
    const filtered = displayReturns.filter(returnItem =>
      returnItem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.date.includes(searchTerm)
    );
    setFilteredReturns(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [displayReturns, searchTerm]);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle entries per page change
  const handleEntriesPerPageChange = (event: SelectChangeEvent<number>) => {
    setEntriesPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredReturns.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentReturns = filteredReturns.slice(startIndex, endIndex);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
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
      {/* Main Content Container */}
      <Box sx={{ width: '100%', mx: 'auto' }}>
        <Paper elevation={3} sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          mx: { xs: 0, md: 0 },
          width: '100%'
        }}>
          {/* Header */}
          <Box
            sx={{
              backgroundColor: "#3da0bd",
              color: "white",
              py: { xs: 1.5, md: 2 },
              px: { xs: 2, md: 3 },
              borderRadius: 1,
              mb: { xs: 2, md: 3 },
              textAlign: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              <VoidIcon fontSize="large" />
              Void Purchase Return
            </Typography>
          </Box>

          {/* Search and Controls */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <TextField
              placeholder="Search by ID, description, or date..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', md: '300px' }
              }}
            />
            
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexDirection: { xs: 'row', md: 'row' }
            }}>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                Show:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
                <Select
                  value={entriesPerPage}
                  onChange={handleEntriesPerPageChange}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                entries
              </Typography>
            </Box>
          </Box>

          {/* Loading State */}
          {(loading || apiLoading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* No Data State */}
          {!loading && !apiLoading && filteredReturns.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No voided purchase returns found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'No purchase returns have been voided yet'}
              </Typography>
            </Box>
          )}

          {/* Desktop Table View */}
          {!isMobile && !loading && !apiLoading && filteredReturns.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Entries</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Voided Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentReturns.map((returnItem) => (
                    <TableRow key={returnItem.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {returnItem.id}
                      </TableCell>
                      <TableCell>{formatDate(returnItem.date)}</TableCell>
                      <TableCell>{returnItem.description}</TableCell>
                      <TableCell>{returnItem.numberOfEntries}</TableCell>
                      <TableCell>
                        <Chip
                          label="Voided"
                          color="error"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        {returnItem.voidedAt ? formatDate(returnItem.voidedAt) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Mobile Card View */}
          {isMobile && !loading && !apiLoading && filteredReturns.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {currentReturns.map((returnItem) => (
                <Card key={returnItem.id} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {returnItem.id}
                      </Typography>
                      <Chip
                        label="Voided"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {formatDate(returnItem.date)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Description:</strong> {returnItem.description}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Entries:</strong> {returnItem.numberOfEntries}
                    </Typography>
                    
                    {returnItem.voidedAt && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Voided:</strong> {formatDate(returnItem.voidedAt)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Pagination */}
          {!loading && !apiLoading && filteredReturns.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 0 }
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredReturns.length)} of {filteredReturns.length} entries
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
    </Box>
  );
};

export default VoidPurchaseReturn;
