import axios from "axios";
import toast from "react-hot-toast";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "An unexpected error occurred";
        // Only show toast if it's not a 401 and we're in the browser
        if (typeof window !== "undefined" && error.response?.status !== 401) {
            toast.error(message);
        }
        return Promise.reject(error);
    }
);

export default instance;
