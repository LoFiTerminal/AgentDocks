import axios from 'axios';
import { OnboardingConfig } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const saveConfig = async (config: OnboardingConfig) => {
  const response = await api.post('/api/config', config);
  return response.data;
};
