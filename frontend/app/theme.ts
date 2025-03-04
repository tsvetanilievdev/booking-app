import { createTheme, ThemeOptions } from '@mui/material/styles';

// Color palette - using more subtle colors with better contrast
const primaryColor = {
  main: '#3366FF', // Main primary - more visible but not overpowering
  light: '#6690FF', // Lighter version for backgrounds
  dark: '#1939B7', // Darker version for hover states
  contrastText: '#FFFFFF',
};

const secondaryColor = {
  main: '#10B981', // Green for secondary actions
  light: '#D1FAE5', // Very light background
  dark: '#059669', // Darker for hover
  contrastText: '#FFFFFF',
};

const errorColor = {
  main: '#EF4444',
  light: '#FEE2E2',
  dark: '#B91C1C',
  contrastText: '#FFFFFF',
};

const warningColor = {
  main: '#F59E0B',
  light: '#FEF3C7',
  dark: '#D97706',
  contrastText: '#FFFFFF',
};

const infoColor = {
  main: '#3B82F6',
  light: '#EFF6FF',
  dark: '#2563EB',
  contrastText: '#FFFFFF',
};

const successColor = {
  main: '#10B981',
  light: '#D1FAE5',
  dark: '#059669',
  contrastText: '#FFFFFF',
};

// Shared theme options
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12, // Slightly increased for modern look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '0',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: primaryColor.light,
          color: primaryColor.contrastText,
        },
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'light',
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    success: successColor,
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'dark',
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
    warning: warningColor,
    info: infoColor,
    success: successColor,
    background: {
      default: '#111827',
      paper: '#1F2937',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
});

export default lightTheme; // Default to light theme 