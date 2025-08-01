import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Alert, 
  Box, 
  Typography 
} from '@mui/material';
import { Add as AddIcon, Link as LinkIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import URLFormItem from '../components/url/URLFormItem';
import URLListItem from '../components/url/URLListItem';
import { UrlFormData } from '../types';
import { urlApi } from '../services/api';
import { log } from '../services/logger';
import { insertUrlSchema } from '@shared/schema';
import { z } from 'zod';

const MAX_URLS = 5;

export default function URLShortenerPage() {
  const [urlForms, setUrlForms] = useState<UrlFormData[]>([
    { longUrl: '', shortcode: '', validityMinutes: undefined }
  ]);
  const [errors, setErrors] = useState<Partial<Record<keyof UrlFormData, string>>[]>([{}]);
  const [showSuccess, setShowSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: recentUrls = [], isLoading } = useQuery({
    queryKey: ['/api/urls'],
    select: (data) => data.slice(0, 10), // Show only recent 10 URLs
  });

  const createUrlsMutation = useMutation({
    mutationFn: urlApi.createUrls,
    onSuccess: async (data) => {
      await log('frontend', 'info', 'url-shortener', `Successfully created ${data.length} URLs`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Reset forms
      setUrlForms([{ longUrl: '', shortcode: '', validityMinutes: undefined }]);
      setErrors([{}]);
      
      // Refresh the URL list
      queryClient.invalidateQueries({ queryKey: ['/api/urls'] });
    },
    onError: async (error: any) => {
      await log('frontend', 'error', 'url-shortener', `Failed to create URLs: ${error.message}`);
    },
  });

  const addUrlForm = async () => {
    if (urlForms.length < MAX_URLS) {
      setUrlForms([...urlForms, { longUrl: '', shortcode: '', validityMinutes: undefined }]);
      setErrors([...errors, {}]);
      await log('frontend', 'info', 'url-shortener', `Added URL form ${urlForms.length + 1}`);
    }
  };

  const removeUrlForm = async (index: number) => {
    if (urlForms.length > 1) {
      const newForms = urlForms.filter((_, i) => i !== index);
      const newErrors = errors.filter((_, i) => i !== index);
      setUrlForms(newForms);
      setErrors(newErrors);
      await log('frontend', 'info', 'url-shortener', `Removed URL form ${index + 1}`);
    }
  };

  const handleFormChange = (index: number, field: keyof UrlFormData, value: string | number) => {
    const newForms = [...urlForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setUrlForms(newForms);

    // Clear error for this field
    const newErrors = [...errors];
    if (newErrors[index] && newErrors[index][field]) {
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validateForms = () => {
    const newErrors: Partial<Record<keyof UrlFormData, string>>[] = [];
    let isValid = true;

    urlForms.forEach((form, index) => {
      const formErrors: Partial<Record<keyof UrlFormData, string>> = {};

      try {
        insertUrlSchema.parse({
          longUrl: form.longUrl,
          shortCode: form.shortcode,
          validityMinutes: form.validityMinutes,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const path = err.path[0] as keyof UrlFormData;
            formErrors[path] = err.message;
          });
        }
      }

      if (form.shortcode && (form.shortcode.length < 6 || form.shortcode.length > 10)) {
        formErrors.shortcode = 'Shortcode must be 6-10 characters';
      }

      if (form.validityMinutes && (form.validityMinutes < 1 || form.validityMinutes > 43200)) {
        formErrors.validityMinutes = 'Validity must be between 1 and 43200 minutes';
      }

      newErrors[index] = formErrors;
      if (Object.keys(formErrors).length > 0) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await log('frontend', 'info', 'url-shortener', 'URL shortening form submitted');

    if (!validateForms()) {
      await log('frontend', 'warn', 'url-shortener', 'Form validation failed');
      return;
    }

    const validForms = urlForms.filter(form => form.longUrl.trim() !== '');
    
    if (validForms.length === 0) {
      await log('frontend', 'warn', 'url-shortener', 'No valid URLs to process');
      return;
    }

    createUrlsMutation.mutate(validForms.map(form => ({
      longUrl: form.longUrl,
      shortCode: form.shortcode || undefined,
      validityMinutes: form.validityMinutes || undefined,
    })));
  };

  return (
    <div className="fade-in">
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              Create Short URLs
            </Typography>
          }
        />
        <CardContent>
          {showSuccess && (
            <Alert 
              severity="success" 
              className="mui-success-message"
              sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
            >
              URLs shortened successfully!
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {urlForms.map((form, index) => (
              <URLFormItem
                key={index}
                index={index}
                formData={form}
                onChange={handleFormChange}
                onRemove={removeUrlForm}
                showRemove={urlForms.length > 1}
                errors={errors[index] || {}}
              />
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              {urlForms.length < MAX_URLS && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addUrlForm}
                >
                  Add URL ({MAX_URLS - urlForms.length} remaining)
                </Button>
              )}
              
              <Button
                type="submit"
                variant="contained"
                startIcon={<LinkIcon />}
                disabled={createUrlsMutation.isPending}
                sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
              >
                {createUrlsMutation.isPending ? 'Shortening...' : 'Shorten URLs'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title={
            <Typography variant="h6" component="h2">
              Recently Created URLs
            </Typography>
          }
        />
        <CardContent>
          {isLoading ? (
            <Typography>Loading URLs...</Typography>
          ) : recentUrls.length === 0 ? (
            <Typography color="text.secondary">
              No URLs created yet. Start by creating your first short URL above.
            </Typography>
          ) : (
            <Box>
              {recentUrls.map((url) => (
                <URLListItem key={url.id} url={url} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
