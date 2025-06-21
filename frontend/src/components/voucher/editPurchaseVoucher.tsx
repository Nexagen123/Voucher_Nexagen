import React, { useState, useEffect } from "react";
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
  Card,
  IconButton,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  AutoAwesome as AutoIcon,
} from "@mui/icons-material";
import { updateVoucher } from "../../api/axios";

// Define interfaces for type safety
interface Supplier {
  id: string;
  name: string;
}

// Define interfaces for type safety
interface PurchaseItem {
  id: string;
  item: string;
  category: Category | null;
  rate: number;
  quantity: number;
  unit: string;
  gst: number;
  total: number;
}

interface PurchaseVoucher {
  id: string;
  _id?: string;
  prvId: string;
  dated: string;
  description?: string;
  entries: number;
  status?: "Submitted" | "Voided";
  items?: PurchaseItem[];
  supplier?: string;
  closingBalance?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface EditPurchaseVoucherProps {
  voucher: PurchaseVoucher;
  onBack: () => void;
  onSave: (voucher: PurchaseVoucher) => void;
}

// Define interfaces for type safety
interface Category {
  id: string;
  name: string;
}

const EditPurchaseVoucher: React.FC<EditPurchaseVoucherProps> = ({
  voucher,
  onBack,
  onSave,
}) => {
  // Sample data for suppliers (should be fetched from backend in production)
  const [suppliers] = useState<Supplier[]>([
    { id: "1", name: "ABC Electronics Ltd." },
    { id: "2", name: "XYZ Trading Co." },
    { id: "3", name: "Global Supplies Inc." },
    { id: "4", name: "Tech Solutions Pvt Ltd." },
    { id: "5", name: "Premium Goods Co." },
  ]);

  // Sample categories (should be fetched from backend in production)
  const [categories] = useState<Category[]>([
    { id: "cat1", name: "Electronics" },
    { id: "cat2", name: "Clothing" },
    { id: "cat3", name: "Food & Beverages" },
    { id: "cat4", name: "Books" },
    { id: "cat5", name: "Home & Garden" },
    { id: "cat6", name: "Furniture" },
  ]);

  // Sample units
  const [units] = useState(["Pieces", "Kg", "Liters", "Meters", "Boxes"]);

  // State for voucher details
  const [voucherDate, setVoucherDate] = useState(
    formatDateToInput(voucher.dated)
  );
  // Store selectedSupplier as a Supplier object (or null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    () => {
      // Try to find supplier by id or name from voucher
      if (voucher.supplier) {
        // If voucher.supplier is an ID, find by id; if name, find by name
        return (
          suppliers.find(
            (s) => s.id === voucher.supplier || s.name === voucher.supplier
          ) || null
        );
      }
      return null;
    }
  );
  const [closingBalance, setClosingBalance] = useState(
    voucher.closingBalance?.toString() || ""
  );

  // State for purchase items - initialize with voucher items or from entries
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>(
    voucher.items && voucher.items.length > 0
      ? voucher.items.map((item) => {
          const itemCategory = item.category;
          let categoryObj: Category | null = null;
          if (typeof itemCategory === "object" && itemCategory !== null) {
            categoryObj = itemCategory;
          } else if (typeof itemCategory === "string") {
            categoryObj =
              categories.find(
                (c) => c.id === itemCategory || c.name === itemCategory
              ) || null;
          }
          return {
            id: item.id || generateId(),
            item: item.item || "",
            category: categoryObj,
            rate: item.rate || 0,
            quantity: item.quantity || 0,
            unit: item.unit || "",
            gst: item.gst || 0,
            total: item.total || 0,
          };
        })
      : Array.isArray((voucher as any).entries) &&
        (voucher as any).entries.length > 0
      ? mapEntriesToItems((voucher as any).entries)
      : [
          {
            id: generateId(),
            item: "",
            category: null,
            rate: 0,
            quantity: 0,
            unit: "",
            gst: 0,
            total: 0,
          },
        ]
  );

  // Update form fields if voucher prop changes
  useEffect(() => {
    setVoucherDate(formatDateToInput(voucher.dated));
    // Update selectedSupplier from voucher (by id or name)
    if (voucher.supplier) {
      setSelectedSupplier(
        suppliers.find(
          (s) => s.id === voucher.supplier || s.name === voucher.supplier
        ) || null
      );
    } else {
      setSelectedSupplier(null);
    }
    setClosingBalance(voucher.closingBalance?.toString() || "");
    setPurchaseItems(
      voucher.items && voucher.items.length > 0
        ? voucher.items.map((item) => {
            const itemCategory = item.category;
            let categoryObj: Category | null = null;
            if (typeof itemCategory === "object" && itemCategory !== null) {
              categoryObj = itemCategory;
            } else if (typeof itemCategory === "string") {
              categoryObj =
                categories.find(
                  (c) => c.id === itemCategory || c.name === itemCategory
                ) || null;
            }
            return {
              id: item.id || generateId(),
              item: item.item || "",
              category: categoryObj,
              rate: item.rate || 0,
              quantity: item.quantity || 0,
              unit: item.unit || "",
              gst: item.gst || 0,
              total: item.total || 0,
            };
          })
        : Array.isArray((voucher as any).entries) &&
          (voucher as any).entries.length > 0
        ? mapEntriesToItems((voucher as any).entries)
        : [
            {
              id: generateId(),
              item: "",
              category: null,
              rate: 0,
              quantity: 0,
              unit: "",
              gst: 0,
              total: 0,
            },
          ]
    );
  }, [voucher, suppliers, categories]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Function to generate unique ID
  function generateId() {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Function to calculate total including GST
  const calculateTotal = (
    rate: number,
    quantity: number,
    gst: number
  ): number => {
    const safeRate = Number(rate) || 0;
    const safeQuantity = Number(quantity) || 0;
    const safeGst = Number(gst) || 0;

    const subtotal = safeRate * safeQuantity;
    const gstAmount = (subtotal * safeGst) / 100;
    return subtotal + gstAmount;
  };

  // Show snackbar
  const showSnackbar = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to handle input changes
  const handleInputChange = (
    id: string,
    field: keyof PurchaseItem,
    value: any
  ) => {
    setPurchaseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total when rate, quantity, or GST changes
          if (field === "rate" || field === "quantity" || field === "gst") {
            updatedItem.total = calculateTotal(
              field === "rate" ? Number(value) : item.rate || 0,
              field === "quantity" ? Number(value) : item.quantity || 0,
              field === "gst" ? Number(value) : item.gst || 0
            );
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Function to add new row
  const addNewRow = () => {
    const newItem: PurchaseItem = {
      id: generateId(),
      item: "",
      category: null,
      rate: 0,
      quantity: 0,
      unit: "",
      gst: 0,
      total: 0,
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  // Utility to format date to yyyy-MM-dd
  function formatDateToInput(dateString: string): string {
    if (!dateString) return "";
    // Handles both ISO and yyyy-MM-dd
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // fallback
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Utility to map entries to items for edit form
  function mapEntriesToItems(entries: any[]): PurchaseItem[] {
    if (!Array.isArray(entries)) return [];
    return entries.flatMap((entryDoc: any) =>
      Array.isArray(entryDoc.entries)
        ? entryDoc.entries.map((entry: any) => {
            const entryCategory = entry.metadata?.category;
            let categoryObj: Category | null = null;
            if (typeof entryCategory === "object" && entryCategory !== null) {
              categoryObj = entryCategory;
            } else if (typeof entryCategory === "string") {
              categoryObj =
                categories.find(
                  (c) => c.id === entryCategory || c.name === entryCategory
                ) || null;
            }
            return {
              id:
                entry._id ||
                entry.id ||
                `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              item: entry.metadata?.itemName || entry.description || "",
              category: categoryObj,
              rate: entry.rate || entry.metadata?.rate || 0,
              quantity: entry.quantity || entry.metadata?.quantity || 0,
              unit: entry.metadata?.unit || "",
              gst: entry.metadata?.gst || 0,
              total: entry.debit || entry.metadata?.total || 0,
            };
          })
        : []
    );
  }

  // Function to handle form submission
  const handleSave = async () => {
    // Validate that all required fields are filled
    const isValid =
      voucherDate.trim() !== "" &&
      selectedSupplier !== null &&
      purchaseItems.every(
        (item) =>
          item.item.trim() !== "" &&
          item.category !== null &&
          item.category.id &&
          item.rate > 0 &&
          item.quantity > 0 &&
          item.unit !== ""
      );

    if (!isValid) {
      showSnackbar("Please fill in all required fields.", "error");
      return;
    }

    try {
      setLoading(true);
      // Prepare data for backend API
      const transactions = purchaseItems.map((item) => ({
        account: item.category?.id || "", // Send category id as account
        description: item.item,
        credit: 0,
        debit: item.total,
        rate: item.rate,
        quantity: item.quantity,
        unit: item.unit,
        gst: item.gst,
        metadata: {
          itemName: item.item,
          category: item.category?.id || "",
          categoryName: item.category?.name || "",
          gst: item.gst,
          rate: item.rate,
          quantity: item.quantity,
          unit: item.unit,
          total: item.total,
        },
      }));
      const voucherData = {
        date: formatDateToInput(voucherDate), // always send yyyy-MM-dd
        transactions,
        type: "purchase",
        metadata: {
          supplier: selectedSupplier?.id, // Send supplier ID to backend
          supplierName: selectedSupplier?.name, // Optionally send name for display
          closingBalance: parseFloat(closingBalance) || 0,
          totalAmount: purchaseItems.reduce(
            (sum, i) => sum + (i.total || 0),
            0
          ),
          itemsCount: purchaseItems.length,
        },
      };
      // Use the MongoDB _id for the API call, or fallback to voucher.id
      const voucherId = voucher._id || voucher.id;
      const response = await updateVoucher(voucherId, voucherData);
      const result = response.data;

      if (result && (result.success || result.updatedVoucher)) {
        showSnackbar(`Purchase voucher updated successfully!`, "success");
        // Update the voucher object and call onSave
        const updatedVoucher = {
          ...voucher,
          dated: voucherDate,
          supplier: selectedSupplier?.id || "",
          closingBalance: parseFloat(closingBalance) || 0,
          items: purchaseItems,
          entries: purchaseItems.length,
        };
        setTimeout(() => {
          onSave(updatedVoucher);
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update voucher");
      }
    } catch (error: any) {
      console.error("Error updating purchase voucher:", error);
      showSnackbar(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update purchase voucher. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

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
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Main Content Container */}
      <Box sx={{ width: "100%", mx: "auto" }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            mb: { xs: 2, md: 3 },
            borderRadius: { xs: 1, md: 2 },
            mx: { xs: 0, md: 0 },
            width: "100%",
          }}
        >
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
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <EditIcon fontSize="large" />
              Edit Purchase Voucher
            </Typography>
          </Box>

          {/* Voucher ID Display */}
          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              p: { xs: 2, md: 3 },
              borderRadius: 1,
              mb: { xs: 2, md: 3 },
              border: "1px solid #E0E0E0",
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <AutoIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Editing Voucher ID:
            </Typography>
            <Chip
              label={voucher.prvId || voucher.id}
              color="primary"
              sx={{
                fontFamily: "monospace",
                fontSize: "1rem",
                fontWeight: "bold",
                px: 2,
                py: 1,
              }}
            />
          </Box>

          {/* Voucher Details Section */}
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "1fr 1fr 1fr",
                },
                gap: { xs: 2, md: 3 },
                mb: 2,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Date
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={voucherDate}
                  onChange={(e) => setVoucherDate(e.target.value)}
                  variant="outlined"
                  slotProps={{
                    htmlInput: {
                      max: "2099-12-31",
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Supplier
                </Typography>
                {/* Supplier Autocomplete */}
                <Autocomplete
                  size="small"
                  options={suppliers}
                  getOptionLabel={(option) => option.name}
                  value={selectedSupplier}
                  onChange={(_, newValue) => {
                    setSelectedSupplier(newValue as Supplier | null);
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select supplier"
                      variant="outlined"
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    const filtered = options.filter((option) =>
                      option.name
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    );
                    return filtered;
                  }}
                />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ mb: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}
                >
                  Closing balance
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={closingBalance}
                  // Remove onChange to make it fixed and not editable
                  placeholder="0.00"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    sx: {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Purchase Items Table */}
          <Box sx={{ mb: { xs: 2, md: 3 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Purchase Items
            </Typography>

            <Card sx={{ overflow: "hidden" }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#3da0bd" }}>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 150,
                        }}
                      >
                        Item Name
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 120,
                        }}
                      >
                        Category
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 100,
                        }}
                      >
                        Rate
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 100,
                        }}
                      >
                        Quantity
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 100,
                        }}
                      >
                        Unit
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 80,
                        }}
                      >
                        GST %
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          minWidth: 100,
                        }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        sx={{ color: "white", fontWeight: "bold", width: 60 }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseItems.map((item) => (
                      <TableRow
                        key={item.id}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                        }}
                      >
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={item.item}
                            onChange={(e) =>
                              handleInputChange(item.id, "item", e.target.value)
                            }
                            placeholder="Enter item name"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={categories}
                            getOptionLabel={(option) => option.name}
                            value={item.category}
                            onChange={(_, newValue) =>
                              handleInputChange(
                                item.id,
                                "category",
                                newValue || null
                              )
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select category"
                                variant="outlined"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleInputChange(
                                item.id,
                                "rate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0.00"
                            variant="outlined"
                            slotProps={{
                              htmlInput: { min: 0, step: 0.01 },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleInputChange(
                                item.id,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            variant="outlined"
                            slotProps={{
                              htmlInput: { min: 0, step: 1 },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={units}
                            value={item.unit}
                            onChange={(_, newValue) =>
                              handleInputChange(item.id, "unit", newValue || "")
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select unit"
                                variant="outlined"
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            value={item.gst}
                            onChange={(e) =>
                              handleInputChange(
                                item.id,
                                "gst",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            variant="outlined"
                            slotProps={{
                              htmlInput: { min: 0, max: 100, step: 0.1 },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            ₹{(item.total || 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (purchaseItems.length > 1) {
                                setPurchaseItems(
                                  purchaseItems.filter((i) => i.id !== item.id)
                                );
                              }
                            }}
                            disabled={purchaseItems.length === 1}
                            sx={{ color: "#f44336" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Add New Row Button */}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewRow}
                sx={{
                  borderColor: "#3da0bd",
                  color: "#3da0bd",
                  "&:hover": {
                    borderColor: "#B575E8",
                    backgroundColor: "#f8f4ff",
                  },
                }}
              >
                Add New Item
              </Button>
            </Box>

            {/* Total Summary */}
            <Box sx={{ mt: 2, textAlign: "right" }}>
              <Typography variant="h6" fontWeight="bold">
                Grand Total: ₹
                {purchaseItems
                  .reduce((sum, item) => sum + (item.total || 0), 0)
                  .toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, md: 3 },
              justifyContent: { xs: "center", md: "flex-end" },
              flexDirection: { xs: "column", sm: "row" },
              mt: { xs: 2, md: 3 },
            }}
          >
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={loading}
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 1.5, md: 1 },
                fontSize: { xs: "1rem", md: "1.1rem" },
                minWidth: { xs: "200px", md: "auto" },
                borderRadius: 1,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              sx={{
                px: { xs: 3, md: 4 },
                py: { xs: 1.5, md: 1 },
                fontSize: { xs: "1rem", md: "1.1rem" },
                minWidth: { xs: "200px", md: "auto" },
                borderRadius: 1,
                backgroundColor: "#4CAF50",
                "&:hover": {
                  backgroundColor: "#45a049",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon sx={{ mr: 1 }} />
                  Save Changes
                </>
              )}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for notifications */}
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

export default EditPurchaseVoucher;
