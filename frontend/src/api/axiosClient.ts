import axios from "axios";

const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    "http://localhost:5164/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;