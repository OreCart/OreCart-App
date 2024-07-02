import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import AccommodationsPage from "./pages/accommodations/accommodations-page";
import AlertsPage from "./pages/alerts/alerts-page";
import RidershipPage from "./pages/ridership/ridership-page";
import RoutesPage from "./pages/routes/routes-page";
import VanPage from "./pages/vans/vans-page";
import Root from "./templates/root";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.layer.css";
import { VanStatusPage } from "./pages/van-status/van-status-page";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/vans",
        element: <VanPage />,
      },
      { path: "/van-status", element: <VanStatusPage /> },
      {
        path: "/ridership",
        element: <RidershipPage />,
      },
      {
        path: "/routes",
        element: <RoutesPage />,
      },
      {
        path: "/accommodations",
        element: <AccommodationsPage />,
      },
      {
        path: "alerts",
        element: <AlertsPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <MantineProvider forceColorScheme="light">
        <RouterProvider router={router} />
      </MantineProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
