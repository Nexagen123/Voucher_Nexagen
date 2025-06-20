import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Chip,
  CircularProgress
} from '@mui/material';
import { createcategory, showallcategory } from '../../api/axios';

// Interface for Category
interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const AddCategory: React.FC = () => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showExistingCategories, setShowExistingCategories] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState<boolean>(false);
console.log(categories);


  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await showallcategory();
      const data = await response.data;

      if (data.success) {
        setCategories(data.data || []);

      } else {
        setSnackbarMessage('Failed to fetch categories: ' + (data.message || 'Unknown error'));
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error instanceof Error) {
        setSnackbarMessage('Error fetching categories: ' + error.message);
      } else {
        setSnackbarMessage('Error fetching categories');
      }
      setSnackbarOpen(true);
    } finally {
      setFetchingCategories(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle saving a new category
  const handleSaveCategory = async () => {
    if (categoryName.trim() === '') {
      setSnackbarMessage('Please enter a category name');
      setSnackbarOpen(true);
      return;
    }

    // Check if category already exists locally
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (existingCategory) {
      setSnackbarMessage('Category already exists');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);

    const response = await createcategory(categoryName);

      const data = await response.data;

      if (data.success) {
        // Add the new category to local state
        setCategories(prev => [...prev, data.data]);
        setCategoryName('');
        setSnackbarMessage('Category added successfully!');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage(data.message || 'Failed to add category');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbarMessage('Error adding category');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle showing/hiding existing categories
  const handleToggleExistingCategories = () => {
    setShowExistingCategories(!showExistingCategories);
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
            component="h1"
            align="center"
            sx={{
              mb: { xs: 2, md: 3 },
              fontWeight: "bold",
              color: "white",
              backgroundColor: "#3da0bd",
              py: { xs: 1.5, md: 2 },
              borderRadius: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
            }}
          >
            Add Category
          </Typography>

          {/* Content */}
          <Box sx={{ width: '100%', mx: 'auto' }}>
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                sx={{
                  mb: { xs: 2, md: 3 },
                  color: '#333',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}
              >
                Category Information
              </Typography>

              <TextField
                fullWidth
                label="Category Name"
                variant="outlined"
                placeholder="Enter category name (e.g., Electronics, Clothing, Food & Beverages)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCategory();
                  }
                }}
                sx={{
                  mb: { xs: 2, md: 3 },
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '14px', md: '16px' },
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: '#B8C5F2',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9BB0E8',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '14px', md: '16px' },
                    fontWeight: '600',
                    color: '#333',
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: { xs: '12px 14px', md: '16px' },
                  }
                }}
              />

              <Typography
                variant="body2"
                sx={{
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontSize: { xs: '14px', md: '16px' },
                  mb: 2
                }}
              >
                💡 Enter a unique category name to organize your inventory items effectively
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 2, md: 3 },
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}>
              <Button
                variant="contained"
                onClick={handleSaveCategory}
                disabled={loading}
                sx={{
                  minWidth: { xs: '180px', md: '200px' },
                  width: { xs: '100%', sm: 'auto' },
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 3, md: 4 },
                  fontSize: { xs: '14px', md: '16px' },
                  fontWeight: 'bold',
                  borderRadius: { xs: 1, md: 2 },
                  backgroundColor: "#4CAF50",
                  "&:hover": {
                    backgroundColor: "#45a049",
                    transform: { xs: 'none', md: 'translateY(-2px)' },
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    SAVING...
                  </>
                ) : (
                  '💾 SAVE CATEGORY'
                )}
              </Button>

              <Button
                variant="outlined"
                onClick={handleToggleExistingCategories}
                sx={{
                  minWidth: { xs: '180px', md: '200px' },
                  width: { xs: '100%', sm: 'auto' },
                  py: { xs: 1.5, md: 2 },
                  px: { xs: 3, md: 4 },
                  fontSize: { xs: '14px', md: '16px' },
                  fontWeight: 'bold',
                  borderRadius: { xs: 1, md: 2 },
                  borderWidth: '2px',
                  borderColor: 'white',
                  color: '#333',
                  "&:hover": {
                    borderColor: '#B8C5F2',
                    backgroundColor: '#f8f9ff',
                    transform: { xs: 'none', md: 'translateY(-2px)' },
                  },
                  transition: 'all 0.2s ease-in-out',
                  boxShadow: '0 4px 12px rgba(217, 225, 250, 0.3)',
                }}
              >
                📋 {showExistingCategories ? 'HIDE CATEGORIES' : 'VIEW CATEGORIES'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Existing Categories Section */}
      {showExistingCategories && (
        <Box sx={{ width: '100%', mx: 'auto' }}>
          <Paper elevation={3} sx={{
            p: { xs: 2, md: 3 },
            borderRadius: { xs: 1, md: 2 },
            mx: { xs: 0, md: 0 },
            width: '100%'
          }}>
            <Typography
              variant="h4"
              sx={{
                mb: { xs: 3, md: 4 },
                color: '#333',
                fontWeight: 'bold',
                textAlign: 'center',
                backgroundColor: '#f8f9ff',
                py: { xs: 2, md: 3 },
                borderRadius: 2,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Existing Categories ({categories.length})
            </Typography>

            {categories.length === 0 ? (
              <Box sx={{
                textAlign: 'center',
                py: 8,
                backgroundColor: '#f8f9ff',
                borderRadius: 3,
                border: '3px dashed white'
              }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#666',
                    fontStyle: 'italic',
                    mb: 3,
                    fontSize: '1.5rem'
                  }}
                >
                  No categories added yet
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#999',
                    fontSize: '1.2rem'
                  }}
                >
                  Start by adding your first category above
                </Typography>
              </Box>
            ) : (
              <Box sx={{
                backgroundColor: '#f8f9ff',
                borderRadius: 3,
                p: 4
              }}>
                <List sx={{ p: 0 }}>
                  {fetchingCategories ? (
                    <ListItem sx={{ py: 3, px: 4, justifyContent: 'center' }}>
                      <CircularProgress size={30} />
                      <Typography sx={{ ml: 2 }}>Loading categories...</Typography>
                    </ListItem>
                  ) : categories.length === 0 ? (
                    <ListItem sx={{ py: 3, px: 4, justifyContent: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                        No categories found. Add your first category above!
                      </Typography>
                    </ListItem>
                  ) : (
                    categories.map((category) => (
                      <React.Fragment key={category._id}>
                      <ListItem
                        sx={{
                          py: 3,
                          px: 4,
                          borderRadius: 3,
                          mb: 2,
                          backgroundColor: '#ffffff',
                          border: '2px solid #e0e0e0',
                          '&:hover': {
                            backgroundColor: '#f0f7ff',
                            borderColor: 'white',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                              <Typography variant="h5" sx={{ color: '#333', fontWeight: '600', fontSize: '1.5rem' }}>
                                {category.name}
                              </Typography>
                              <Chip
                                label={`ID: ${category._id.slice(-6)}`}
                                size="medium"
                                sx={{
                                  backgroundColor: 'white',
                                  color: '#333',
                                  fontFamily: 'monospace',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  px: 2,
                                  py: 1
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
                              📅 Created: {new Date(category.createdAt).toLocaleDateString()} at {new Date(category.createdAt).toLocaleTimeString()}
                            </Typography>
                          }
                        />
                      </ListItem>
                      </React.Fragment>
                    ))
                  )}
                </List>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes('successfully') ? 'success' : 'warning'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCategory;