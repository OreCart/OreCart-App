import { Button, Modal, Paper, Stack, Title } from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import AddVanForm from "./add-van-form.tsx";
import VanEditForm from "./edit-van-form.tsx";
import { Van, VanData } from "./van-types.tsx";
import "./vans-page.scss";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const fetchVans = async () => {
  const response = await fetch(`${baseUrl}/vans/`);
  const data = await response.json();
  const van_data = (data as Van[]) || [];
  return van_data;
};

const VanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const {
    data: vans,
    isLoading,
    error,
  } = useQuery({ queryKey: ["vans"], queryFn: fetchVans });

  const [currentVanId, setCurrentVanId] = useState<number>(-1);
  const [isEditVanModalOpen, setEditVanModalOpened] = useState<boolean>(false);
  const [isAddVanModalOpen, setIsAddVanModalOpen] = useState<boolean>(false);

  const createVan = async (vanData: VanData) => {
    // Convert the routeId to an integer
    try {
      await fetch(`${baseUrl}/vans/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vanData),
        credentials: 'include',
      });
      await queryClient.invalidateQueries({ queryKey: ["vans"] });
      // ... Handle the response ...
    } catch (error) {
      console.error("Error creating van:", error);
    }
  };

  const openVanEditForm = (vanId: number) => {
    setCurrentVanId(vanId);
    setEditVanModalOpened(true);
  };

  const editVanSubmit = async (vanData: VanData) => {
    // Convert the routeId to an integer
    try {
      await fetch(`${baseUrl}/vans/${currentVanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vanData),
        credentials: 'include',
      });
      await queryClient.invalidateQueries({ queryKey: ["vans"] });
      setEditVanModalOpened(false);
      // ... Handle the response ...
    } catch (error) {
      console.error("Error creating van:", error);
    }
  };

  const deleteVan = async () => {
    try {
      await fetch(`${baseUrl}/vans/${currentVanId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });
      await queryClient.invalidateQueries({ queryKey: ["vans"] });
      setCurrentVanId(-1);
      setEditVanModalOpened(false);
    } catch (error) {
      console.error("Error creating van:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <main className="p-van-page">
      <Stack gap="md">
        <Title> Vans</Title>
        <div className="van-grid">
          {vans?.map((van: Van) => (
            <Paper
              p="md"
              shadow="xs"
              className="van-card"
              onClick={() => {
                openVanEditForm(van.id);
              }}
            >
              <Title order={2}>Van #{van.id}</Title>
            </Paper>
          ))}
        </div>

        <Button
          className="add-button"
          onClick={() => setIsAddVanModalOpen(true)}
        >
          Add Van
        </Button>
        <Modal
          centered
          title={<Title order={2}>Add Van</Title>}
          opened={isAddVanModalOpen}
          onClose={() => setIsAddVanModalOpen(false)}
        >
          <AddVanForm
            onSubmit={createVan}
            onCancel={() => setIsAddVanModalOpen(false)}
          />
        </Modal>

        <Modal
          centered
          title={<Title order={2}>Edit Van #{currentVanId}</Title>}
          opened={isEditVanModalOpen}
          onClose={() => setEditVanModalOpened(false)}
        >
          <VanEditForm
            onSubmit={editVanSubmit}
            onDelete={deleteVan}
            onCancel={() => setEditVanModalOpened(false)}
          />
        </Modal>
        {/* </dialog> */}
      </Stack>
    </main>
  );
};

export default VanPage;
