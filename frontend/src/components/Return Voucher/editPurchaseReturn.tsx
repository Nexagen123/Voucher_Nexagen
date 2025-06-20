import React, { useState } from 'react';
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
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';

// Interface for Purchase Return
interface PurchaseReturn {
  id: string;
  _id?: string;
  date: string;
  description: string;
  numberOfEntries: number;
  status?: 'Submitted' | 'Voided';
  createdAt?: string;
  updatedAt?: string;
}

interface EditPurchaseReturnProps {
  returnItem: PurchaseReturn;
  onBack: () => void;
  onSave: (returnItem: PurchaseReturn) => void;
}

const EditPurchaseReturn: React.FC<EditPurchaseReturnProps> = ({
  returnItem,
  onBack,
  onSave,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    date: returnItem.date,
    description: returnItem.description,
    numberOfEntries: returnItem.numberOfEntries.toString(),
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Show snackbar
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Handle form field changes
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form
    if (!formData.date || !formData.description || !formData.numberOfEntries) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    const entriesNum = parseInt(formData.numberOfEntries);
    if (isNaN(entriesNum) || entriesNum <= 0) {
      showSnackbar('Number of entries must be a positive number', 'error');
      return;
    }

    try {
      setLoading(true);

      // Call API to update the return
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/purchase-returns/${returnItem.id || returnItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formData.date,
          description: formData.description,
          numberOfEntries: entriesNum,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        showSnackbar('Purchase return updated successfully!', 'success');
        
        // Update the return object and call onSave
        const updatedReturn = {
          ...returnItem,
          date: formData.date,
          description: formData.description,
          numberOfEntries: entriesNum,
        };
        
        setTimeout(() => {
          onSave(updatedReturn);
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update return');
      }
    } catch (error) {
      console.error('Error updating return:', error);
      showSnackbar('Error updating return', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      date: returnItem.date,
      description: returnItem.description,
      numberOfEntries: returnItem.numberOfEntries.toString(),
    });
    showSnackbar('Form reset to original values', 'success');
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
            color: "black",
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
            Edit Purchase Return
          </Typography>
        </Box>

        {/* Return Details Section */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          {/* Return ID Display */}
          <Box sx={{
            backgroundColor: 'white',
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
              Editing Return ID:
            </Typography>
            <Chip
              label={returnItem.id}
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
          <Box component="form" onSubmit={handleSubmit} sx={{
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
                value={formData.date}
                onChange={handleChange('date')}
                required
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
                value={formData.numberOfEntries}
                onChange={handleChange('numberOfEntries')}
                required
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
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                Status
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={returnItem.status || "Submitted"}
                variant="outlined"
                disabled
                sx={{
                  "& .MuiInputBase-input": {
                    backgroundColor: "#f5f5f5",
                  },
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
              value={formData.description}
              onChange={handleChange('description')}
              required
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
            type="submit"
            variant="contained"
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

export default EditPurchaseReturn;
