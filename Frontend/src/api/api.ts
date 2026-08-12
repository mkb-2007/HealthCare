import axios from "axios";

export const API_BASE_URL = (
    ((import.meta as any).env?.VITE_API_URL as string | undefined) || "http://localhost:8080"
).replace(/\/$/, "");

export default axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});