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
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { addGatePass } from "../../api/axios";


const PRIMARY_COLOR = "#3da0bd";

interface ProductRow {
  id: string;
  productName: string;
  detail: string;
  qty: number | "";
  unit: string;
}

const units = ["Pieces", "Kg", "Liters", "Meters", "Boxes"];

const AddGatePass: React.FC = () => {
  const [date, setDate] = useState("");
  const [party, setParty] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [type, setType] = useState<"Incoming" | "Outgoing">("Incoming");
  const [rows, setRows] = useState<ProductRow[]>([
    { id: Date.now().toString(), productName: "", detail: "", qty: "", unit: "" },
  ]);

  const handleRowChange = (id: string, field: keyof ProductRow, value: any) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).slice(2), productName: "", detail: "", qty: "", unit: "" },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.length > 1 ? prev.filter((row) => row.id !== id) : prev);
  };

  const handleSave = async() => {
    console.log({ date, party, orderNo, type, rows });
    const gatepassData = { date, party, orderNo, type, rows };
    const response=await addGatePass(gatepassData);
    console.log(response);
    
    // Implement save logic here
    // Example: console.log({ date, party, orderNo, type, rows });
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
          <Typography
            variant="h4"
            sx={{
              color: PRIMARY_COLOR,
              fontWeight: "bold",
              mb: 3,
              textAlign: "center",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Gate Pass
          </Typography>

          {/* Form Fields */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
              alignItems: "center",
            }}
          >
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 220px" } }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: PRIMARY_COLOR,
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontSize: "0.95rem",
                }}
              >
                Date: Month/Day/Year
              </Typography>
              <TextField
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 220px" } }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: PRIMARY_COLOR,
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontSize: "0.95rem",
                }}
              >
                Party Name
              </Typography>
              <TextField
                value={party}
                onChange={(e) => setParty(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter party name"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 220px" } }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: PRIMARY_COLOR,
                  mb: 0.5,
                  textTransform: "uppercase",
                  fontSize: "0.95rem",
                }}
              >
                Order No.
              </Typography>
              <TextField
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter order number"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
            <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 220px" }, minWidth: 180 }}>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel
                  component="legend"
                  sx={{
                    color: PRIMARY_COLOR,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    fontSize: "0.95rem",
                    mb: 1,
                  }}
                >
                  Type
                </FormLabel>
                <RadioGroup
                  row
                  value={type}
                  onChange={(_, value) => setType(value as "Incoming" | "Outgoing")}
                  sx={{
                    gap: 2,
                    "& .MuiFormControlLabel-root": {
                      mr: 2,
                    },
                  }}
                >
                  <FormControlLabel
                    value="Incoming"
                    control={<Radio sx={{
                      color: PRIMARY_COLOR,
                      "&.Mui-checked": { color: PRIMARY_COLOR }
                    }} />}
                    label="INCOMING"
                    sx={{ textTransform: "uppercase", color: "#000" }}
                  />
                  <FormControlLabel
                    value="Outgoing"
                    control={<Radio sx={{
                      color: PRIMARY_COLOR,
                      "&.Mui-checked": { color: PRIMARY_COLOR }
                    }} />}
                    label="OUTGOING"
                    sx={{ textTransform: "uppercase", color: "#000" }}
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer
            component={Paper}
            sx={{
              border: `1.5px solid ${PRIMARY_COLOR}`,
              borderRadius: 2,
              mb: 3,
              background: "#fff",
              boxShadow: "none",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: PRIMARY_COLOR }}>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", borderColor: PRIMARY_COLOR }}>
                    Product Name
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", borderColor: PRIMARY_COLOR }}>
                    Detail
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", borderColor: PRIMARY_COLOR }}>
                    QTY
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", borderColor: PRIMARY_COLOR }}>
                    Unit
                  </TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", textTransform: "uppercase", borderColor: PRIMARY_COLOR, width: 60, textAlign: "center" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ borderColor: PRIMARY_COLOR }}>
                      <TextField
                        value={row.productName}
                        onChange={(e) => handleRowChange(row.id, "productName", e.target.value)}
                        placeholder="Product name"
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: PRIMARY_COLOR }}>
                      <TextField
                        value={row.detail}
                        onChange={(e) => handleRowChange(row.id, "detail", e.target.value)}
                        placeholder="Detail"
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: PRIMARY_COLOR, minWidth: 80 }}>
                      <TextField
                        value={row.qty}
                        onChange={(e) => handleRowChange(row.id, "qty", e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="0"
                        size="small"
                        fullWidth
                        inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: PRIMARY_COLOR, minWidth: 100 }}>
                      <TextField
                        select
                        value={row.unit}
                        onChange={(e) => handleRowChange(row.id, "unit", e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 2 },
                        }}
                      >
                        <option value="" disabled>
                          Select unit
                        </option>
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ borderColor: PRIMARY_COLOR, textAlign: "center" }}>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteRow(row.id)}
                        disabled={rows.length === 1}
                        sx={{
                          background: "#fff",
                          borderRadius: "50%",
                          "&:hover": {
                            background: "#f5f5f5",
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add Row Button */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "#fff",
                borderRadius: 2,
                fontWeight: 600,
                px: 3,
                py: 1,
                textTransform: "uppercase",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#04347d",
                },
              }}
            >
              Add Row
            </Button>
          </Box>

          {/* Save Button */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: PRIMARY_COLOR,
                color: "#fff",
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "1.1rem",
                px: 5,
                py: 1.5,
                textTransform: "uppercase",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#04347d",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddGatePass;
