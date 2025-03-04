import { createTheme, ThemeOptions } from '@mui/material/styles';

// Color palette
const primaryColor = {
  main: '#2663EB',
  light: '#5B8AF4',
  dark: '#1A4CD1',
  contrastText: '#FFFFFF',
};

const secondaryColor = {
  main: '#14B8A6',
  light: '#4FDAC8',
  dark: '#0D9488',
  contrastText: '#FFFFFF',
};

const errorColor = {
  main: '#EF4444',
  light: '#F87171',
  dark: '#DC2626',
  contrastText: '#FFFFFF',
};

const warningColor = {
  main: '#F59E0B',
  light: '#FBBF24',
  dark: '#D97706',
  contrastText: '#FFFFFF',
};

const infoColor = {
  main: '#3B82F6',
  light: '#60A5FA',
  dark: '#2563EB',
  contrastText: '#FFFFFF',
};

const successColor = {
  main: '#10B981',
  light: '#34D399',
  dark: '#059669',
  contrastText: '#FFFFFF',
};

// Shared theme options
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
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
      primary: '#1F2937',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
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
      secondary: '#E5E7EB',
      disabled: '#9CA3AF',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
});

export default lightTheme; // Default to light theme 