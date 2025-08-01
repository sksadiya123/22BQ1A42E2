import { 
  Card, 
  CardHeader, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton, 
  Typography, 
  Box, 
  Link
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import StatCard from '../components/stats/StatCard';
import { urlApi, clickApi } from '../services/api';
import { log } from '../services/logger';
import { useEffect } from 'react';

export default function StatisticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/urls/stats'],
    queryFn: urlApi.getUrlStats,
  });

  const { data: urlsWithLogs = [], isLoading: urlsLoading } = useQuery({
    queryKey: ['/api/urls/detailed'],
    queryFn: urlApi.getUrlsWithClickLogs,
  });

  const { data: clickLogs = [], isLoading: clicksLoading } = useQuery({
    queryKey: ['/api/clicks'],
    queryFn: clickApi.getAllClickLogs,
  });

  useEffect(() => {
    log('frontend', 'info', 'statistics', 'Statistics page loaded');
  }, []);

  const getStatusChip = (url: any) => {
    if (!url.expiresAt) {
      return <Chip label="Active" color="success" size="small" />;
    }
    
    const now = new Date();
    const expiresAt = new Date(url.expiresAt);
    
    if (expiresAt <= now) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    
    const timeToExpire = expiresAt.getTime() - now.getTime();
    if (timeToExpire <= 3600000) { // 1 hour
      return <Chip label="Expires Soon" color="warning" size="small" />;
    }
    
    return <Chip label="Active" color="success" size="small" />;
  };

  const handleViewDetails = async (shortCode: string) => {
    await log('frontend', 'info', 'statistics', `Viewed details for URL: ${shortCode}`);
  };

  if (statsLoading || urlsLoading || clicksLoading) {
    return (
      <div className="fade-in">
        <Typography>Loading statistics...</Typography>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Box className="mui-grid mui-grid-4" sx={{ mb: 4 }}>
        <StatCard title="Total URLs Created" value={stats?.totalUrls || 0} />
        <StatCard title="Total Clicks" value={stats?.totalClicks || 0} />
        <StatCard title="Active URLs" value={stats?.activeUrls || 0} />
        <StatCard title="Expired URLs" value={stats?.expiredUrls || 0} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              All URLs Overview
            </Typography>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urlsWithLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        No URLs found. Create some URLs to see statistics.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  urlsWithLogs.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>
                        <Link
                          href={`/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                        >
                          {window.location.origin}/{url.shortCode}
                        </Link>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, wordBreak: 'break-all' }}>
                        {url.longUrl}
                      </TableCell>
                      <TableCell>
                        {new Date(url.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {url.expiresAt ? new Date(url.expiresAt).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>{url.clickCount}</TableCell>
                      <TableCell>{getStatusChip(url)}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(url.shortCode)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              Detailed Click Logs
            </Typography>
          }
        />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Source IP</TableCell>
                  <TableCell>User Agent</TableCell>
                  <TableCell>Referrer</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clickLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3 }}>
                      <Typography color="text.secondary">
                        No click logs found. URLs need to be clicked to generate logs.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  clickLogs.map((log) => {
                    const url = urlsWithLogs.find(u => u.id === log.urlId);
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {url ? `${window.location.origin}/${url.shortCode}` : 'Unknown'}
                        </TableCell>
                        <TableCell>{log.sourceIp || 'Unknown'}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {log.userAgent || 'Unknown'}
                        </TableCell>
                        <TableCell>{log.referrer || 'Direct'}</TableCell>
                        <TableCell>{log.location || 'Unknown'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </div>
  );
}
