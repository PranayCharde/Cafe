import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create()(
  persist(
    (set, get) => ({
      user: null,
      tableNumber: null,
      isAuthenticated: false,

      login: (userData) => {
        set({
          user: {
            name: userData.name,
            phone: userData.phone,
            email: userData.email || "",
            role: userData.role || "customer",
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setTable: (tableNum) => {
        set({ tableNumber: String(tableNum) });
      },

      clearTable: () => {
        set({ tableNumber: null });
      },
    }),
    {
      name: "cafe-auth-session",
    }
  )
);

