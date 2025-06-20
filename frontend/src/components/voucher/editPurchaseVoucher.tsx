import React, { useState } from "react";
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

// Define interfaces for type safety
interface PurchaseItem {
  id: string;
  item: string;
  category: string;
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
  status?: 'Submitted' | 'Voided';
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

const EditPurchaseVoucher: React.FC<EditPurchaseVoucherProps> = ({
  voucher,
  onBack,
  onSave,
}) => {
  // Sample data for suppliers
  const [suppliers] = useState([
    { id: "1", name: "ABC Electronics Ltd." },
    { id: "2", name: "XYZ Trading Co." },
    { id: "3", name: "Global Supplies Inc." },
    { id: "4", name: "Tech Solutions Pvt Ltd." },
    { id: "5", name: "Premium Goods Co." },
  ]);

  // Sample categories
  const [categories] = useState([
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Books",
    "Home & Garden",
    "Furniture",
  ]);

  // Sample units
  const [units] = useState([
    "Pieces",
    "Kg",
    "Liters",
    "Meters",
    "Boxes",
  ]);

  // State for voucher details
  const [voucherDate, setVoucherDate] = useState(voucher.dated);
  const [selectedSupplier, setSelectedSupplier] = useState(voucher.supplier || "");
  const [closingBalance, setClosingBalance] = useState(voucher.closingBalance?.toString() || "");

  // State for purchase items - initialize with voucher items or default
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>(
    voucher.items && voucher.items.length > 0
      ? voucher.items.map(item => ({
          id: item.id || generateId(),
          item: item.item || "",
          category: item.category || "",
          rate: item.rate || 0,
          quantity: item.quantity || 0,
          unit: item.unit || "",
          gst: item.gst || 0,
          total: item.total || 0
        }))
      : [{
          id: generateId(),
          item: "",
          category: "",
          rate: 0,
          quantity: 0,
          unit: "",
          gst: 0,
          total: 0,
        }]
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Function to generate unique ID
  function generateId() {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Function to calculate total including GST
  const calculateTotal = (rate: number, quantity: number, gst: number): number => {
    const safeRate = Number(rate) || 0;
    const safeQuantity = Number(quantity) || 0;
    const safeGst = Number(gst) || 0;

    const subtotal = safeRate * safeQuantity;
    const gstAmount = (subtotal * safeGst) / 100;
    return subtotal + gstAmount;
  };

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to handle input changes
  const handleInputChange = (id: string, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total when rate, quantity, or GST changes
          if (field === "rate" || field === "quantity" || field === "gst") {
            updatedItem.total = calculateTotal(
              field === "rate" ? Number(value) : (item.rate || 0),
              field === "quantity" ? Number(value) : (item.quantity || 0),
              field === "gst" ? Number(value) : (item.gst || 0)
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
      category: "",
      rate: 0,
      quantity: 0,
      unit: "",
      gst: 0,
      total: 0,
    };
    setPurchaseItems([...purchaseItems, newItem]);
  };

  // Function to handle form submission
  const handleSave = async () => {
    // Validate that all required fields are filled
    const isValid =
      voucherDate.trim() !== "" &&
      selectedSupplier !== "" &&
      purchaseItems.every(
        (item) =>
          item.item.trim() !== "" &&
          item.category !== "" &&
          item.rate > 0 &&
          item.quantity > 0 &&
          item.unit !== ""
      );

    if (!isValid) {
      showSnackbar("Please fill in all required fields.", 'error');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for backend API
      const voucherData = {
        date: voucherDate,
        supplier: selectedSupplier,
        closingBalance: parseFloat(closingBalance) || 0,
        items: purchaseItems.map(item => ({
          itemName: item.item,
          quantity: item.quantity,
          rate: item.rate,
          unit: item.unit,
          category: item.category,
          gst: item.gst,
          total: item.total
        }))
      };

      const token = localStorage.getItem('token');

      // Use the MongoDB _id for the API call, or fallback to voucher.id
      const voucherId = voucher._id || voucher.id;

      const response = await fetch(`http://localhost:5000/api/vouchers/${voucherId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voucherData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Purchase voucher updated:", result);

      if (result.success) {
        showSnackbar(`Purchase voucher updated successfully!`, 'success');

        // Update the voucher object and call onSave
        const updatedVoucher = {
          ...voucher,
          dated: voucherDate,
          supplier: selectedSupplier,
          closingBalance: parseFloat(closingBalance) || 0,
          items: purchaseItems,
          entries: purchaseItems.length,
        };

        setTimeout(() => {
          onSave(updatedVoucher);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update voucher');
      }

    } catch (error) {
      console.error('Error updating purchase voucher:', error);
      showSnackbar('Failed to update purchase voucher. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
            <EditIcon fontSize="large" />
            Edit Purchase Voucher
          </Typography>
        </Box>

        {/* Voucher ID Display */}
        <Box sx={{
          backgroundColor: '#FFFFFF',
          p: { xs: 2, md: 3 },
          borderRadius: 1,
          mb: { xs: 2, md: 3 },
          border: '1px solid #E0E0E0',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          <AutoIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Editing Voucher ID:
          </Typography>
          <Chip
            label={voucher.prvId || voucher.id}
            color="primary"
            sx={{
              fontFamily: 'monospace',
              fontSize: '1rem',
              fontWeight: 'bold',
              px: 2,
              py: 1
            }}
          />
        </Box>

        {/* Voucher Details Section */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr'
            },
            gap: { xs: 2, md: 3 },
            mb: 2
          }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
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
                    max: "2099-12-31"
                  }
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Supplier
              </Typography>
              <Autocomplete
                size="small"
                options={suppliers}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                value={suppliers.find(supplier => supplier.name === selectedSupplier) || null}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    setSelectedSupplier(newValue.name);
                  } else {
                    setSelectedSupplier('');
                  }
                }}
                // Remove inputValue and onInputChange to disable free typing
                freeSolo={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select supplier"
                    variant="outlined"
                  />
                )}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter((option) =>
                    option.name.toLowerCase().includes(inputValue.toLowerCase())
                  );
                  return filtered;
                }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
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
                    backgroundColor: "#f5f5f5"
                  }
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

          <Card sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#3da0bd' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}>
                      Item Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}>
                      Category
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>
                      Rate
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>
                      Quantity
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>
                      Unit
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 80 }}>
                      GST %
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: 100 }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 60 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseItems.map((item, index) => (
                    <TableRow key={item.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.item}
                          onChange={(e) => handleInputChange(item.id, "item", e.target.value)}
                          placeholder="Enter item name"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={categories}
                          value={item.category}
                          onChange={(_, newValue) => handleInputChange(item.id, "category", newValue || "")}
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
                          onChange={(e) => handleInputChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          variant="outlined"
                          slotProps={{
                            htmlInput: { min: 0, step: 0.01 }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleInputChange(item.id, "quantity", parseInt(e.target.value) || 0)}
                          placeholder="0"
                          variant="outlined"
                          slotProps={{
                            htmlInput: { min: 0, step: 1 }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          size="small"
                          options={units}
                          value={item.unit}
                          onChange={(_, newValue) => handleInputChange(item.id, "unit", newValue || "")}
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
                          onChange={(e) => handleInputChange(item.id, "gst", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          variant="outlined"
                          slotProps={{
                            htmlInput: { min: 0, max: 100, step: 0.1 }
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
                              setPurchaseItems(purchaseItems.filter(i => i.id !== item.id));
                            }
                          }}
                          disabled={purchaseItems.length === 1}
                          sx={{ color: '#f44336' }}
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
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addNewRow}
              sx={{
                borderColor: '#3da0bd',
                color: '#3da0bd',
                '&:hover': {
                  borderColor: '#B575E8',
                  backgroundColor: '#f8f4ff',
                },
              }}
            >
              Add New Item
            </Button>
          </Box>

          {/* Total Summary */}
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="h6" fontWeight="bold">
              Grand Total: ₹{purchaseItems.reduce((sum, item) => sum + (item.total || 0), 0).toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 2, md: 3 },
          justifyContent: { xs: 'center', md: 'flex-end' },
          flexDirection: { xs: 'column', sm: 'row' },
          mt: { xs: 2, md: 3 }
        }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={loading}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              minWidth: { xs: '200px', md: 'auto' },
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
              fontSize: { xs: '1rem', md: '1.1rem' },
              minWidth: { xs: '200px', md: 'auto' },
              borderRadius: 1,
              backgroundColor: '#4CAF50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditPurchaseVoucher;
