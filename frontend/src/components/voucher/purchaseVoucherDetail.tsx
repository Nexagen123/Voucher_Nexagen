import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as VoidIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";

// Interface for Purchase Voucher Transaction Item
interface PurchaseVoucherItem {
  account: string;
  item: string;
  quantity: number;
  category: string;
  productCode: string;
  rate: number;
  gst: number;
  total: number;
  description?: string;
  metadata?: {
    itemName?: string;
    unit?: string;
    [key: string]: any;
  };
}

// Interface for Purchase Voucher (matching backend voucher schema)
interface PurchaseVoucher {
  _id: string;
  voucher_id: string;
  date: string;
  type: string;
  created_by: string;
  updated_by: string;
  accounts: string[];
  is_void: boolean;
  is_posted: boolean;
  is_deleted: boolean;
  metadata: {
    supplier?: string;
    voucherType?: string;
    totalAmount?: number;
    itemsCount?: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  entries?: any[]; // Will be populated when entries=true
  transactions?: PurchaseVoucherItem[]; // Detailed transaction items
}

interface PurchaseVoucherDetailProps {
  voucher: PurchaseVoucher | null;
  onBack: () => void;
  onEdit: (voucher: PurchaseVoucher) => void;
  onVoid: (voucher: PurchaseVoucher) => void;
  onRefresh?: () => void; // Add optional onRefresh prop
}

const PurchaseVoucherDetail: React.FC<PurchaseVoucherDetailProps> = ({
  voucher,
  onBack,
  onEdit,
  onVoid,
  onRefresh, // Destructure onRefresh
}) => {
  // State
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [voidEntryDialogOpen, setVoidEntryDialogOpen] = useState<{
    open: boolean;
    entry: any | null;
  }>({ open: false, entry: null });
  const [loading, setLoading] = useState(false);
  const [entryLoading, setEntryLoading] = useState<string | null>(null); // entryId being voided
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Show snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle void confirmation
  const handleVoidConfirm = async () => {
    if (!voucher) return;

    try {
      setLoading(true);

      // Call API to void the voucher using the correct endpoint
      const response = await fetch(
        `http://localhost:8000/vouchers/${voucher._id}/void`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            dbprefix: localStorage.getItem("dbprefix") || "fast",
          },
          body: JSON.stringify({ is_void: true }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        showSnackbar("Purchase voucher voided successfully!", "success");
        setVoidDialogOpen(false);
        onVoid(voucher);
      } else {
        throw new Error(result.message || "Failed to void voucher");
      }
    } catch (error) {
      console.error("Error voiding voucher:", error);
      showSnackbar("Error voiding voucher", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle voiding or unvoiding a single entry
  const handleVoidEntry = async (entry: any, unvoid = false) => {
    if (!voucher || !entry) return;
    try {
      setEntryLoading(entry._id || entry.id || "");
      const response = await fetch(
        `http://localhost:8000/vouchers/${voucher._id}/entries/${
          entry._id || entry.id
        }/void`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            dbprefix: localStorage.getItem("dbprefix") || "fast",
          },
          body: JSON.stringify({ isVoid: !unvoid }), // true for void, false for unvoid
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        showSnackbar(
          unvoid
            ? "Entry unvoided successfully!"
            : "Entry voided successfully!",
          "success"
        );
        setVoidEntryDialogOpen({ open: false, entry: null });
        if (onRefresh) onRefresh(); // Call onRefresh after success
      } else {
        throw new Error(
          result.message ||
            (unvoid ? "Failed to unvoid entry" : "Failed to void entry")
        );
      }
    } catch (error) {
      console.error(
        unvoid ? "Error unvoiding entry:" : "Error voiding entry:",
        error
      );
      showSnackbar(
        unvoid ? "Error unvoiding entry" : "Error voiding entry",
        "error"
      );
    } finally {
      setEntryLoading(null);
    }
  };

  // Print handler
  const handlePrint = () => {
    if (!voucher) return;
    // Prepare printable HTML
    const printContent = `
      <html>
      <head>
        <title>Purchase Voucher - ${voucher.voucher_id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h2 { color: #1976d2; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f8f9fa; }
          .header { margin-bottom: 24px; }
          .info { margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Purchase Voucher Details</h2>
          <div class="info"><strong>Voucher ID:</strong> ${
            voucher.voucher_id
          }</div>
          <div class="info"><strong>Date:</strong> ${new Date(
            voucher.date
          ).toLocaleDateString()}</div>
          <div class="info"><strong>Supplier:</strong> ${
            voucher.metadata?.supplier || "N/A"
          }</div>
          <div class="info"><strong>Total Amount:</strong> $${
            voucher.metadata?.totalAmount?.toFixed(2) || "0.00"
          }</div>
          <div class="info"><strong>Status:</strong> ${
            voucher.is_void ? "Voided" : voucher.is_posted ? "Posted" : "Draft"
          }</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Item</th>
              <th>QTY</th>
              <th>Category</th>
              <th>Product Code</th>
              <th>Rate</th>
              <th>GST %</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              // Flatten all entries from all entry documents
              const allEntries: any[] = [];
              if (voucher.entries && voucher.entries.length > 0) {
                voucher.entries.forEach((entryDoc: any) => {
                  if (entryDoc.entries && Array.isArray(entryDoc.entries)) {
                    entryDoc.entries.forEach((entry: any) => {
                      if (!entry.isVoid) {
                        allEntries.push({
                          ...entry,
                          accountId: entryDoc.accountId,
                        });
                      }
                    });
                  }
                });
              }
              if (allEntries.length === 0) {
                return `<tr><td colspan='8' style='text-align:center;'>No purchase details available</td></tr>`;
              }
              return allEntries
                .map(
                  (entry: any) => `
                  <tr>
                    <td>${
                      voucher.metadata?.supplier || "Master Elastic Factory"
                    }</td>
                    <td>${
                      entry.metadata?.itemName ||
                      entry.description
                        ?.split("Purchase of ")[1]
                        ?.split(" - ")[0] ||
                      "N/A"
                    }</td>
                    <td>${
                      entry.metadata?.quantity ||
                      entry.description?.match(
                        /(\d+(?:\.\d+)?)\s+\w+\s+@/
                      )?.[1] ||
                      "0"
                    }</td>
                    <td>${entry.metadata?.category || "N/A"}</td>
                    <td>${
                      entry.metadata?.productCode ||
                      Math.floor(Math.random() * 900) + 100
                    }</td>
                    <td>${
                      entry.metadata?.rate ||
                      entry.description?.match(/@\s+(\d+(?:\.\d+)?)/)?.[1] ||
                      (entry.debit ? entry.debit.toString() : "0.00")
                    }</td>
                    <td>${entry.metadata?.gst || "0"}</td>
                    <td><strong>${
                      entry.metadata?.total?.toFixed(2) ||
                      (entry.debit ? entry.debit.toFixed(2) : "0.00")
                    }</strong></td>
                  </tr>
                `
                )
                .join("");
            })()}
          </tbody>
        </table>
      </body>
      </html>
    `;
    // Open print window
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Optionally, close after printing
        // printWindow.close();
      }, 500);
    }
  };

  if (!voucher) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No voucher selected</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "100vw" },
        position: { xs: "static", md: "relative" },
        left: { xs: "auto", md: "50%" },
        right: { xs: "auto", md: "50%" },
        marginLeft: { xs: "0", md: "calc(-50vw + 20vw)" },
        marginRight: { xs: "0", md: "-50vw" },
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 6 },
        minHeight: "100vh",
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
          borderRadius: { xs: 1, md: 2 },
          width: "100%",
        }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            color: "black",
            py: { xs: 1.5, md: 2 },
            px: { xs: 2, md: 3 },
            borderRadius: 1,
            mb: { xs: 2, md: 3 },
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{
              alignSelf: { xs: "flex-start", sm: "center" },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Back to List
          </Button>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              justifyContent: { xs: "center", sm: "center" },
            }}
          >
            <ReceiptIcon fontSize="large" />
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" } }}
            >
              Purchase Voucher Details
            </Typography>
          </Box>
        </Box>

        {/* Voucher Info */}
        <Box sx={{ mb: 3 }}>
          <Card sx={{ backgroundColor: "#f8f9fa", mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    md: "1fr 1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Voucher ID
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="black">
                    {voucher.voucher_id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(voucher.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {voucher.type.charAt(0).toUpperCase() +
                      voucher.type.slice(1)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={
                      voucher.is_void
                        ? "Voided"
                        : voucher.is_posted
                        ? "Posted"
                        : "Draft"
                    }
                    color={
                      voucher.is_void
                        ? "error"
                        : voucher.is_posted
                        ? "success"
                        : "warning"
                    }
                    size="small"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Supplier
                  </Typography>
                  <Typography variant="body1">
                    {voucher.metadata?.supplier || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    ${voucher.metadata?.totalAmount?.toFixed(2) || "0.00"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Purchase Voucher Details Table */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Purchase Details
          </Typography>

          {/* Date Display */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Date: Month/Day/Year
            </Typography>
            <TextField
              size="small"
              value={new Date(voucher.date).toLocaleDateString("en-US")}
              disabled
              sx={{
                "& .MuiInputBase-input": {
                  backgroundColor: "#f5f5f5",
                  fontWeight: "bold",
                },
              }}
            />
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                    Account
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                    Item
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    QTY
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Product Code
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    Rate
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    GST %
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  console.log("Voucher entries:", voucher.entries);
                  console.log("Full voucher data:", voucher);

                  // Flatten all entries from all entry documents
                  const allEntries: any[] = [];

                  if (voucher.entries && voucher.entries.length > 0) {
                    voucher.entries.forEach((entryDoc: any) => {
                      if (entryDoc.entries && Array.isArray(entryDoc.entries)) {
                        entryDoc.entries.forEach((entry: any) => {
                          allEntries.push({
                            ...entry,
                            accountId: entryDoc.accountId, // Add account ID from parent document
                          });
                        });
                      }
                    });
                  }

                  console.log("Flattened entries:", allEntries);

                  if (allEntries.length > 0) {
                    return allEntries
                      .filter((entry: any) => !entry.isVoid) // Only show non-voided entries
                      .map((entry: any, index: number) => {
                        const isEntryVoided = entry.isVoid;
                        return (
                          <TableRow
                            key={index}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "#fafafa",
                              },
                              opacity: isEntryVoided ? 0.5 : 1,
                            }}
                          >
                            <TableCell
                              sx={{ color: "#1976d2", fontWeight: 500 }}
                            >
                              {voucher.metadata?.supplier ||
                                "Master Elastic Factory"}
                            </TableCell>
                            <TableCell>
                              {entry.metadata?.itemName ||
                                entry.description
                                  ?.split("Purchase of ")[1]
                                  ?.split(" - ")[0] ||
                                "N/A"}
                            </TableCell>
                            <TableCell>
                              {entry.metadata?.quantity ||
                                entry.description?.match(
                                  /(\d+(?:\.\d+)?)\s+\w+\s+@/
                                )?.[1] ||
                                "0"}
                            </TableCell>
                            <TableCell>
                              {entry.metadata?.category || "N/A"}
                            </TableCell>
                            <TableCell>
                              {entry.metadata?.productCode ||
                                Math.floor(Math.random() * 900) + 100}
                            </TableCell>
                            <TableCell>
                              {entry.metadata?.rate ||
                                entry.description?.match(
                                  /@\s+(\d+(?:\.\d+)?)/
                                )?.[1] ||
                                (entry.debit ? entry.debit.toString() : "0.00")}
                            </TableCell>
                            <TableCell>{entry.metadata?.gst || "0"}</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                              {entry.metadata?.total?.toFixed(2) ||
                                (entry.debit ? entry.debit.toFixed(2) : "0.00")}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexDirection: { xs: "column", sm: "row" },
                                }}
                              >
                                <Button
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    fontSize: "0.75rem",
                                    minWidth: "60px",
                                    "&:hover": {
                                      backgroundColor: "#d32f2f",
                                    },
                                  }}
                                  disabled={isEntryVoided}
                                  onClick={() =>
                                    setVoidEntryDialogOpen({
                                      open: true,
                                      entry,
                                    })
                                  }
                                >
                                  {isEntryVoided ? "VOIDED" : "RETURN"}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    borderColor: isEntryVoided
                                      ? "#4caf50"
                                      : "#ff9800",
                                    color: isEntryVoided
                                      ? "#4caf50"
                                      : "#ff9800",
                                    fontSize: "0.75rem",
                                    minWidth: "50px",
                                    "&:hover": {
                                      borderColor: isEntryVoided
                                        ? "#388e3c"
                                        : "#f57c00",
                                      backgroundColor: isEntryVoided
                                        ? "#e8f5e9"
                                        : "#fff3e0",
                                    },
                                  }}
                                  disabled={
                                    entryLoading === (entry._id || entry.id)
                                  }
                                  onClick={
                                    () =>
                                      isEntryVoided
                                        ? handleVoidEntry(entry, true) // unvoid
                                        : setVoidEntryDialogOpen({
                                            open: true,
                                            entry,
                                          }) // void
                                  }
                                >
                                  {isEntryVoided ? "UNVOID" : "VOID"}
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      });
                  } else {
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          sx={{ textAlign: "center", py: 3 }}
                        >
                          <Typography color="textSecondary">
                            No purchase details available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  }
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: { xs: "center", md: "flex-end" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => onEdit(voucher)}
            disabled={voucher.is_void || voucher.is_deleted}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: "1rem", md: "1.1rem" },
              minWidth: { xs: "200px", md: "auto" },
              backgroundColor: "#4caf50",
              color: "#000",
              "&:hover": {
                backgroundColor: "#388e3c",
                color: "#fff",
              },
              "&:disabled": {
                backgroundColor: "#bdbdbd",
                color: "#fff",
              },
            }}
          >
            Edit Voucher
          </Button>
          {/* Add Return Voucher Button */}
          <Button
            variant="contained"
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: "1rem", md: "1.1rem" },
              minWidth: { xs: "200px", md: "auto" },
              backgroundColor: "#1976d2",
              color: "#000",
              "&:hover": {
                backgroundColor: "#115293",
                color: "#fff",
              },
            }}
          >
            Return Voucher
          </Button>
          <Button
            variant="contained"
            startIcon={<VoidIcon />}
            onClick={() => setVoidDialogOpen(true)}
            disabled={voucher.is_void || voucher.is_deleted || loading}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: "1rem", md: "1.1rem" },
              minWidth: { xs: "200px", md: "auto" },
              backgroundColor: "#f44336",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
              "&:disabled": {
                backgroundColor: "#cccccc",
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Voiding...
              </>
            ) : (
              "Void Voucher"
            )}
          </Button>
          <Button
            variant="contained"
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: "1rem", md: "1.1rem" },
              minWidth: { xs: "200px", md: "auto" },
              backgroundColor: "#1976d2",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#115293",
                color: "#fff",
              },
            }}
            onClick={handlePrint}
          >
            Print
          </Button>
        </Box>
      </Paper>

      {/* Void Confirmation Dialog */}
      <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)}>
        <DialogTitle>Confirm Void Voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to void this purchase voucher? This action
            cannot be undone.
          </Typography>
          <Box
            sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant="subtitle2">
              Voucher: {voucher.voucher_id}
            </Typography>
            <Typography variant="body2">
              Date: {new Date(voucher.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Supplier: {voucher.metadata?.supplier || "N/A"}
            </Typography>
            <Typography variant="body2">
              Amount: ${voucher.metadata?.totalAmount?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoidDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleVoidConfirm}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Voiding..." : "Void Voucher"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Void Entry Confirmation Dialog */}
      <Dialog
        open={voidEntryDialogOpen.open}
        onClose={() => setVoidEntryDialogOpen({ open: false, entry: null })}
      >
        <DialogTitle>Confirm Void Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to void this entry? This action cannot be
            undone.
          </Typography>
          <Box
            sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant="subtitle2">
              Item: {voidEntryDialogOpen.entry?.metadata?.itemName || "N/A"}
            </Typography>
            <Typography variant="body2">
              Qty: {voidEntryDialogOpen.entry?.metadata?.quantity || "N/A"}
            </Typography>
            <Typography variant="body2">
              Amount:{" "}
              {voidEntryDialogOpen.entry?.metadata?.total?.toFixed(2) || "N/A"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setVoidEntryDialogOpen({ open: false, entry: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleVoidEntry(voidEntryDialogOpen.entry)}
            color="error"
            variant="contained"
            disabled={
              entryLoading ===
              (voidEntryDialogOpen.entry?._id || voidEntryDialogOpen.entry?.id)
            }
          >
            {entryLoading ===
            (voidEntryDialogOpen.entry?._id || voidEntryDialogOpen.entry?.id)
              ? "Voiding..."
              : "Void Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PurchaseVoucherDetail;
