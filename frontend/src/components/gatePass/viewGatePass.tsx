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
  Snackbar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { viewGatePass, editGatePass, voidGatePass } from "../../api/axios";
import logo from "../../assets/logo.png";
import MuiAlert from "@mui/material/Alert";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Add type declaration for File System Access API

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
  const [editRows, setEditRows] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const printComponentRef = React.useRef<HTMLDivElement>(null);
  const [selectedPageSize, setSelectedPageSize] = useState("A4");
  const pdfContentRef = React.useRef<HTMLDivElement>(null);

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

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (voucher: any, igpId?: number) => {
    setSelectedVoucher({ ...voucher, igpId });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVoucher(null);
  };

  const handleEdit = () => {
    setEditData({
      id:
        selectedVoucher.igpId ||
        selectedVoucher.id ||
        selectedVoucher._id ||
        "",
      date: selectedVoucher.date || "",
      party: selectedVoucher.party || selectedVoucher.partyName || "",
      orderNo: selectedVoucher.orderNo || "",
      type: selectedVoucher.type || selectedVoucher.status || "Incoming",
    });
    setEditRows(
      Array.isArray(selectedVoucher.rows)
        ? selectedVoucher.rows.map((row: any) => ({
            ...row,
            qty: row.qty || "",
          }))
        : []
    );
    setEditMode(true);
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditRowChange = (rowId: string, field: string, value: any) => {
    setEditRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleAddEditRow = () => {
    setEditRows((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        productName: "",
        detail: "",
        qty: "",
        unit: "",
      },
    ]);
  };

  const handleDeleteEditRow = (rowId: string) => {
    setEditRows((prev) =>
      prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev
    );
  };

  const handleSaveEdit = async () => {
    try {
      const id = selectedVoucher.id || selectedVoucher._id;
      const gatepassData = {
        date: editData.date,
        party: editData.party,
        orderNo: editData.orderNo,
        type: editData.type,
        rows: editRows,
      };
      await editGatePass(id, gatepassData);
      setSnackbarMessage("Gate Pass updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setEditMode(false);
      setOpenDialog(false);
      fetchGatePass(); // Refresh list
    } catch (error) {
      setSnackbarMessage("Failed to update gate pass.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleOpenPrintPreview = () => setPrintPreviewOpen(true);

  const handleClosePrintPreview = () => setPrintPreviewOpen(false);

  const handlePageSizeChange = (event: any) =>
    setSelectedPageSize(event.target.value);

  // Use 'as any' to fix the TypeScript error for 'content' property
  const handleReactToPrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: selectedVoucher
      ? `GatePass_IGP-${selectedVoucher.igpId || selectedVoucher.id || ""}`
      : "GatePass",
    removeAfterPrint: true,
    pageStyle: `@page { size: ${selectedPageSize}; margin: 16mm; } @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`,
    onAfterPrint: handleClosePrintPreview,
  } as any);

  // Add a helper to ensure print content is mounted before printing
  const handlePrintNow = () => {
    if (printComponentRef.current) {
      handleReactToPrint();
    } else {
      setSnackbarMessage("Print content not ready. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Print handler for Gate Pass
  const handlePrintGatePass = () => {
    if (!selectedVoucher) return;
    const printContent = `
      <html>
      <head>
        <title>Gate Pass - ${selectedVoucher.igpId || ""}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h2 { color: #1976d2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #e3f2fd; }
          .header { margin-bottom: 24px; }
          .info { margin-bottom: 12px; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature-box { text-align: center; }
          .signature-line { border-bottom: 1px solid #888; width: 120px; margin: 16px auto 0 auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="background:#1976d2;color:#fff;padding:12px 0;border-radius:8px;text-align:center;">Gate Pass Details</h2>
          <div class="info"><strong>GP ID:</strong> ${
            selectedVoucher.igpId || ""
          }</div>
          <div class="info"><strong>Date:</strong> ${
            selectedVoucher.date || ""
          }</div>
          <div class="info"><strong>Party Name:</strong> ${
            selectedVoucher.party || selectedVoucher.partyName || ""
          }</div>
          <div class="info"><strong>Status:</strong> ${
            selectedVoucher.type || selectedVoucher.status || ""
          }</div>
          <div class="info"><strong>Order No:</strong> ${
            selectedVoucher.orderNo || "-"
          }</div>
        </div>
        <h3 style="color:#1976d2;">Products</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            ${
              Array.isArray(selectedVoucher.rows) &&
              selectedVoucher.rows.length > 0
                ? selectedVoucher.rows
                    .map(
                      (row: any) => `
                      <tr>
                        <td>${row.productName}</td>
                        <td>${row.qty}</td>
                        <td>${row.unit}</td>
                      </tr>
                    `
                    )
                    .join("")
                : `<tr><td colspan='3' style='text-align:center;'>No products</td></tr>`
            }
          </tbody>
        </table>
        <div class="signatures">
          <div class="signature-box">
            <div>Signature (Issuer)</div>
            <div class="signature-line"></div>
          </div>
          <div class="signature-box">
            <div>Signature (Receiver)</div>
            <div class="signature-line"></div>
          </div>
        </div>
      </body>
      </html>
    `;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
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

  const handleCancelEdit = () => {
    setEditMode(false);
  };

  // Printable content as a separate component
  const GatePassPrintContent = React.forwardRef<
    HTMLDivElement,
    { voucher: any }
  >(({ voucher }, ref) => (
    <div ref={ref} style={{ width: "100%" }}>
      <Box
        sx={{
          p: 3,
          background: "#fff",
          borderRadius: 2,
          minWidth: 700,
          maxWidth: 1300,
          fontFamily: "Roboto, Arial",
          color: "#222",
          border: "1px solid #e0e0e0",
          mx: "auto",
        }}
      >
        {/* Header Row: Logo, Business Info, Print Date, Opening Balance */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          {/* Logo and Info */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="Nexagen Logo"
              sx={{
                width: 70,
                height: 70,
                objectFit: "contain",
                mr: 2,
              }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, letterSpacing: 1 }}
              >
                NEXAGEN
              </Typography>
              <Typography sx={{ fontSize: 14 }}>ALI MALL SUSAN ROAD</Typography>
              <Typography sx={{ fontSize: 14 }}>
                Phone: | Cell: | Email: test@mail.com
              </Typography>
              <Typography sx={{ fontSize: 14 }}>
                NTN#: 455184-8 | LIC#: 325
              </Typography>
            </Box>
          </Box>
          {/* Print Date and Balance */}
          <Box sx={{ minWidth: 180 }}>
            <Typography sx={{ textAlign: "right", fontSize: 13, mb: 1 }}>
              Print Date:{" "}
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Typography>
            <Box
              sx={{
                border: "1px solid #222",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#f5f7fa",
                  p: 1,
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 15,
                  borderBottom: "1px solid #222",
                }}
              >
                Gate Pass Type
              </Box>
              <Box
                sx={{
                  p: 1,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {voucher.type || voucher.status}
              </Box>
            </Box>
          </Box>
        </Box>
        {/* Section Header */}
        <Box
          sx={{
            bgcolor: "#1976d2",
            color: "#fff",
            p: 1.2,
            borderRadius: 1,
            mb: 2,
            fontWeight: 700,
            fontSize: 18,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          {`Gate Pass #IGP-${
            voucher && voucher.igpId !== undefined ? voucher.igpId : "-"
          }`}
        </Box>
        {/* Main Details */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
              <b>Date:</b> {voucher.date}
            </Typography>
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
              <b>Party Name:</b> {voucher.party || voucher.partyName}
            </Typography>
            <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
              <b>Order No:</b> {voucher.orderNo || "-"}
            </Typography>
          </Box>
        </Box>
        {/* Product Table for Print */}
        {Array.isArray(voucher.rows) && voucher.rows.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Products
            </Typography>
            <Table
              size="small"
              sx={{ maxWidth: 600, border: "1px solid #e0e0e0" }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Product Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voucher.rows.map((row: any, idx: number) => (
                  <TableRow key={row.id || idx}>
                    <TableCell>{row.productName}</TableCell>
                    <TableCell>{row.qty}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {/* Signatures */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Signature (Issuer)
            </Typography>
            <Box sx={{ borderBottom: "1px solid #888", width: 120, mt: 2 }} />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Signature (Receiver)
            </Typography>
            <Box sx={{ borderBottom: "1px solid #888", width: 120, mt: 2 }} />
          </Box>
        </Box>
      </Box>
    </div>
  ));

  const handleJsPdfPrint = async () => {
    if (!pdfContentRef.current) return;
    const input = pdfContentRef.current;
    // Use html2canvas to render the content as an image
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Calculate image dimensions to fit A4
    const imgProps = canvas;
    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
    pdf.save(
      `GatePass_IGP-${selectedVoucher?.igpId || selectedVoucher?.id || ""}.pdf`
    );
  };

  return (
    <Box
      sx={{
        width: "97vw",
        height: "100vh",
        padding: 0,
        marginLeft: "-18vw",
        marginRight: "0vw",
        overflow: "auto", // Changed from 'hidden' to 'auto' to avoid unnecessary scrollbars
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflow: "unset", // Changed from 'auto' to 'unset' to avoid nested scrollbars
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
              <TableContainer sx={{ flex: 1, maxHeight: "none" }}>
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
                      .map((row: any, index: number) => {
                        // Calculate the global index for IGP ID
                        const globalIndex = page * rowsPerPage + index;
                        const igpId = 1000 + globalIndex;
                        return (
                          <TableRow
                            key={row.id || row._id}
                            sx={{
                              "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" },
                            }}
                          >
                            <TableCell>{igpId}</TableCell>
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
                                onClick={() => handleOpenDialog(row, igpId)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gate Pass Details</DialogTitle>
        <DialogContent dividers>
          {/* Editable or view content (as before) */}
          {selectedVoucher && !editMode && (
            <>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  minWidth: 700,
                  maxWidth: 1000,
                  mx: "auto",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    bgcolor: "#1976d2",
                    color: "#fff",
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 22,
                    letterSpacing: 1,
                  }}
                >
                  Gate Pass Details
                </Box>
                {/* Main Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    GP ID:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {selectedVoucher && selectedVoucher.igpId !== undefined
                        ? selectedVoucher.igpId
                        : ""}
                    </span>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    Date:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {selectedVoucher.date}
                    </span>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    Party Name:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {selectedVoucher.party || selectedVoucher.partyName}
                    </span>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    Status:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {selectedVoucher.type || selectedVoucher.status}
                    </span>
                  </Typography>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    Order No:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {selectedVoucher.orderNo || "-"}
                    </span>
                  </Typography>
                </Box>
                {/* Product Table */}
                {Array.isArray(selectedVoucher.rows) &&
                  selectedVoucher.rows.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ mb: 1, fontWeight: 600, color: "#1976d2" }}
                      >
                        Products
                      </Typography>
                      <TableContainer
                        component={Paper}
                        sx={{
                          borderRadius: 2,
                          boxShadow: "none",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Product Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Quantity
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Unit
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedVoucher.rows.map(
                              (row: any, idx: number) => (
                                <TableRow key={row.id || idx}>
                                  <TableCell>{row.productName}</TableCell>
                                  <TableCell>{row.qty}</TableCell>
                                  <TableCell>{row.unit}</TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                    className="no-print"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintGatePass}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                    className="no-print"
                  >
                    Print
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={async () => {
                      try {
                        await voidGatePass(selectedVoucher._id);
                        setSnackbarMessage(
                          `Gate Pass #IGP-${selectedVoucher.igpId} voided successfully!`
                        );
                        setSnackbarSeverity("success");
                        setSnackbarOpen(true);
                        handleCloseDialog();
                        setVoucherData((prev: any[]) =>
                          prev.filter((v) => v._id !== selectedVoucher._id)
                        );
                      } catch (error) {
                        setSnackbarMessage(
                          `Failed to void Gate Pass #IGP-${selectedVoucher.igpId}.`
                        );
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                      }
                    }}
                    sx={{ borderRadius: 2, minWidth: 100 }}
                    className="no-print"
                  >
                    Void
                  </Button>
                </Box>
                {/* Signatures */}
                <Box
                  sx={{
                    mt: 4,
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
              </Paper>
              {/* Hidden PDF content for jsPDF export */}
              <div style={{ position: "absolute", left: -9999, top: 0 }}>
                <div ref={pdfContentRef}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      minWidth: 700,
                      maxWidth: 1000,
                      mx: "auto",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      color: "#222",
                      fontFamily: "Roboto, Arial",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "#1976d2",
                        color: "#fff",
                        p: 2,
                        borderRadius: 2,
                        mb: 2,
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: 1,
                      }}
                    >
                      Gate Pass Details
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                        GP ID:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {selectedVoucher.igpId !== undefined
                            ? selectedVoucher.igpId
                            : ""}
                        </span>
                      </Typography>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                        Date:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {selectedVoucher.date}
                        </span>
                      </Typography>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                        Party Name:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {selectedVoucher.party || selectedVoucher.partyName}
                        </span>
                      </Typography>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                        Status:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {selectedVoucher.type || selectedVoucher.status}
                        </span>
                      </Typography>
                      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                        Order No:{" "}
                        <span style={{ fontWeight: 400 }}>
                          {selectedVoucher.orderNo || "-"}
                        </span>
                      </Typography>
                    </Box>
                    {Array.isArray(selectedVoucher.rows) &&
                      selectedVoucher.rows.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ mb: 1, fontWeight: 600, color: "#1976d2" }}
                          >
                            Products
                          </Typography>
                          <TableContainer
                            component={Paper}
                            sx={{
                              borderRadius: 2,
                              boxShadow: "none",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Product Name
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Quantity
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: "bold" }}>
                                    Unit
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {selectedVoucher.rows.map(
                                  (row: any, idx: number) => (
                                    <TableRow key={row.id || idx}>
                                      <TableCell>{row.productName}</TableCell>
                                      <TableCell>{row.qty}</TableCell>
                                      <TableCell>{row.unit}</TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Signature (Issuer)
                        </Typography>
                        <Box
                          sx={{
                            borderBottom: "1px solid #888",
                            width: 120,
                            mt: 2,
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Signature (Receiver)
                        </Typography>
                        <Box
                          sx={{
                            borderBottom: "1px solid #888",
                            width: 120,
                            mt: 2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </div>
              </div>
            </>
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
                value={editData.party || ""}
                onChange={(e) => handleEditFieldChange("party", e.target.value)}
              />
              <TextField
                label="Order No."
                value={editData.orderNo || ""}
                onChange={(e) =>
                  handleEditFieldChange("orderNo", e.target.value)
                }
              />
              <FormControl>
                <InputLabel>Type</InputLabel>
                <Select
                  value={editData.type || ""}
                  label="Type"
                  onChange={(e) =>
                    handleEditFieldChange("type", e.target.value)
                  }
                >
                  <MenuItem value="Outgoing">Outgoing</MenuItem>
                  <MenuItem value="Incoming">Incoming</MenuItem>
                </Select>
              </FormControl>
              {/* Product Rows Table */}
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                  mt: 2,
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Product Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Detail</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>QTY</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          width: 60,
                          textAlign: "center",
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <TextField
                            value={row.productName}
                            onChange={(e) =>
                              handleEditRowChange(
                                row.id,
                                "productName",
                                e.target.value
                              )
                            }
                            placeholder="Product name"
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.detail}
                            onChange={(e) =>
                              handleEditRowChange(
                                row.id,
                                "detail",
                                e.target.value
                              )
                            }
                            placeholder="Detail"
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.qty}
                            onChange={(e) =>
                              handleEditRowChange(
                                row.id,
                                "qty",
                                e.target.value.replace(/[^0-9]/g, "")
                              )
                            }
                            placeholder="0"
                            size="small"
                            fullWidth
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            value={row.unit}
                            onChange={(e) =>
                              handleEditRowChange(
                                row.id,
                                "unit",
                                e.target.value
                              )
                            }
                            size="small"
                            fullWidth
                          >
                            <option value="" disabled>
                              Select unit
                            </option>
                            {["Pieces", "Kg", "Liters", "Meters", "Boxes"].map(
                              (unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              )
                            )}
                          </TextField>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Button
                            color="error"
                            onClick={() => handleDeleteEditRow(row.id)}
                            disabled={editRows.length === 1}
                          >
                            <DeleteIcon />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 2,
                  mt: 1,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddEditRow}
                >
                  Add Row
                </Button>
              </Box>
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

      {/* Print Preview Dialog (Modern Print Functionality) */}
      {printPreviewOpen && selectedVoucher && (
        <Dialog
          open={printPreviewOpen}
          onClose={handleClosePrintPreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>Print Preview</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="subtitle1">Page Size:</Typography>
              <Select value={selectedPageSize} onChange={handlePageSizeChange}>
                <MenuItem value="A4">A4</MenuItem>
                <MenuItem value="Letter">Letter</MenuItem>
                <MenuItem value="Legal">Legal</MenuItem>
              </Select>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePrintNow}
              >
                Print Now
              </Button>
            </Box>
            <Box
              sx={{
                border: "1px solid #ccc",
                p: 2,
                background: "#fff",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  width:
                    selectedPageSize === "A4"
                      ? 794
                      : selectedPageSize === "Letter"
                      ? 816
                      : 850,
                  margin: "0 auto",
                }}
              >
                {/* Render the print content for preview */}
                <GatePassPrintContent
                  ref={printComponentRef}
                  voucher={selectedVoucher}
                />
              </div>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClosePrintPreview}
              >
                Close
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      )}

      {/* Snackbar for messages */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "auto",
          zIndex: 1400,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
          pointerEvents: "none",
          p: 2,
        }}
      >
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ pointerEvents: "auto" }}
        >
          <MuiAlert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ViewGatePass;
