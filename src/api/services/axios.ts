import { signOut } from "@/lib/auth";
import axios, { AxiosError } from "axios";

const $apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_URL}/api`,
  withCredentials: true,
});

const handleError = (error: Error | AxiosError) => {
  if (typeof window === "undefined") {
    console.log({ handleError: error });
    return;
  }

  if (axios.isAxiosError(error) && !!error.response?.data?.message) {
    if (error.response.status === 401) {
      signOut({ redirectTo: "sign-in" });
    }
    return Promise.reject(error.response.data);
  } else {
    return Promise.reject(error);
  }
};

$apiClient.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
}, handleError);

$apiClient.interceptors.response.use((response) => response.data, handleError);

export default $apiClient;
