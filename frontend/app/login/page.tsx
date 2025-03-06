'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { formatErrorMessage } from '../utils/api';

// Define validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password should be of minimum 8 characters length')
    .required('Password is required')
});

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, error: authError, isAuthenticated, isLoading, clearError } = useAuth();

  // Check for redirects and messages
  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // Check for query params (e.g. ?registered=true)
    const registered = searchParams.get('registered');
    const reset = searchParams.get('reset');
    
    if (registered === 'true') {
      alert('Registration successful! You can now log in with your credentials.');
    }
    
    if (reset === 'true') {
      alert('Password reset successful! You can now log in with your new password.');
    }
  }, [isAuthenticated, router, searchParams]);

  // Clear auth errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Update local error state when auth error changes
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setLoginError('');
    
    try {
      console.log('Login attempt:', values.email);
      await login(values.email, values.password);
      
      // No need to redirect here, the AuthContext will handle it
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(formatErrorMessage(err) || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container maxWidth="sm">
      <Box my={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Sign in header */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <LockIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
          </Box>

          {/* Error alert */}
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  margin="normal"
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Box mt={2} mb={2} textAlign="right">
                  <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Forgot password?
                    </Typography>
                  </Link>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || isLoading}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {(isSubmitting || isLoading) ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <Divider sx={{ my: 2 }} />
                <Grid container justifyContent="center">
                  <Grid item>
                    <Typography variant="body2">
                      Don't have an account?{' '}
                      <Link href="/signup" style={{ textDecoration: 'none' }}>
                        <Typography component="span" variant="body2" color="primary">
                          Sign up
                        </Typography>
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
} 