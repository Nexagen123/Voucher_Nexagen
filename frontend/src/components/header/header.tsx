import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Language as LanguageIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  ShoppingCart,
  Assignment,
  Inventory,
  ExitToApp,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#333',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid #e0e0e0',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

const DropdownButton = styled(Button)(({ theme }) => ({
  color: '#333',
  fontWeight: '500',
  textTransform: 'none',
  fontSize: '14px',
  padding: '6px 12px',
  borderRadius: '6px',
  height: '32px',
  minWidth: 'auto',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
  '& .MuiButton-endIcon': {
    marginLeft: '4px',
    '& svg': {
      fontSize: '16px'
    }
  },
  [theme.breakpoints.down('xl')]: {
    fontSize: '13px',
    padding: '4px 8px',
    height: '30px',
  },
  [theme.breakpoints.down('lg')]: {
    fontSize: '12px',
    padding: '4px 6px',
    height: '28px',
  }
}));

const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flex: '1 1 auto',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  paddingRight: theme.spacing(1),
  [theme.breakpoints.up('lg')]: {
    gap: '8px',
  },
  [theme.breakpoints.up('xl')]: {
    gap: '12px',
  }
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginLeft: 'auto',
  flexShrink: 0,
  minWidth: 'fit-content',
}));

const UserInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  minWidth: '60px',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  }
}));

interface HeaderProps {
  onNavigate: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

  // State for dropdown menus
  const [inventoryAnchorEl, setInventoryAnchorEl] = useState<null | HTMLElement>(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);
  const [purchaseVoucherAnchorEl, setPurchaseVoucherAnchorEl] = useState<null | HTMLElement>(null);
  const [salesVoucherAnchorEl, setSalesVoucherAnchorEl] = useState<null | HTMLElement>(null);
  const [purchaseReturnAnchorEl, setPurchaseReturnAnchorEl] = useState<null | HTMLElement>(null);
  const [salesReturnAnchorEl, setSalesReturnAnchorEl] = useState<null | HTMLElement>(null);
  const [gatePassAnchorEl, setGatePassAnchorEl] = useState<null | HTMLElement>(null);

  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inventoryExpanded, setInventoryExpanded] = useState(false);
  const [purchaseVoucherExpanded, setPurchaseVoucherExpanded] = useState(false);
  const [salesVoucherExpanded, setSalesVoucherExpanded] = useState(false);
  const [purchaseReturnExpanded, setPurchaseReturnExpanded] = useState(false);
  const [salesReturnExpanded, setSalesReturnExpanded] = useState(false);
  const [gatePassExpanded, setGatePassExpanded] = useState(false);

  // Menu items data
  const inventoryItems = [
    { id: 'add-category', label: 'Add Category' },
    { id: 'add-stock', label: 'Add Stock' },
    { id: 'stock-list', label: 'Stock List' },
    { id: 'stock-summary', label: 'Stock Summary' },
    { id: 'nil-stocks', label: 'Nil Stocks' },
  ];

  const purchaseVoucherItems = [
    { id: 'purchase-voucher', label: 'Entry P Voucher' },
    { id: 'view-purchase-voucher', label: 'View P Voucher' },
    { id: 'void-purchase-voucher', label: 'Void P Voucher' },
  ];

  const salesVoucherItems = [
    { id: 'sales-voucher', label: 'Entry Sales Voucher' },
    { id: 'view-sales-voucher', label: 'View Sales Voucher' },
    { id: 'void-sales-voucher', label: 'Void Sales Voucher' },
  ];

  const purchaseReturnItems = [
    { id: 'entry-purchase-return', label: 'Entry Purchase Return' },
    { id: 'view-purchase-return', label: 'View Purchase Return' },
    { id: 'void-purchase-return', label: 'Void Purchase Return' },
  ];

  const salesReturnItems = [
    { id: 'entry-sales-return', label: 'Entry Sales Return' },
    { id: 'view-sales-return', label: 'View Sales Return' },
    { id: 'void-sales-return', label: 'Void Sales Return' },
  ];

  const gatePassItems = [
    { id: 'add-gate-pass', label: 'Add Gate Pass' },
    { id: 'view-gate-pass', label: 'View Gate Pass' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  // Helper function to create menu handlers
  const createMenuHandlers = (
    setAnchor: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => ({
    handleClick: (event: React.MouseEvent<HTMLElement>) => {
      setAnchor(event.currentTarget);
    },
    handleClose: () => {
      setAnchor(null);
    },
    handleItemClick: (itemId: string) => {
      onNavigate(itemId);
      setAnchor(null);
    },
  });

  // Menu handlers
  const inventoryHandlers = createMenuHandlers(setInventoryAnchorEl);
  const purchaseVoucherHandlers = createMenuHandlers(setPurchaseVoucherAnchorEl);
  const salesVoucherHandlers = createMenuHandlers(setSalesVoucherAnchorEl);
  const purchaseReturnHandlers = createMenuHandlers(setPurchaseReturnAnchorEl);
  const salesReturnHandlers = createMenuHandlers(setSalesReturnAnchorEl);
  const gatePassHandlers = createMenuHandlers(setGatePassAnchorEl);

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchorEl(null);
  };

  const handleLanguageSelect = (languageCode: string) => {
    console.log('Selected language:', languageCode);
    handleLanguageClose();
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavigation = (section: string) => {
    onNavigate(section);
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Render dropdown menu
  const renderDropdownMenu = (
    anchorEl: HTMLElement | null,
    onClose: () => void,
    items: Array<{ id: string; label: string }>,
    onItemClick: (itemId: string) => void
  ) => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            mt: 1,
            minWidth: '180px',
          },
        },
      }}
    >
      {items.map((item) => (
        <MenuItem
          key={item.id}
          onClick={() => onItemClick(item.id)}
          sx={{
            fontSize: '14px',
            py: 1,
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );

  // Render mobile menu section
  const renderMobileMenuSection = (
    title: string,
    icon: React.ReactNode,
    expanded: boolean,
    onToggle: () => void,
    items: Array<{ id: string; label: string }>
  ) => (
    <>
      <ListItem
        onClick={onToggle}
        sx={{
          cursor: 'pointer',
          py: 1.5,
          '&:hover': { backgroundColor: '#f5f5f5' }
        }}
      >
        <ListItemIcon sx={{ minWidth: '40px' }}>
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={title}
          sx={{ 
            '& .MuiTypography-root': { 
              fontWeight: 500,
              fontSize: '15px'
            } 
          }}
        />
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {items.map((item) => (
            <ListItem
              key={item.id}
              onClick={() => handleMobileNavigation(item.id)}
              sx={{
                pl: 4,
                py: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '14px',
                    fontWeight: 400
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );

  return (
    <StyledAppBar position="static">
      <Toolbar 
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: '56px', sm: '64px' },
          maxHeight: '64px',
          gap: 1,
          justifyContent: 'space-between',
        }}
        variant="dense"
      >
        {/* Mobile Menu Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMobileMenuToggle}
          sx={{
            display: { xs: 'flex', md: 'none' },
            color: '#333',
            mr: 1,
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Desktop Navigation Menu */}
        <NavigationContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
          {/* Purchase Voucher */}
          <DropdownButton
            onClick={purchaseVoucherHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            {isSmallScreen ? 'P. Voucher' : 'Purchase Voucher'}
          </DropdownButton>
          {renderDropdownMenu(
            purchaseVoucherAnchorEl,
            purchaseVoucherHandlers.handleClose,
            purchaseVoucherItems,
            purchaseVoucherHandlers.handleItemClick
          )}

          {/* Purchase Return */}
          <DropdownButton
            onClick={purchaseReturnHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            {isSmallScreen ? 'P. Return' : 'Purchase Return'}
          </DropdownButton>
          {renderDropdownMenu(
            purchaseReturnAnchorEl,
            purchaseReturnHandlers.handleClose,
            purchaseReturnItems,
            purchaseReturnHandlers.handleItemClick
          )}

          {/* Sales Voucher */}
          <DropdownButton
            onClick={salesVoucherHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            {isSmallScreen ? 'S. Voucher' : 'Sales Voucher'}
          </DropdownButton>
          {renderDropdownMenu(
            salesVoucherAnchorEl,
            salesVoucherHandlers.handleClose,
            salesVoucherItems,
            salesVoucherHandlers.handleItemClick
          )}

          {/* Sales Return */}
          <DropdownButton
            onClick={salesReturnHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            {isSmallScreen ? 'S. Return' : 'Sales Return'}
          </DropdownButton>
          {renderDropdownMenu(
            salesReturnAnchorEl,
            salesReturnHandlers.handleClose,
            salesReturnItems,
            salesReturnHandlers.handleItemClick
          )}

          {/* Inventory */}
          <DropdownButton
            onClick={inventoryHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            Inventory
          </DropdownButton>
          {renderDropdownMenu(
            inventoryAnchorEl,
            inventoryHandlers.handleClose,
            inventoryItems,
            inventoryHandlers.handleItemClick
          )}

          {/* Gate Pass */}
          <DropdownButton
            onClick={gatePassHandlers.handleClick}
            endIcon={<ExpandMoreIcon />}
          >
            Gate Pass
          </DropdownButton>
          {renderDropdownMenu(
            gatePassAnchorEl,
            gatePassHandlers.handleClose,
            gatePassItems,
            gatePassHandlers.handleItemClick
          )}
        </NavigationContainer>

        {/* Right Section */}
        <RightSection>
          {/* Language Selector */}
          <IconButton
            onClick={handleLanguageClick}
            size="small"
            sx={{
              color: '#333',
              display: { xs: 'none', sm: 'flex' },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <LanguageIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={languageAnchorEl}
            open={Boolean(languageAnchorEl)}
            onClose={handleLanguageClose}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  mt: 1,
                  minWidth: '160px',
                },
              },
            }}
          >
            {languages.map((language) => (
              <MenuItem
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                sx={{
                  py: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{language.flag}</span>
                  <Typography variant="body2">{language.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          <Divider 
            orientation="vertical" 
            flexItem 
            sx={{ 
              backgroundColor: '#e0e0e0',
              display: { xs: 'none', sm: 'block' }
            }} 
          />

          {/* User Account */}
          <IconButton
            onClick={handleLogout}
            size="small"
            sx={{
              color: '#333',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
            title="Logout"
          >
            <ExitToApp fontSize="small" />
          </IconButton>

          {/* User Info */}
          <UserInfoBox>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#333', 
                fontWeight: '600',
                fontSize: '13px',
                lineHeight: 1.2
              }}
            >
              devinc
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#666',
                fontSize: '11px',
                lineHeight: 1.2
              }}
            >
              Admin
            </Typography>
          </UserInfoBox>
        </RightSection>
      </Toolbar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: '#ffffff',
            pt: 2,
          },
        }}
      >
        <List sx={{ px: 1 }}>
          {renderMobileMenuSection(
            'Purchase Voucher',
            <ShoppingCart sx={{ color: '#333' }} />,
            purchaseVoucherExpanded,
            () => setPurchaseVoucherExpanded(!purchaseVoucherExpanded),
            purchaseVoucherItems
          )}

          {renderMobileMenuSection(
            'Purchase Return',
            <Assignment sx={{ color: '#333' }} />,
            purchaseReturnExpanded,
            () => setPurchaseReturnExpanded(!purchaseReturnExpanded),
            purchaseReturnItems
          )}

          {renderMobileMenuSection(
            'Sales Voucher',
            <ShoppingCart sx={{ color: '#333' }} />,
            salesVoucherExpanded,
            () => setSalesVoucherExpanded(!salesVoucherExpanded),
            salesVoucherItems
          )}

          {renderMobileMenuSection(
            'Sales Return',
            <Assignment sx={{ color: '#333' }} />,
            salesReturnExpanded,
            () => setSalesReturnExpanded(!salesReturnExpanded),
            salesReturnItems
          )}

          {renderMobileMenuSection(
            'Inventory',
            <Inventory sx={{ color: '#333' }} />,
            inventoryExpanded,
            () => setInventoryExpanded(!inventoryExpanded),
            inventoryItems
          )}

          {renderMobileMenuSection(
            'Gate Pass',
            <Assignment sx={{ color: '#333' }} />,
            gatePassExpanded,
            () => setGatePassExpanded(!gatePassExpanded),
            gatePassItems
          )}

          <Divider sx={{ my: 2 }} />

          {/* Language Selection in Mobile */}
          <ListItem
            onClick={handleLanguageClick}
            sx={{
              cursor: 'pointer',
              py: 1.5,
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <LanguageIcon sx={{ color: '#333' }} />
            </ListItemIcon>
            <ListItemText
              primary="Language"
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '15px'
                } 
              }}
            />
          </ListItem>

          {/* Logout in Mobile */}
          <ListItem
            onClick={handleLogout}
            sx={{
              cursor: 'pointer',
              py: 1.5,
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <ExitToApp sx={{ color: '#333' }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  fontSize: '15px'
                } 
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </StyledAppBar>
  );
};

export default Header;