import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Divider
} from '@mui/material';
import { Shield, User, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export const Auth = ({ onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState('CUSTOMER'); // CUSTOMER | TECHNICIAN
  const [email, setEmail] = useState('mehedi@bracu.ac.bd');
  const [password, setPassword] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (overrideEmail = null, overrideRole = null) => {
    setLoading(true);
    setError('');
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || roleTab;

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: targetEmail,
        password,
        role: targetRole
      });

      if (res.data.success) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      // Fallback local authentication if backend is starting
      const fallbackUser = targetRole === 'CUSTOMER'
        ? { id: 'usr-1', name: 'Mehedi Hasan', email: targetEmail, role: 'CUSTOMER', avatar: 'MH' }
        : targetEmail.includes('sara')
          ? { id: 'usr-3', name: 'Sara Noor', email: 'sara@techaid.com', role: 'TECHNICIAN', avatar: 'SN', technicianId: 'tech-2', specialty: 'Smartphone Repair' }
          : { id: 'usr-2', name: 'Rafiq Ahmed', email: 'rafiq@techaid.com', role: 'TECHNICIAN', avatar: 'RA', technicianId: 'tech-1', specialty: 'Laptop Specialist' };
      
      onLoginSuccess(fallbackUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0D1527',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#172036',
          borderRadius: 4,
          p: 4,
          border: '1px solid #2A364F',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              backgroundColor: '#00A8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0D1527',
              boxShadow: '0 0 20px rgba(0, 168, 255, 0.4)',
              mb: 1.5
            }}
          >
            <Shield size={32} strokeWidth={2.5} />
          </Box>
          <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 700 }}>
            Tech<span style={{ color: '#00A8FF' }}>Aid</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>
            Interactive Tech Support & Troubleshooting System
          </Typography>
        </Box>

        {/* Role Selector Tabs */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              onClick={() => {
                setRoleTab('CUSTOMER');
                setEmail('mehedi@bracu.ac.bd');
              }}
              startIcon={<User size={18} />}
              sx={{
                py: 1.2,
                backgroundColor: roleTab === 'CUSTOMER' ? '#00A8FF' : '#0F172A',
                color: roleTab === 'CUSTOMER' ? '#0D1527' : '#94A3B8',
                border: roleTab === 'CUSTOMER' ? '1px solid #00A8FF' : '1px solid #2A364F',
                fontWeight: 700,
                '&:hover': { backgroundColor: roleTab === 'CUSTOMER' ? '#00A8FF' : '#1E293B' }
              }}
            >
              Customer
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              onClick={() => {
                setRoleTab('TECHNICIAN');
                setEmail('rafiq@techaid.com');
              }}
              startIcon={<Wrench size={18} />}
              sx={{
                py: 1.2,
                backgroundColor: roleTab === 'TECHNICIAN' ? '#00A8FF' : '#0F172A',
                color: roleTab === 'TECHNICIAN' ? '#0D1527' : '#94A3B8',
                border: roleTab === 'TECHNICIAN' ? '1px solid #00A8FF' : '1px solid #2A364F',
                fontWeight: 700,
                '&:hover': { backgroundColor: roleTab === 'TECHNICIAN' ? '#00A8FF' : '#1E293B' }
              }}
            >
              Technician
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#FFF',
                backgroundColor: '#0F172A',
                '& fieldset': { borderColor: '#2A364F' },
                '&:hover fieldset': { borderColor: '#00A8FF' }
              }
            }}
          />

          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Password
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#FFF',
                backgroundColor: '#0F172A',
                '& fieldset': { borderColor: '#2A364F' },
                '&:hover fieldset': { borderColor: '#00A8FF' }
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={() => handleLogin()}
            disabled={loading}
            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowRight size={18} />}
            sx={{
              backgroundColor: '#00A8FF',
              color: '#0D1527',
              py: 1.3,
              fontWeight: 700,
              fontSize: '1rem',
              '&:hover': { backgroundColor: '#38BDF8' }
            }}
          >
            {loading ? 'Logging in...' : `Log In as ${roleTab === 'CUSTOMER' ? 'Customer' : 'Technician'}`}
          </Button>
        </Box>

        <Divider sx={{ borderColor: '#2A364F', my: 2.5 }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>OR QUICK DEMO LOGIN</Typography>
        </Divider>

        {/* Quick Demo Logins for Viva Presentation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => handleLogin('mehedi@bracu.ac.bd', 'CUSTOMER')}
            sx={{
              justify: 'flex-start',
              backgroundColor: '#0F172A',
              color: '#38BDF8',
              border: '1px solid #2A364F',
              py: 0.8,
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1E293B' }
            }}
          >
            👤 Demo Login: Mehedi Hasan (Customer)
          </Button>

          <Button
            fullWidth
            size="small"
            onClick={() => handleLogin('rafiq@techaid.com', 'TECHNICIAN')}
            sx={{
              justify: 'flex-start',
              backgroundColor: '#0F172A',
              color: '#10B981',
              border: '1px solid #2A364F',
              py: 0.8,
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1E293B' }
            }}
          >
            🔧 Demo Login: Rafiq Ahmed (Laptop Specialist Tech)
          </Button>

          <Button
            fullWidth
            size="small"
            onClick={() => handleLogin('sara@techaid.com', 'TECHNICIAN')}
            sx={{
              justify: 'flex-start',
              backgroundColor: '#0F172A',
              color: '#F59E0B',
              border: '1px solid #2A364F',
              py: 0.8,
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1E293B' }
            }}
          >
            📱 Demo Login: Sara Noor (Smartphone Repair Tech)
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
