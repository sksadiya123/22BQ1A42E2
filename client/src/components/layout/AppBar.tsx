import { AppBar as MuiAppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { useLocation } from 'wouter';
import { Link } from 'wouter';
import { log } from '../../services/logger';

const navigationTabs = [
  { label: 'URL Shortener', path: '/', icon: 'link' },
  { label: 'Statistics', path: '/stats', icon: 'analytics' },
  { label: 'Redirect Test', path: '/redirect-test', icon: 'launch' },
];

export default function AppBar() {
  const [location] = useLocation();

  const handleNavigation = async (path: string, label: string) => {
    await log('frontend', 'info', 'navigation', `Navigated to ${label} page`);
  };

  return (
    <MuiAppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LinkIcon />
          <Typography variant="h6" component="h1">
            AffordMed URL Shortener
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {navigationTabs.map((tab) => (
            <Button
              key={tab.path}
              color="inherit"
              component={Link}
              href={tab.path}
              onClick={() => handleNavigation(tab.path, tab.label)}
              sx={{
                backgroundColor: location === tab.path ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
                borderRadius: 1,
                px: 2,
                py: 1,
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
