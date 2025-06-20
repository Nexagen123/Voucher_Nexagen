import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';

// Interface for Purchase Return
interface PurchaseReturn {
  id: string;
  date: string;
  numberOfEntries: number;
  description: string;
  createdAt: string;
  status: 'Draft' | 'Submitted';
}

const EntryPurchaseReturn: React.FC = () => {
  // Form state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numberOfEntries, setNumberOfEntries] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [voucherId, setVoucherId] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('success');

  // Generate unique voucher ID
  const generateVoucherId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PR-${timestamp}-${randomNum}`;
  };

  // Initialize voucher ID on component mount
  useEffect(() => {
    setVoucherId(generateVoucherId());
  }, []);

  // Helper function to show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!date) {
      showSnackbar('Please select a date', 'error');
      return;
    }

    if (numberOfEntries < 1) {
      showSnackbar('Number of entries must be at least 1', 'error');
      return;
    }

    if (!description.trim()) {
      showSnackbar('Please enter a description', 'error');
      return;
    }

    try {
      setLoading(true);

      // Create voucher object
      const voucher: PurchaseReturn = {
        id: voucherId,
        date,
        numberOfEntries,
        description: description.trim(),
        createdAt: new Date().toISOString(),
        status: 'Submitted'
      };

      // Send to backend API
      console.log('Purchase Return to submit:', voucher);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/purchase-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(voucher),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Purchase return saved:', result);

      if (result.success) {
        showSnackbar(`Purchase return created successfully! ID: ${voucher.id}`, 'success');
      } else {
        throw new Error(result.message || 'Failed to save purchase return');
      }

      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setNumberOfEntries(1);
      setDescription('');
      setVoucherId(generateVoucherId());

    } catch (error) {
      console.error('Error creating purchase return:', error);
      showSnackbar('Error creating purchase return', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setNumberOfEntries(1);
    setDescription('');
    setVoucherId(generateVoucherId());
    showSnackbar('Form reset successfully', 'success');
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
            <ReceiptIcon fontSize="large" />
            Entry Purchase Return
          </Typography>
        </Box>
        {/* Return Details Section */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          {/* Auto-Generated Return ID */}
          <Box sx={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            p: { xs: 2, md: 3 },
            borderRadius: 1,
            mb: { xs: 2, md: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <AutoIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Auto-Generated Return ID:
            </Typography>
            <Chip
              label={voucherId}
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

          {/* Form Fields Grid */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr'
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
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                Number of Entries
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={numberOfEntries}
                onChange={(e) => setNumberOfEntries(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="1"
                variant="outlined"
                slotProps={{
                  htmlInput: {
                    min: 1,
                    step: 1
                  }
                }}
              />
            </Box>
          </Box>

          {/* Description Field */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter return description..."
              variant="outlined"
            />
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
            onClick={handleReset}
            disabled={loading}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              minWidth: { xs: '200px', md: 'auto' },
              borderRadius: 1,
            }}
          >
            Reset Form
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
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
                Submit Return
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

export default EntryPurchaseReturn;