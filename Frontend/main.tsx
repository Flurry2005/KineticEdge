import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import MainPanel, { Panel } from "./HomePage/MainPanel.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./Context/useAuth.tsx";
import LoginPage from "./LoginPage/LoginPage.tsx";

const router = createBrowserRouter([
  {
    children: [
      {
        path: "/",
        element: <MainPanel panel={Panel.HOME} />,
      },
      {
        path: "/dashboard",
        element: <MainPanel panel={Panel.DASHBOARD} />,
      },
      {
        path: "/workouts",
        element: <MainPanel panel={Panel.WORKOUTS} />,
      },
      {
        path: "/profile/:username",
        element: <MainPanel panel={Panel.PROFILE} />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/settings",
        element: <MainPanel panel={Panel.SETTINGS} />,
      },
      {
        path: "/measurements",
        element: <MainPanel panel={Panel.MEASUREMENTS} />,
      },
      {
        path: "/nutrition",
        element: <MainPanel panel={Panel.NUTRITION} />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
