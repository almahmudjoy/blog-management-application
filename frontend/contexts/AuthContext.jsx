"use client";

/**
 * Global authentication state (requirement 12).
 *
 * - `login()` stores the token, then loads the canonical profile from
 *   GET /api/users/profile so role/avatar always come from the backend.
 * - On mount, an existing token is re-validated the same way; an invalid one
 *   is discarded, so a refresh keeps the session only while it is still valid.
 * - `refreshProfile()` lets the profile/avatar screens re-read the profile after
 *   a mutation, so the Navbar avatar updates immediately without a re-login
 *   (requirement 22). The API's profile/status endpoints return a message only,
 *   so re-reading is the only way to get the saved values.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as authService from "@/services/auth.service";
import * as userService from "@/services/user.service";
import {
  clearToken,
  getToken,
  isAdmin as isAdminUser,
  setToken,
  UNAUTHORIZED_EVENT,
} from "@/utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  // `initialising` is true until the stored token has been validated once.
  const [initialising, setInitialising] = useState(true);

  const clearSession = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getToken()) {
        setInitialising(false);
        return;
      }
      try {
        const profile = await userService.getProfile();
        if (!cancelled) setUser(profile || null);
      } catch {
        // Invalid/expired token, or the account was deactivated.
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setInitialising(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // React to 401s raised anywhere in the app.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, user: loginUser } = await authService.login(credentials);
    setToken(token);
    try {
      const profile = await userService.getProfile();
      setUser(profile || loginUser || null);
      return profile || loginUser || null;
    } catch (error) {
      // Profile lookup failed (e.g. deactivated account) -> no session.
      clearToken();
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(
    ({ redirect = true } = {}) => {
      clearSession();
      if (redirect) router.replace("/login");
    },
    [clearSession, router]
  );

  const refreshProfile = useCallback(async () => {
    const profile = await userService.getProfile();
    setUser(profile || null);
    return profile;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialising,
      isAuthenticated: Boolean(user),
      isAdmin: isAdminUser(user),
      login,
      logout,
      refreshProfile,
    }),
    [user, initialising, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
