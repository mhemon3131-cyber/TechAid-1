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
  Divider,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import { Shield, User, Wrench, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import axios from 'axios';

export const Auth = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [roleTab, setRoleTab] = useState('CUSTOMER');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('Laptop & Desktop Specialist');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const specialtiesList = [
    'Laptop & Desktop Specialist',
    'Smartphone Repair & OS Recovery',
    'Printer & Hardware Expert',
    'Networking & Internet Consultant'
  ];

  // Helper to derive a clean user name if blank
  const getDerivedName = (inputName, inputEmail) => {
    if (inputName && inputName.trim()) return inputName.trim();
    if (inputEmail && inputEmail.includes('@')) {
      const prefix = inputEmail.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Customer';
  };

  // Submit Login
  const handleLogin = async (overrideEmail = null, overrideRole = null) => {
    const targetEmail = overrideEmail || email;
    const targetRole = overrideRole || roleTab;

    if (!targetEmail.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:1257/api/auth/login', {
        email: targetEmail.trim(),
        password: password.trim(),
        role: targetRole
      });

      if (res.data.success) {
        onLoginSuccess(res.data.user);
      }
    } catch (err) {
      const serverErrMsg = err.response?.data?.message || 'Authentication failed. Please check your email and password.';
      setError(serverErrMsg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Registration
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    const newTechProfile = {
      id: `tech-${Date.now()}`,
      userId: `usr-${Date.now()}`,
      name: cleanName,
      specialty: roleTab === 'TECHNICIAN' ? specialty : 'General Repair',
      rating: 4.8,
      distanceKm: 2.5,
      isAvailable: true,
      avatar: cleanName.slice(0, 2).toUpperCase()
    };

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        phone: phone.trim() || '+880 1712-345678',
        password: password.trim(),
        role: roleTab,
        specialty: roleTab === 'TECHNICIAN' ? specialty : null
      };

      const res = await axios.post('http://localhost:1257/api/auth/register', payload);

      if (res.data.success) {
        setSuccessMsg(`Account created successfully for ${res.data.user.name}! Saved in database.`);
        setTimeout(() => {
          onLoginSuccess(res.data.user);
        }, 1000);
      }
    } catch (err) {
      const serverErrMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(serverErrMsg);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
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
            {isRegisterMode ? 'Create a New Account' : 'Interactive Tech Support & Troubleshooting System'}
          </Typography>
        </Box>

        {/* Auth Mode Toggle (Sign In vs Create Account) */}
        <Box sx={{ backgroundColor: '#0F172A', p: 0.5, borderRadius: 2.5, display: 'flex', mb: 3, border: '1px solid #2A364F' }}>
          <Button
            fullWidth
            onClick={() => setIsRegisterMode(false)}
            startIcon={<LogIn size={16} />}
            sx={{
              py: 1,
              backgroundColor: !isRegisterMode ? '#00A8FF' : 'transparent',
              color: !isRegisterMode ? '#0D1527' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            onClick={() => setIsRegisterMode(true)}
            startIcon={<UserPlus size={16} />}
            sx={{
              py: 1,
              backgroundColor: isRegisterMode ? '#00A8FF' : 'transparent',
              color: isRegisterMode ? '#0D1527' : '#94A3B8',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Create Account
          </Button>
        </Box>

        {/* Role Selector Tabs (Customer vs Technician) */}
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Button
              fullWidth
              onClick={() => {
                setRoleTab('CUSTOMER');
                setError('');
              }}
              startIcon={<User size={18} />}
              sx={{
                py: 1,
                backgroundColor: roleTab === 'CUSTOMER' ? 'rgba(0, 168, 255, 0.15)' : '#0F172A',
                color: roleTab === 'CUSTOMER' ? '#00A8FF' : '#94A3B8',
                border: roleTab === 'CUSTOMER' ? '1px solid #00A8FF' : '1px solid #2A364F',
                fontWeight: 700,
                fontSize: '0.8rem'
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
                setError('');
              }}
              startIcon={<Wrench size={18} />}
              sx={{
                py: 1,
                backgroundColor: roleTab === 'TECHNICIAN' ? 'rgba(0, 168, 255, 0.15)' : '#0F172A',
                color: roleTab === 'TECHNICIAN' ? '#00A8FF' : '#94A3B8',
                border: roleTab === 'TECHNICIAN' ? '1px solid #00A8FF' : '1px solid #2A364F',
                fontWeight: 700,
                fontSize: '0.8rem'
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

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981' }}>
            {successMsg}
          </Alert>
        )}

        {/* FORM FIELDS */}
        <Box sx={{ mb: 3 }}>
          {isRegisterMode && (
            <>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Full Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    backgroundColor: '#0F172A',
                    '& fieldset': { borderColor: '#2A364F' }
                  }
                }}
              />
            </>
          )}

          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#FFF',
                backgroundColor: '#0F172A',
                '& fieldset': { borderColor: '#2A364F' }
              }
            }}
          />

          {isRegisterMode && (
            <>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 17XX-XXXXXX"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#FFF',
                    backgroundColor: '#0F172A',
                    '& fieldset': { borderColor: '#2A364F' }
                  }
                }}
              />
            </>
          )}

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
              mb: isRegisterMode && roleTab === 'TECHNICIAN' ? 2 : 3,
              '& .MuiOutlinedInput-root': {
                color: '#FFF',
                backgroundColor: '#0F172A',
                '& fieldset': { borderColor: '#2A364F' }
              }
            }}
          />

          {isRegisterMode && roleTab === 'TECHNICIAN' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Technician Specialty
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  sx={{
                    color: '#FFF',
                    backgroundColor: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#2A364F' }
                  }}
                >
                  {specialtiesList.map((spec) => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {isRegisterMode ? (
            <Button
              fullWidth
              variant="contained"
              onClick={handleRegister}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}
              sx={{
                backgroundColor: '#00A8FF',
                color: '#0D1527',
                py: 1.3,
                fontWeight: 700,
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#38BDF8' }
              }}
            >
              {loading ? 'Creating Account in Database...' : `Create ${roleTab === 'CUSTOMER' ? 'Customer' : 'Technician'} Account`}
            </Button>
          ) : (
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
          )}
        </Box>


      </Paper>
    </Box>
  );
};
