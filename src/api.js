import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Cloudinary image ko automatically resize aur compress karta hai.
 * Normal/local URL ho to same URL return karega.
 */
export function asset(url, width = 700) {
  if (!url) {
    return "";
  }

  const imageUrl = String(url).trim();

  if (
    imageUrl.includes("res.cloudinary.com") &&
    imageUrl.includes("/image/upload/")
  ) {
    // Transformation pehle se lagi ho to dobara mat lagao
    if (
      imageUrl.includes("/f_auto,") ||
      imageUrl.includes("/q_auto,")
    ) {
      return imageUrl;
    }

    return imageUrl.replace(
      "/image/upload/",
      `/image/upload/f_auto,q_auto:eco,w_${width},c_limit/`
    );
  }

  return imageUrl;
}

export default API;