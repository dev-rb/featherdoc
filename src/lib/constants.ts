export const API_URL = import.meta.env.DEV ? 'http://127.0.0.1:8090' : import.meta.env.VITE_API_URL;
// export const API_URL = import.meta.env.VITE_API_URL;

export const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/svg+xml',
  'video/mp4',
  'video/mpeg',
  'application/javascript',
  'application/json',
  'text/html',
  'text/plain',
];
