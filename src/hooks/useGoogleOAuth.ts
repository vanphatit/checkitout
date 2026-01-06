import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9091";
const OAUTH_URL = `${API_BASE_URL}/api/v1/auth/google`;

export const useGoogleOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = () => {
    setIsLoading(true);
    // Direct redirect to OAuth endpoint (no popup)
    window.location.href = OAUTH_URL;
  };

  return { login, isLoading };
};
