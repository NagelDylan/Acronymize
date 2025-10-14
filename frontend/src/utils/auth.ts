import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export const useAuthHeader = () => {
  const { getToken } = useAuth();

  const getAuthHeader = useCallback(async () => {
    const jwt = await getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "True",
    };

    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
    console.log(headers);
    return headers;
  }, [getToken]);

  return getAuthHeader;
};
