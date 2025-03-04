'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Link as MuiLink
} from '@mui/material';
import {
  EmailOutlined as EmailIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import Link from 'next/link';

const steps = ['Request Reset', 'Check Email', 'Reset Password'];

export default function ResetPasswordPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    // Clear error when user starts typing again
    if (error) setError('');
  };
  
  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetToken(event.target.value);
    if (error) setError('');
  };
  
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    if (error) setError('');
  };
  
  const handleConfirmPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
    if (error) setError('');
  };
  
  const handleRequestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real implementation, this would call the API
      console.log('Reset password requested for:', email);
      
      // Move to next step
      setActiveStep(1);
    } catch (err) {
      console.error('Reset request failed:', err);
      setError('Reset request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyToken = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    if (!resetToken) {
      setError('Please enter the reset token');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real implementation, this would call the API
      console.log('Token verification for:', resetToken);
      
      // Move to next step
      setActiveStep(2);
    } catch (err) {
      console.error('Token verification failed:', err);
      setError('Invalid or expired token. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Basic validation
    if (!password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real implementation, this would call the API
      console.log('Password reset completed');
      
      // Move to next step (success)
      setActiveStep(3);
    } catch (err) {
      console.error('Password reset failed:', err);
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={handleRequestReset}>
            <Typography variant="body1" gutterBottom>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              fullWidth
              required
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              margin="normal"
              autoFocus
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Remember your password?{' '}
                <MuiLink component={Link} href="/login">
                  Back to login
                </MuiLink>
              </Typography>
            </Box>
          </form>
        );
        
      case 1:
        return (
          <form onSubmit={handleVerifyToken}>
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" paragraph>
                We've sent instructions to {email}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you don't see the email, check your spam folder or try another email address.
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              required
              label="Enter Reset Token"
              name="resetToken"
              value={resetToken}
              onChange={handleTokenChange}
              margin="normal"
              helperText="Enter the token from the email we sent you"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Token'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                color="primary" 
                variant="text" 
                onClick={() => setActiveStep(0)}
              >
                Try a different email
              </Button>
            </Box>
          </form>
        );
        
      case 2:
        return (
          <form onSubmit={handleResetPassword}>
            <Typography variant="body1" gutterBottom>
              Enter your new password below.
            </Typography>
            
            <TextField
              fullWidth
              required
              label="New Password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              margin="normal"
              autoFocus
            />
            
            <TextField
              fullWidth
              required
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              margin="normal"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
            </Button>
          </form>
        );
        
      case 3:
        return (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Password Reset Complete
            </Typography>
            <Typography variant="body1" paragraph>
              Your password has been reset successfully.
            </Typography>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
            >
              Return to Login
            </Button>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 4
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Reset Password
          </Typography>
          
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ width: '100%', mt: 2 }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
} 