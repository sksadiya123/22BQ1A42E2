import axios from 'axios';
import { Url, UrlWithClickLogs, ClickLog, InsertUrl } from '@shared/schema';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const urlApi = {
  createUrls: async (urls: InsertUrl[]): Promise<Url[]> => {
    const response = await api.post('/urls', urls);
    return response.data;
  },

  getAllUrls: async (): Promise<Url[]> => {
    const response = await api.get('/urls');
    return response.data;
  },

  getUrlStats: async (): Promise<{
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    expiredUrls: number;
  }> => {
    const response = await api.get('/urls/stats');
    return response.data;
  },

  getUrlsWithClickLogs: async (): Promise<UrlWithClickLogs[]> => {
    const response = await api.get('/urls/detailed');
    return response.data;
  },

  redirectUrl: async (shortCode: string): Promise<{ url: string }> => {
    const response = await api.get(`/redirect/${shortCode}`);
    return response.data;
  },
};

export const clickApi = {
  getAllClickLogs: async (): Promise<ClickLog[]> => {
    const response = await api.get('/clicks');
    return response.data;
  },
};

export default api;
