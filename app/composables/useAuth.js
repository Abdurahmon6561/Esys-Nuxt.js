import { useRuntimeConfig } from '#app';
import { useI18n } from 'vue-i18n';

export function useAuth() {
  const config = useRuntimeConfig();
  const apiUrl = config.public.apiUrl || 'https://xrn-a2s-98a-sa7.esys.pro/api/v1/';

  const { locale } = useI18n(); // Get current locale
  const username = config.apiUsername || 'esys_api';
  const password = config.apiPassword || 'Esys@e3420242025';
  const base64Credentials = btoa(`${username}:${password}`);

  const headers = {
    Authorization: `Basic ${base64Credentials}`,
    'Content-Type': 'application/json',
    'Content-Language': locale.value, // Dynamic language
  };

  return { apiUrl, headers };
} 