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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

// Define interfaces for type safety
interface SalesItem {
  id: string;
  item: string;
  dzn: number;
  pcs: number;
  rate: number;
  category: string;
  detail: string;
  disc: number;      // Discount amount
  discPercent: number; // Discount percentage
  exDisc: number;    // Extra discount percentage
  total: number;
  debit?: number;
  credit?: number;
}

interface Party {
  id: string;
  name: string;
}

const SalesVoucher: React.FC = () => {
  // Sample data for parties
  const [parties] = useState<Party[]>([
    { id: "1", name: "ABC Retail Store" },
    { id: "2", name: "XYZ Wholesale Co." },
    { id: "3", name: "Global Distributors" },
    { id: "4", name: "Premium Sales Ltd." },
    { id: "5", name: "Local Market Co." },
  ]);

  // Sample categories
  const [categories] = useState<string[]>([
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Books",
    "Home & Garden",
    "Furniture",
  ]);

  // State for voucher details - store in yyyy-mm-dd format for date input
  const [voucherDate, setVoucherDate] = useState("");

  // Helper function to format date to dd/mm/yyyy for display
  const formatDateToDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };


  const [selectedParty, setSelectedParty] = useState("");
  const [carton, setCarton] = useState("");
  const [closingBalance, setClosingBalance] = useState("");

  // State for sales items
  const [salesItems, setSalesItems] = useState<SalesItem[]>([
    {
      id: "1",
      item: "",
      dzn: 0,
      pcs: 0,
      rate: 0,
      category: "",
      detail: "",
      disc: 0,
      discPercent: 0,
      exDisc: 0,
      total: 0,
      debit: 0,
      credit: 0,
    },
  ]);

  // Function to generate unique ID
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  };

  // Function to calculate total with discounts
  const calculateTotal = (
    dzn: number,
    pcs: number,
    rate: number,
    disc: number,
    exDisc: number
  ): number => {
    const totalPieces = dzn * 12 + pcs; // Assuming 1 dozen = 12 pieces
    const subtotal = totalPieces * rate;
    const discountAmount = (subtotal * disc) / 100;
    const afterDiscount = subtotal - discountAmount;
    const exDiscountAmount = (afterDiscount * exDisc) / 100;
    return afterDiscount - exDiscountAmount;
  };

  // Function to handle input changes
  const handleInputChange = (
    id: string,
    field: keyof SalesItem,
    value: string | number
  ) => {
    setSalesItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total when relevant fields change
          if (["dzn", "pcs", "rate", "disc", "discPercent", "exDisc"].includes(field)) {
            const totalPieces = field === "dzn" ? Number(value) : item.dzn;
            const pcs = field === "pcs" ? Number(value) : item.pcs;
            const rate = field === "rate" ? Number(value) : item.rate;
            const disc = field === "disc" ? Number(value) : item.disc;
            const discPercent = field === "discPercent" ? Number(value) : item.discPercent;
            const exDisc = field === "exDisc" ? Number(value) : item.exDisc;

            let subtotal = (totalPieces * 12 + pcs) * rate;
            let discAmount = disc;
            if (discPercent > 0) {
              discAmount += (subtotal * discPercent) / 100;
            }
            let afterDisc = subtotal - discAmount;
            let exDiscAmount = (afterDisc * exDisc) / 100;
            updatedItem.total = afterDisc - exDiscAmount;
          }

          return updatedItem;
        }
        return item;
      })
    );
  };

  // Function to add new row
  const addNewRow = () => {
    const newItem: SalesItem = {
      id: generateId(),
      item: "",
      dzn: 0,
      pcs: 0,
      rate: 0,
      category: "",
      detail: "",
      disc: 0,
      discPercent: 0,
      exDisc: 0,
      total: 0,
      debit: 0,
      credit: 0,
    };
    setSalesItems([...salesItems, newItem]);
  };

  // Function to handle form submission
  const handleSave = async () => {
    // Validate that all required fields are filled
    const isValid =
      voucherDate.trim() !== "" &&
      selectedParty !== "" &&
      salesItems.every(
        (item) =>
          item.item.trim() !== "" &&
          item.category !== "" &&
          item.rate > 0 &&
          (item.dzn > 0 || item.pcs > 0)
      );

    if (!isValid) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      // Prepare data for backend API
      const voucherData = {
        date: formatDateToDisplay(voucherDate), // Convert to dd/mm/yyyy for display/storage
        party: selectedParty,
        items: salesItems.map(item => ({
          itemName: item.item,
          quantity: item.dzn + item.pcs, // Combine dzn and pcs as total quantity
          rate: item.rate,
          category: item.category,
          detail: item.detail,
          disc: item.disc,
          exDisc: item.exDisc,
          total: item.total
        }))
      };

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/vouchers/sales', {
        method: 'POST',
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
      console.log("Sales voucher saved:", result);

      if (result.success) {
        alert(`Sales voucher saved successfully! Voucher ID: ${result.data.id}`);
      } else {
        throw new Error(result.message || 'Failed to save voucher');
      }

      // Reset form
      setVoucherDate("");
      setSelectedParty("");
      setCarton("");
      setClosingBalance("");
      setSalesItems([
        {
          id: generateId(),
          item: "",
          dzn: 0,
          pcs: 0,
          rate: 0,
          category: "",
          detail: "",
          disc: 0,
          discPercent: 0,
          exDisc: 0,
          total: 0,
        },
      ]);
    } catch (error) {
      console.error('Error saving sales voucher:', error);
      alert('Failed to save sales voucher. Please check if the backend server is running.');
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
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
          >
            Sales Voucher
          </Typography>
        </Box>

        {/* Voucher Details Section */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr'
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
                Party
              </Typography>
              <Autocomplete
                size="small"
                options={parties}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                value={parties.find(party => party.name === selectedParty) || null}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') {
                    setSelectedParty(newValue.name);
                  } else {
                    setSelectedParty('');
                  }
                }}
                // Remove inputValue and onInputChange to disable free typing
                freeSolo={false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select party"
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
                Carton
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={carton}
                onChange={(e) => setCarton(e.target.value)}
                placeholder="0"
                variant="outlined"
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
                placeholder="0.00"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: {
                    backgroundColor: "#f5f5f5" // grey background, matches total field
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Items - Mobile Card Layout */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
          {salesItems.map((item, index) => (
            <Card key={item.id} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  Item #{index + 1}
                </Typography>
                {salesItems.length > 1 && (
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSalesItems(salesItems.filter(i => i.id !== item.id));
                    }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Item</Typography>
                  <Autocomplete
                    size="small"
                    options={['Shirt', 'Pants', 'Jacket', 'Shoes', 'T-Shirt', 'Jeans', 'Dress', 'Sweater']}
                    getOptionLabel={(option) => option}
                    value={item.item || null}
                    onChange={(_, newValue) => {
                      handleInputChange(item.id, "item", newValue || '');
                    }}
                    inputValue={item.item}
                    onInputChange={(_, newInputValue) => {
                      handleInputChange(item.id, "item", newInputValue);
                    }}
                    freeSolo={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or type item name"
                        variant="outlined"
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const filtered = options.filter((option) =>
                        option.toLowerCase().includes(inputValue.toLowerCase())
                      );
                      return filtered;
                    }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>DZN</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.dzn || ""}
                      onChange={(e) => handleInputChange(item.id, "dzn", Number(e.target.value))}
                      placeholder="0"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>PCS</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.pcs || ""}
                      onChange={(e) => handleInputChange(item.id, "pcs", Number(e.target.value))}
                      placeholder="0"
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Rate</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.rate || ""}
                    onChange={(e) => handleInputChange(item.id, "rate", Number(e.target.value))}
                    placeholder="0.00"
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Category</Typography>
                  <Autocomplete
                    size="small"
                    options={categories}
                    getOptionLabel={(option) => option}
                    value={item.category || null}
                    onChange={(_, newValue) => {
                      handleInputChange(item.id, "category", newValue || '');
                    }}
                    inputValue={item.category}
                    onInputChange={(_, newInputValue) => {
                      handleInputChange(item.id, "category", newInputValue);
                    }}
                    freeSolo={true}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select or type category"
                        variant="outlined"
                      />
                    )}
                    filterOptions={(options, { inputValue }) => {
                      const filtered = options.filter((option) =>
                        option.toLowerCase().includes(inputValue.toLowerCase())
                      );
                      return filtered;
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Detail</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={item.detail}
                    onChange={(e) => handleInputChange(item.id, "detail", e.target.value)}
                    placeholder="Enter detail"
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Disc</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.disc || ""}
                      onChange={(e) => handleInputChange(item.id, "disc", Number(e.target.value))}
                      placeholder="0"
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Disc (%)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.discPercent || ""}
                      onChange={(e) => handleInputChange(item.id, "discPercent", Number(e.target.value))}
                      placeholder="0"
                      InputProps={{
                        endAdornment: <span style={{ color: '#888', fontSize: 12 }}>%</span>
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Ex.Disc (%)</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.exDisc || ""}
                      onChange={(e) => handleInputChange(item.id, "exDisc", Number(e.target.value))}
                      placeholder="0"
                      InputProps={{
                        endAdornment: <span style={{ color: '#888', fontSize: 12 }}>%</span>
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 1, backgroundColor: '#e8f5e8', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>Total</Typography>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    ${item.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Items Table - Desktop Layout */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ mb: 3, width: "100%" }}
          >
            <Table sx={{ minWidth: 1400 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", minWidth: 180, p: 2 }}>
                  ITEM
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  DZN
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  PCS
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 120, p: 2 }}>
                  Rate
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 140, p: 2 }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 160, p: 2 }}>
                  Detail
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  Disc
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  Disc%
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  Ex.Disc%
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 140, p: 2 }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  Debit
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", minWidth: 100, p: 2 }}>
                  Credit
                </TableCell>
                {/* Removed ACTIONS column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {salesItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={{ p: 2 }}>
                    <Autocomplete
                      size="small"
                      options={['Shirt', 'Pants', 'Jacket', 'Shoes', 'T-Shirt', 'Jeans', 'Dress', 'Sweater']}
                      getOptionLabel={(option) => option}
                      value={item.item || null}
                      onChange={(_, newValue) => {
                        handleInputChange(item.id, "item", newValue || '');
                      }}
                      inputValue={item.item}
                      onInputChange={(_, newInputValue) => {
                        handleInputChange(item.id, "item", newInputValue);
                      }}
                      freeSolo={true}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select or type item"
                          variant="outlined"
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const filtered = options.filter((option) =>
                          option.toLowerCase().includes(inputValue.toLowerCase())
                        );
                        return filtered;
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.dzn || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "dzn",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.pcs || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "pcs",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.rate || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "rate",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0.00"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <Autocomplete
                      size="small"
                      options={categories}
                      getOptionLabel={(option) => option}
                      value={item.category || null}
                      onChange={(_, newValue) => {
                        handleInputChange(item.id, "category", newValue || '');
                      }}
                      inputValue={item.category}
                      onInputChange={(_, newInputValue) => {
                        handleInputChange(item.id, "category", newInputValue);
                      }}
                      freeSolo={true}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select or type category"
                          variant="outlined"
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const filtered = options.filter((option) =>
                          option.toLowerCase().includes(inputValue.toLowerCase())
                        );
                        return filtered;
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.detail}
                      onChange={(e) =>
                        handleInputChange(item.id, "detail", e.target.value)
                      }
                      placeholder="Enter detail"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.disc || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "disc",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.discPercent || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "discPercent",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                      InputProps={{
                        endAdornment: <span style={{ color: '#888', fontSize: 12 }}>%</span>
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.exDisc || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "exDisc",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                      InputProps={{
                        endAdornment: <span style={{ color: '#888', fontSize: 12 }}>%</span>
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.total.toFixed(2)}
                      variant="outlined"
                      disabled
                      sx={{
                        "& .MuiInputBase-input": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.debit || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "debit",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ p: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={item.credit || ""}
                      onChange={(e) =>
                        handleInputChange(
                          item.id,
                          "credit",
                          Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      variant="outlined"
                    />
                  </TableCell>
                  {/* Removed ACTIONS cell */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        </Box>

        {/* Add Row Button */}
        <Box sx={{
          display: "flex",
          justifyContent: { xs: "center", md: "flex-end" },
          mb: { xs: 2, md: 3 }
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addNewRow}
            sx={{
              backgroundColor: "#4fc3f7",
              "&:hover": {
                backgroundColor: "#29b6f6",
              },
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: '0.9rem', md: '1rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '300px', sm: 'none' }
            }}
          >
            Add Row
          </Button>
        </Box>

        {/* Save Button */}
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          mb: { xs: 2, md: 0 }
        }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: "#4caf50",
              "&:hover": {
                backgroundColor: "#45a049",
              },
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '300px', sm: 'none' }
            }}
          >
            SAVE
          </Button>
        </Box>
      </Paper>
      </Box>
    </Box>
  );
};

export default SalesVoucher;