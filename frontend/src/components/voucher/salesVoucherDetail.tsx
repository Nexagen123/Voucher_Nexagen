import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as VoidIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

// Interface for Sales Voucher Item
interface SalesVoucherItem {
  itemName: string;
  quantity: number;
  rate: number;
}

// Interface for Sales Voucher
interface SalesVoucher {
  id: string;
  _id?: string;
  date: string;
  dated?: string;
  description?: string;
  items: SalesVoucherItem[];
  entries: number;
  status?: 'Submitted' | 'Voided';
  createdAt?: string;
  updatedAt?: string;
}

interface SalesVoucherDetailProps {
  voucher: SalesVoucher | null;
  onBack: () => void;
  onEdit: (voucher: SalesVoucher) => void;
  onVoid: (voucher: SalesVoucher) => void;
}

const SalesVoucherDetail: React.FC<SalesVoucherDetailProps> = ({
  voucher,
  onBack,
  onEdit,
  onVoid,
}) => {
  // State
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
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

  // Handle void confirmation
  const handleVoidConfirm = async () => {
    if (!voucher) return;

    try {
      setLoading(true);
      
      // Call API to void the voucher
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/vouchers/${voucher.id || voucher._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        showSnackbar('Sales voucher voided successfully!', 'success');
        setVoidDialogOpen(false);
        onVoid(voucher);
      } else {
        throw new Error(result.message || 'Failed to void voucher');
      }
    } catch (error) {
      console.error('Error voiding voucher:', error);
      showSnackbar('Error voiding voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!voucher) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No voucher selected</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

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
      {/* Header */}
      <Paper elevation={3} sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 1, md: 2 },
        width: '100%'
      }}>
        <Box sx={{
          backgroundColor: "white",
          color: "black",
          py: { xs: 1.5, md: 2 },
          px: { xs: 2, md: 3 },
          borderRadius: 1,
          mb: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ 
              alignSelf: { xs: 'flex-start', sm: 'center' },
              mb: { xs: 1, sm: 0 }
            }}
          >
            Back to List
          </Button>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flex: 1,
            justifyContent: { xs: 'center', sm: 'center' }
          }}>
            <ReceiptIcon fontSize="large" />
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              Sales Voucher Details
            </Typography>
          </Box>
        </Box>

        {/* Voucher Info */}
        <Box sx={{ mb: 3 }}>
          <Card sx={{ backgroundColor: '#f8f9fa', mb: 2 }}>
            <CardContent>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 2 
              }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Voucher ID
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {voucher.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {voucher.date || voucher.dated}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Entries
                  </Typography>
                  <Typography variant="body1">
                    {voucher.entries}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip 
                    label={voucher.status || 'Submitted'} 
                    color={voucher.status === 'Voided' ? 'error' : 'success'}
                    size="small"
                  />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {voucher.description || `${voucher.items?.length || 0} items`}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: { xs: 'center', md: 'flex-end' },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(voucher)}
            disabled={voucher.status === 'Voided'}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              minWidth: { xs: '200px', md: 'auto' },
            }}
          >
            Edit Voucher
          </Button>
          
          <Button
            variant="contained"
            startIcon={<VoidIcon />}
            onClick={() => setVoidDialogOpen(true)}
            disabled={voucher.status === 'Voided' || loading}
            sx={{
              px: { xs: 3, md: 4 },
              py: { xs: 1.5, md: 1 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              minWidth: { xs: '200px', md: 'auto' },
              backgroundColor: '#f44336',
              '&:hover': {
                backgroundColor: '#d32f2f',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
              },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Voiding...
              </>
            ) : (
              'Void Voucher'
            )}
          </Button>
        </Box>
      </Paper>

      {/* Void Confirmation Dialog */}
      <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)}>
        <DialogTitle>Confirm Void Voucher</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to void this sales voucher? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2">Voucher: {voucher.id}</Typography>
            <Typography variant="body2">Date: {voucher.date || voucher.dated}</Typography>
            <Typography variant="body2">Description: {voucher.description || `${voucher.items?.length || 0} items`}</Typography>
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
            {loading ? 'Voiding...' : 'Void Voucher'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default SalesVoucherDetail;
