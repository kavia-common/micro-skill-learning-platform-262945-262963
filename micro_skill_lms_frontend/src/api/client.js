//
// PUBLIC_INTERFACE
// apiClient
//   Axios instance configured with baseURL from REACT_APP_API_BASE and Authorization header from AuthContext token.
//
import axios from 'axios';

/**
 * PUBLIC_INTERFACE
 * createApiClient
 * Creates an Axios instance with baseURL and interceptors to attach Bearer token.
 * Consumers can import the default client or create a new one with a custom token getter.
 *
 * @param {() => string|null} [getToken] - Function returning the current JWT token (without "Bearer " prefix).
 * @returns {import('axios').AxiosInstance} Configured axios instance.
 */
export function createApiClient(getToken) {
  const baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

  const instance = axios.create({
    baseURL,
    withCredentials: true, // backend CORS allows credentials
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Attach Authorization header if token exists
  instance.interceptors.request.use((config) => {
    try {
      const token = typeof getToken === 'function' ? getToken() : null;
      if (token) {
        // eslint-disable-next-line no-param-reassign
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
    } catch {
      // ignore token errors; proceed without auth header
    }
    return config;
  });

  return instance;
}

/**
 * PUBLIC_INTERFACE
 * getDefaultApiClient
 * Returns a singleton API client. You can pass a token getter later via setTokenGetter.
 */
let tokenGetter = null;
let defaultClient = null;

export function setTokenGetter(fn) {
  tokenGetter = fn;
  // Recreate client so new getter is used for subsequent calls
  defaultClient = createApiClient(tokenGetter);
}

export function getDefaultApiClient() {
  if (!defaultClient) {
    defaultClient = createApiClient(tokenGetter);
  }
  return defaultClient;
}

export default getDefaultApiClient();
