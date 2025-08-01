import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { Launch as LaunchIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link } from 'wouter';
import { urlApi } from '../services/api';
import { log } from '../services/logger';

export default function RedirectHandler() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [longUrl, setLongUrl] = useState<string>('');

  useEffect(() => {
    if (!shortCode) {
      setStatus('error');
      setError('No short code provided');
      return;
    }

    const handleRedirect = async () => {
      try {
        await log('frontend', 'info', 'redirect-handler', `Attempting to redirect shortcode: ${shortCode}`);
        
        const result = await urlApi.redirectUrl(shortCode);
        setLongUrl(result.url);
        setStatus('redirecting');
        
        await log('frontend', 'info', 'redirect-handler', `Redirecting to: ${result.url}`);
        
        // Short delay to show the redirect message, then redirect
        setTimeout(() => {
          window.location.href = result.url;
        }, 2000);
        
      } catch (error: any) {
        setStatus('error');
        setError(error.response?.data?.error || 'URL not found or expired');
        await log('frontend', 'error', 'redirect-handler', `Redirect failed: ${error.message}`);
      }
    };

    handleRedirect();
  }, [shortCode]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Looking up URL...</Typography>
          </Box>
        );

      case 'redirecting':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Redirect Found!
              </Typography>
              <Typography variant="body2">
                You will be redirected to: <strong>{longUrl}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                If you are not redirected automatically, click the button below.
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              startIcon={<LaunchIcon />}
              href={longUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2 }}
            >
              Go to {longUrl}
            </Button>
          </Box>
        );

      case 'error':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                URL Not Found
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
            
            <Button
              variant="contained"
              component={Link}
              href="/"
              startIcon={<HomeIcon />}
              sx={{ mt: 2 }}
            >
              Go to Home
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <Card sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            URL Redirect
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Short URL: <code>{window.location.origin}/{shortCode}</code>
          </Typography>
          
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
