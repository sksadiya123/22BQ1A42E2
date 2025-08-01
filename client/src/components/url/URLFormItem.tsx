import { Grid, TextField, IconButton } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { UrlFormData } from '../../types';

interface URLFormItemProps {
  index: number;
  formData: UrlFormData;
  onChange: (index: number, field: keyof UrlFormData, value: string | number) => void;
  onRemove?: (index: number) => void;
  showRemove: boolean;
  errors: Partial<Record<keyof UrlFormData, string>>;
}

export default function URLFormItem({
  index,
  formData,
  onChange,
  onRemove,
  showRemove,
  errors,
}: URLFormItemProps) {
  return (
    <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Long URL *"
          type="url"
          value={formData.longUrl}
          onChange={(e) => onChange(index, 'longUrl', e.target.value)}
          placeholder="https://example.com/very-long-url"
          error={!!errors.longUrl}
          helperText={errors.longUrl}
          required
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <TextField
          fullWidth
          label="Custom Shortcode"
          value={formData.shortcode || ''}
          onChange={(e) => onChange(index, 'shortcode', e.target.value)}
          placeholder="abc123"
          inputProps={{ maxLength: 10 }}
          helperText="6-10 characters, letters & numbers"
          error={!!errors.shortcode}
        />
      </Grid>
      
      <Grid item xs={12} md={2}>
        <TextField
          fullWidth
          label="Validity (Minutes)"
          type="number"
          value={formData.validityMinutes || ''}
          onChange={(e) => onChange(index, 'validityMinutes', parseInt(e.target.value) || 0)}
          placeholder="60"
          inputProps={{ min: 1, max: 43200 }}
          helperText="Max 30 days (43200 min)"
          error={!!errors.validityMinutes}
        />
      </Grid>
      
      {showRemove && (
        <Grid item xs={12} md={1}>
          <IconButton
            onClick={() => onRemove?.(index)}
            color="error"
            size="small"
            sx={{ mt: 1 }}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
}
