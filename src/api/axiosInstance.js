import axios from 'axios';
import ENDPOINTS from './endpoints';

const baseURL = 'https://task-pro-2-0-backend.onrender.com';
// const baseURL = 'http://localhost:5050';

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(
  config => {
    let urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('token');
    const refreshToken = urlParams.get('refreshToken');
    console.log(urlParams.get('token'));
    console.log(urlParams.get('dmdmd'));

    if (config.method === 'get' && accessToken && refreshToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;

      localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
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
        const refreshToken =
          JSON.parse(localStorage.getItem('refreshToken')) ||
          JSON.parse(localStorage.getItem('persist:auth'))?.refreshToken?.split(
            '"'
          )[1] ||
          null;
        // console.log(refreshToken);
        const { data } = await axios.post(
          `${baseURL}/${ENDPOINTS.auth.refreshToken}`,
          {
            refreshToken,
          }
        );
        // console.log(data);
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
