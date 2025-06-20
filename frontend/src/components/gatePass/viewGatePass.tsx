import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { viewGatePass } from "../../api/axios";

interface GatePassVoucher {
  id: string;
  date: string;
  partyName: string;
  status: "Gate-In" | "Gate-Out";
  addedBy: string;
}

const ViewGatePass: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [voucherData, setVoucherData] = useState<any>([]);

  const fetchGatePass = async () => {
    const response = await viewGatePass();
    setVoucherData(response.data);
  };

  useEffect(() => {
    fetchGatePass();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSubmitFilter = () => {
    console.log("Filtering from:", fromDate, "to:", toDate);
  };

  // Filtered data based on search query (by party name)
  const filteredData = voucherData.filter((row: any) => {
    const party = (row.party || row.partyName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return party.includes(query);
  });

  return (
    <Box
      sx={{
        width: "97vw",
        height: "100vh",
        padding: 0,
        marginLeft: "-18vw",
        marginRight: "0vw",
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            borderRadius: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Breadcrumb Navigation */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Link color="inherit" href="/" sx={{ textDecoration: "none" }}>
              Home
            </Link>
            <Typography color="text.primary">All Gate Pass Vouchers</Typography>
          </Breadcrumbs>

          {/* Filter Section */}
          <Paper sx={{ mx: 2, mt: 2, p: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              <TextField
                label="From Month"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 100 }}
              />
              <TextField
                label="To Month"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                onClick={handleSubmitFilter}
                sx={{
                  bgcolor: "#3da0bd",
                  "&:hover": { bgcolor: "#053594" },
                  height: "40px",
                }}
              >
                Submit
              </Button>
            </Box>
          </Paper>

          {/* Main Content */}
          <Paper
            sx={{
              m: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: 2,
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Table Controls */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <FormControl sx={{ minWidth: 100 }}>
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
                  sx={{ width: 200 }}
                />
              </Box>

              {/* Data Table */}
              <TableContainer sx={{ flex: 1, maxHeight: "100%" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#3da0bd" }}>
                      <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                        GP ID #
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                        Dated
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                        Party Name
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ color: "black", fontWeight: "bold" }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredData
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row: any, index: number) => (
                        <TableRow
                          key={row.id || row._id}
                          sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
                        >
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.party || row.partyName}</TableCell>
                          <TableCell>{row.type || row.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              sx={{ textTransform: "none" }}
                            >
                              View
                            </Button>
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
                count={filteredData.length}
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
