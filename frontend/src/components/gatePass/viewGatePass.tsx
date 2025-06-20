import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Breadcrumbs,
  Link,
  TablePagination,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { viewGatePass } from '../../api/axios';

interface GatePassVoucher {
  id: string;
  date: string;
  partyName: string;
  status: 'Gate-In' | 'Gate-Out';
  addedBy: string;
}

const ViewGatePass: React.FC = () => {
  // State management
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Sample data
  const [voucherData,setVoucherData] = useState<any>([
  ]);

  const fetchGatePass=async()=>{
    const response=await viewGatePass();
    setVoucherData(response.data);
  }
  useEffect(()=>{
    fetchGatePass();
  },[]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmitFilter = () => {
    // Implement date filter logic here
    console.log('Filtering from:', fromDate, 'to:', toDate);
  };

  return (
    <Box sx={{
      width: '100%',
      padding: { xs: 2, md: 4 },
      backgroundColor: '#FFFFFF'
    }}>
      <Box sx={{ maxWidth: '100%' }}>
        <Paper elevation={3} sx={{
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          width: '100%'
        }}>
          {/* Breadcrumb Navigation */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            sx={{ mb: 3 }}
          >
            <Link color="inherit" href="/" sx={{ textDecoration: 'none' }}>
              Home
            </Link>
            <Typography color="text.primary">All Gate Pass Vouchers</Typography>
          </Breadcrumbs>

          {/* Filter Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="From Month"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
              />
              <TextField
                label="To Month"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitFilter}
                sx={{
                  bgcolor: '#3da0bd',
                  '&:hover': { bgcolor: '#053594' },
                  height: '40px'
                }}
              >
                Submit
              </Button>
            </Box>
          </Paper>

          {/* Main Content */}
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ p: 3 }}>
              {/* Table Controls */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Show Entries</InputLabel>
                  <Select
                    value={entriesPerPage}
                    label="Show Entries"
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
              </Box>

              {/* Data Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#3da0bd' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>GP ID #</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dated</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Party Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Added By</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {voucherData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f5f5' } }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.partyName}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.addedBy}</TableCell>
                        <TableCell>
                          <IconButton color="primary" title="View">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton color="primary" title="Print">
                            <PrintIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={voucherData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
};

export default ViewGatePass;
