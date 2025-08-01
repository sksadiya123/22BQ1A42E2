import { Card, CardContent, Typography, Button, Chip, Box, Link } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { Url } from '@shared/schema';
import { UrlStatus } from '../../types';
import { log } from '../../services/logger';

interface URLListItemProps {
  url: Url;
}

export default function URLListItem({ url }: URLListItemProps) {
  const getUrlStatus = (): UrlStatus => {
    if (!url.expiresAt) return 'active';
    
    const now = new Date();
    const expiresAt = new Date(url.expiresAt);
    const timeToExpire = expiresAt.getTime() - now.getTime();
    
    if (timeToExpire <= 0) return 'expired';
    if (timeToExpire <= 3600000) return 'expiring-soon'; // 1 hour
    return 'active';
  };

  const getStatusChip = (status: UrlStatus) => {
    const props = {
      active: { color: 'success' as const, label: 'Active' },
      'expiring-soon': { color: 'warning' as const, label: 'Expires Soon' },
      expired: { color: 'error' as const, label: 'Expired' },
    };
    
    return <Chip {...props[status]} size="small" />;
  };

  const handleCopy = async () => {
    try {
      const shortUrl = `${window.location.origin}/${url.shortCode}`;
      await navigator.clipboard.writeText(shortUrl);
      await log('frontend', 'info', 'clipboard', `URL copied to clipboard: ${url.shortCode}`);
    } catch (error) {
      await log('frontend', 'error', 'clipboard', 'Failed to copy URL to clipboard');
    }
  };

  const shortUrl = `${window.location.origin}/${url.shortCode}`;
  const status = getUrlStatus();

  return (
    <Card className="mui-url-item" sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 2 }}>
      <Box className="mui-url-info" sx={{ flex: 1 }}>
        <Link 
          href={shortUrl}
          className="mui-url-short"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}
        >
          {shortUrl}
        </Link>
        
        <Typography 
          variant="body2" 
          className="mui-url-long"
          sx={{ color: 'text.secondary', mb: 1, wordBreak: 'break-all' }}
        >
          {url.longUrl}
        </Typography>
        
        <Box className="mui-url-meta" sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption">
            Created: {new Date(url.createdAt).toLocaleString()}
          </Typography>
          {url.expiresAt && (
            <Typography variant="caption">
              Expires: {new Date(url.expiresAt).toLocaleString()}
            </Typography>
          )}
          <Typography variant="caption">
            Clicks: {url.clickCount}
          </Typography>
        </Box>
      </Box>
      
      <Box className="mui-url-actions" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {getStatusChip(status)}
        <Button
          variant="outlined"
          size="small"
          startIcon={<CopyIcon />}
          onClick={handleCopy}
        >
          Copy
        </Button>
      </Box>
    </Card>
  );
}
