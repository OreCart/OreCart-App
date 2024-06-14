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

import {
  MantineColorsTuple,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import "@mantine/core/styles.layer.css";
import '@mantine/charts/styles.css';
const myColor: MantineColorsTuple = [
  "#ecf3fd",
  "#d7e4f6",
  "#a9c7f0",
  "#7aa7eb",
  "#548de6",
  "#3e7ce4",
  "#3373e4",
  "#2762cb",
  "#1e57b6",
  "#0d4ba1"
];
const theme = createTheme({
  colors: {
    myColor,
  },
});
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/vans",
        element: <VanPage />,
      },
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
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </React.StrictMode>
  </QueryClientProvider>
);
