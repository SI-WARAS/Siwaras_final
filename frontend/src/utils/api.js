import api from "../lib/axios";

/**
 * Utility helper for GET requests using centralized Axios instance
 * Prevents URL mangling (e.g. converting https:// to https:/) and attaches Auth Token automatically.
 */
export async function apiGet(path) {
  const cleanPath = path.replace(/^\/+/, "");
  const response = await api.get(`/${cleanPath}`);
  return response.data;
}

export default apiGet;
