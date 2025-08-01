import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="mui-card-stats">
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        {icon && (
          <Box sx={{ mb: 2, color: 'primary.main' }}>
            {icon}
          </Box>
        )}
        <Typography 
          variant="h3" 
          component="div" 
          className="mui-stat-number"
          sx={{ fontWeight: 500, color: 'primary.main', mb: 1 }}
        >
          {value}
        </Typography>
        <Typography 
          variant="body2" 
          className="mui-stat-label"
          sx={{ color: 'text.secondary' }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}
