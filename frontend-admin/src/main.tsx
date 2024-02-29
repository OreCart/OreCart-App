import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { redirect, RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import AccommodationsPage from "./pages/accommodations/accommodations-page";
import AlertsPage from "./pages/alerts/alerts-page";
import LoginPage from "./pages/login/login-page";
import RidershipPage from "./pages/ridership/ridership-page";
import RoutesPage from "./pages/routes/routes-page";
import VanPage from "./pages/vans/vans-page";
import Root from "./templates/root";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.layer.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

async function authRedirect( {request}: {request: Request}) {
  // avoid infinite redirect loop
  if (new URL(request.url).pathname == '/login') return null;
  let loggedIn = false;
  await fetch(`${baseUrl}/auth/check`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((response) => {
      loggedIn = (response.status != 401);
    })
    .catch(() => {
      throw new Error('Network response was not ok');
    });
  return loggedIn ? null : redirect("/login");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: authRedirect,
    children: [
      {
        path: "/vans",
        element: <VanPage />,
        loader: authRedirect,
      },
      {
        path: "/ridership",
        element: <RidershipPage />,
        loader: authRedirect,
      },
      {
        path: "/routes",
        element: <RoutesPage />,
        loader: authRedirect,
      },
      {
        path: "/accommodations",
        element: <AccommodationsPage />,
        loader: authRedirect,
      },
      {
        path: "alerts",
        element: <AlertsPage />,
        loader: authRedirect,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
