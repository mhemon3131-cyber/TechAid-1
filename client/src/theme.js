import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0D1527',
      paper: '#172036',
    },
    primary: {
      main: '#00A8FF',
      light: '#38BDF8',
      dark: '#0077C8',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3B82F6',
    },
    error: {
      main: '#EF4444', // Critical Urgency
    },
    warning: {
      main: '#F59E0B', // Moderate Urgency
    },
    info: {
      main: '#3B82F6', // Low Urgency
    },
    success: {
      main: '#10B981',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h5: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Outfit', sans-serif",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
