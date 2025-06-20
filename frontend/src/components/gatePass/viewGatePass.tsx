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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Breadcrumbs,
  Link,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { viewGatePass } from "../../api/axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const printRef = React.useRef<HTMLDivElement>(null);

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

  const handleOpenDialog = (voucher: any) => {
    setSelectedVoucher(voucher);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVoucher(null);
  };

  const handleEdit = () => {
    // Use a shallow copy to avoid direct mutation
    setEditData({
      id: selectedVoucher.id || selectedVoucher._id || "",
      date: selectedVoucher.date || "",
      partyName: selectedVoucher.partyName || selectedVoucher.party || "",
      status: selectedVoucher.status || selectedVoucher.type || "",
    });
    setEditMode(true);
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    // Only allow status change for open entries
    const originalStatus = (
      selectedVoucher.status ||
      selectedVoucher.type ||
      ""
    ).toLowerCase();
    if (originalStatus !== "open") {
      setEditMode(false);
      return;
    }
    // Update in backend
    try {
      const id = selectedVoucher.id || selectedVoucher._id;
      // await updateGatePassStatus(id, editData.status);
      // Update the selected voucher in the dialog
      setSelectedVoucher({
        ...selectedVoucher,
        date: editData.date,
        partyName: editData.partyName,
        status: editData.status,
        type: editData.status, // for compatibility
      });
      // Update the main table data as well
      setVoucherData((prev: any[]) =>
        prev.map((item) =>
          item.id === selectedVoucher.id || item._id === selectedVoucher._id
            ? {
                ...item,
                date: editData.date,
                partyName: editData.partyName,
                status: editData.status,
                type: editData.status,
              }
            : item
        )
      );
    } catch (error) {
      alert("Failed to update status in database.");
    }
    setEditMode(false);
    // Optionally, refresh data from backend
  };

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  const handlePrint = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `GatePass_${
          selectedVoucher?.id || selectedVoucher?._id || "details"
        }.pdf`
      );
    }
  };

  // Filtered data based on search query (by party name) and date range
  const filteredData = voucherData.filter((row: any) => {
    const party = (row.party || row.partyName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesParty = party.includes(query);
    // Date filtering
    const rowDate = row.date ? row.date.slice(0, 10) : "";
    const from = fromDate ? fromDate.slice(0, 10) : "";
    const to = toDate ? toDate.slice(0, 10) : "";
    let matchesDate = true;
    if (from && to) {
      matchesDate = rowDate >= from && rowDate <= to;
    } else if (from) {
      matchesDate = rowDate >= from;
    } else if (to) {
      matchesDate = rowDate <= to;
    }
    return matchesParty && matchesDate;
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
                value={fromDate ? fromDate.slice(0, 10) : ""}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
                placeholder="yyyy-mm-dd"
              />
              <TextField
                label="To Month"
                type="date"
                value={toDate ? toDate.slice(0, 10) : ""}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
                placeholder="yyyy-mm-dd"
              />
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
                  justifyContent: "center",
                  alignItems: "center",
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
                  placeholder="Enter the party name..."
                  value={searchQuery}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
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
                              onClick={() => handleOpenDialog(row)}
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

      {/* Dialog for View/Edit/Print */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Gate Pass Details</DialogTitle>
        <DialogContent dividers>
          {/* Printable content for PDF generation */}
          <Box
            ref={printRef}
            sx={{
              display: selectedVoucher && !editMode ? "block" : "none",
              p: 2,
              background: "#fff",
              borderRadius: 2,
              mb: 2,
            }}
          >
            {selectedVoucher && !editMode && (
              <Box sx={{ fontFamily: "Roboto, Arial", color: "#222" }}>
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ fontWeight: 700, mb: 2, color: "#1976d2" }}
                >
                  Gate Pass
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>
                    <b>GP ID:</b> {selectedVoucher.id || selectedVoucher._id}
                  </Typography>
                  <Typography>
                    <b>Date:</b> {selectedVoucher.date}
                  </Typography>
                </Box>
                <Typography sx={{ mb: 1 }}>
                  <b>Party Name:</b>{" "}
                  {selectedVoucher.party || selectedVoucher.partyName}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  <b>Status:</b>{" "}
                  {selectedVoucher.type || selectedVoucher.status}
                </Typography>
                {/* Add more fields as needed */}
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Signature (Issuer)
                    </Typography>
                    <Box
                      sx={{ borderBottom: "1px solid #888", width: 120, mt: 2 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Signature (Receiver)
                    </Typography>
                    <Box
                      sx={{ borderBottom: "1px solid #888", width: 120, mt: 2 }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          {/* Editable or view content (as before) */}
          {selectedVoucher && !editMode && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography>
                <b>GP ID:</b> {selectedVoucher.id || selectedVoucher._id}
              </Typography>
              <Typography>
                <b>Date:</b> {selectedVoucher.date}
              </Typography>
              <Typography>
                <b>Party Name:</b>{" "}
                {selectedVoucher.party || selectedVoucher.partyName}
              </Typography>
              <Typography>
                <b>Status:</b> {selectedVoucher.type || selectedVoucher.status}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Box>
            </Box>
          )}
          {selectedVoucher && editMode && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="GP ID" value={editData.id || ""} disabled />
              <TextField
                label="Date"
                type="date"
                value={editData.date ? editData.date.slice(0, 10) : ""}
                onChange={(e) => handleEditFieldChange("date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 300 }}
                placeholder="yyyy-mm-dd"
              />
              <TextField
                label="Party Name"
                value={editData.partyName || ""}
                onChange={(e) =>
                  handleEditFieldChange("partyName", e.target.value)
                }
              />
              <FormControl>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editData.status || ""}
                  label="Status"
                  onChange={(e) =>
                    handleEditFieldChange("status", e.target.value)
                  }
                >
                  <MenuItem value="Outgoing">Outgoing</MenuItem>
                  <MenuItem value="Incoming">Incoming</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSaveEdit}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewGatePass;
