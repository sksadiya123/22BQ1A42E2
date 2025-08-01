import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  TextField, 
  Button, 
  Alert, 
  Typography, 
  Box 
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { urlApi } from '../services/api';
import { log } from '../services/logger';
import { RedirectTestResult } from '../types';

export default function RedirectTestPage() {
  const [shortCode, setShortCode] = useState('');
  const [testResult, setTestResult] = useState<RedirectTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: allUrls = [] } = useQuery({
    queryKey: ['/api/urls'],
  });

  const activeUrls = allUrls.filter(url => {
    if (!url.expiresAt) return true;
    return new Date(url.expiresAt) > new Date();
  });

  const handleTestRedirect = async () => {
    if (!shortCode.trim()) {
      await log('frontend', 'warn', 'redirect-test', 'Empty shortcode provided');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await urlApi.redirectUrl(shortCode);
      setTestResult({
        shortCode,
        longUrl: result.url,
        success: true,
      });
      await log('frontend', 'info', 'redirect-test', `Successfully tested redirect for shortcode: ${shortCode}`);
    } catch (error: any) {
      setTestResult({
        shortCode,
        longUrl: '',
        success: false,
        error: error.response?.data?.error || 'Failed to redirect',
      });
      await log('frontend', 'error', 'redirect-test', `Failed to test redirect: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTest = async (code: string) => {
    setShortCode(code);
    await log('frontend', 'info', 'redirect-test', `Quick test selected for shortcode: ${code}`);
    
    // Auto-trigger test
    try {
      const result = await urlApi.redirectUrl(code);
      setTestResult({
        shortCode: code,
        longUrl: result.url,
        success: true,
      });
    } catch (error: any) {
      setTestResult({
        shortCode: code,
        longUrl: '',
        success: false,
        error: error.response?.data?.error || 'Failed to redirect',
      });
    }
  };

  return (
    <div className="fade-in">
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              Redirect Handler Test
            </Typography>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Test the redirect functionality by entering a short URL code. In a real implementation, 
            this would handle routing for patterns like <code>/abc123</code> and redirect to the original URL.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Test Short URL Code"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="abc123"
              helperText="Enter a shortcode to test redirection"
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              startIcon={<LaunchIcon />}
              onClick={handleTestRedirect}
              disabled={isLoading || !shortCode.trim()}
            >
              {isLoading ? 'Testing...' : 'Test Redirect'}
            </Button>
          </Box>

          {testResult && (
            <Alert 
              severity={testResult.success ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Redirect Test Result
              </Typography>
              <Typography variant="body2">
                <strong>Short URL:</strong> {window.location.origin}/{testResult.shortCode}
              </Typography>
              {testResult.success ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Redirects to:</strong> {testResult.longUrl}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Error:</strong> {testResult.error}
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              Available Short URLs for Testing
            </Typography>
          }
        />
        <CardContent>
          {activeUrls.length === 0 ? (
            <Typography color="text.secondary">
              No active URLs available for testing. Create some URLs first.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activeUrls.map((url) => (
                <Card key={url.id} variant="outlined" className="mui-url-item">
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                    <Box className="mui-url-info" sx={{ flex: 1 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ fontWeight: 500, color: 'primary.main', mb: 0.5 }}
                      >
                        {url.shortCode}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        className="mui-url-long"
                        sx={{ color: 'text.secondary', mb: 1, wordBreak: 'break-all' }}
                      >
                        → {url.longUrl}
                      </Typography>
                      <Box className="mui-url-meta" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="caption">Status: Active</Typography>
                        <Typography variant="caption">Clicks: {url.clickCount}</Typography>
                      </Box>
                    </Box>
                    
                    <Box className="mui-url-actions">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LaunchIcon />}
                        onClick={() => handleQuickTest(url.shortCode)}
                      >
                        Test
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
