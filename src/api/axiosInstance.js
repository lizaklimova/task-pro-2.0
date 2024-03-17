import axios from 'axios';
import ENDPOINTS from './endpoints';

const baseURL = 'https://task-pro-2-0-backend.onrender.com';
// const baseURL = 'http://localhost:5050';

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL,
});

axiosInstance.interceptors.request.use(
  config => {
    const urlParams = new URLSearchParams(window.location.search);

    if (config.method === 'get' && urlParams.size === 2) {
      const accessToken = urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');

      config.headers.Authorization = `Bearer ${accessToken}`;

      document.cookie = `refreshToken=${refreshToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  req => {
    return req;
  },
  async error => {
    if (
      error.response.status === 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      error.config._isRetry = true;

      try {
        const { data } = await axios.get(
          `${baseURL}/${ENDPOINTS.auth.refreshToken}`,
          {
            withCredentials: true,
          }
        );
        console.log(data);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.user.tokenAccess}`;

        return axiosInstance.request(error.config);
      } catch (error) {
        console.log('Unauthorized');
      }
    }
    throw error;
  }
);

export default axiosInstance;
