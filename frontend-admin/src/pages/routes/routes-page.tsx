import { Modal } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { clearRoutes, fetchStops, getKML } from "../../api/routes";
import Card from "../../components/card/card";
import AddRouteForm from "./add-route-form";
import { Route, Stop } from "./route-types";
import "./routes-page.scss";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const fetchRoutes = async () => {
  const response = await fetch(`${baseUrl}/routes/`);
  const data = await response.json();
  const route_data = data as Route[];
  return route_data;
};

const RoutesPage: React.FC = () => {
  const {
    data: routes,
    isLoading,
    error,
  } = useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });

  const [currentRouteId, setCurrentRouteId] = useState<number>(-1);
  const [isRouteEditModalOpen, setIsRouteEditModalOpen] =
    useState<boolean>(false);
  const [isRouteAddModalOpen, setIsRouteAddModalOpen] =
    useState<boolean>(false);

  const {
    data: stops,
    isLoading: stopsLoading,
    error: stopsError,
  } = useQuery({
    queryKey: ["stops", currentRouteId],
    queryFn: () => fetchStops(currentRouteId),
  });

  const queryClient = useQueryClient();

  const handleFormSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`${baseUrl}/routes/`, {
        method: "POST",
        body: formData, // FormData is directly sent without setting Content-Type header
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Handle the successful response
      await queryClient.invalidateQueries({ queryKey: ["routes"] });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <main className="p-routes-page">
      <Modal
        opened={isRouteEditModalOpen}
        onClose={() => setIsRouteEditModalOpen(false)}
      >
        {stopsLoading ? (
          <div>Loading...</div>
        ) : stopsError ? (
          <div>An error occurred: {(stopsError as Error).message}</div>
        ) : (
          stops?.map((stop: Stop) => `${stop}`)
        )}
        <button
          type="button"
          onClick={() => {
            setIsRouteEditModalOpen(false);
          }}
        >
          Cancel
        </button>
      </Modal>

      <h1>Routes</h1>
      <div className="cards-container">
        {routes?.map((route: Route) => (
          <Card
            title={`${route.name} (${route.id})`}
            onClick={() => {
              setCurrentRouteId(route.id);
              setIsRouteEditModalOpen(true);
            }}
            key={route.id}
          ></Card>
        ))}
      </div>

      {(!routes || routes?.length == 0) && (
        <button
          onClick={() => {
            setIsRouteAddModalOpen(true);
          }}
        >
          Add Route
        </button>
      )}

      {!(!routes || routes?.length == 0) && (
        <button
          onClick={() => {
            clearRoutes(queryClient);
          }}
        >
          Clear Routes
        </button>
      )}

      {!(!routes || routes?.length == 0) && (
        <button
          onClick={() => {
            getKML();
          }}
        >
          Get KML
        </button>
      )}

      <Modal
        opened={isRouteAddModalOpen}
        onClose={() => setIsRouteAddModalOpen(false)}
      >
        <AddRouteForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsRouteAddModalOpen(false)}
        />
      </Modal>
    </main>
  );
};

export default RoutesPage;
