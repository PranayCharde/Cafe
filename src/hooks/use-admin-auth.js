import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminAuth = create()(
  persist(
    (set, get) => ({
      adminUser: null,
      token: null,
      isAuthenticated: false,

      login: (token, user) => {
        set({
          adminUser: user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          adminUser: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "cafe-admin-auth",
    }
  )
);

