import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import Card from '../../components/card/card';
import AddAlertForm from './add-alert-form';
import { Alert, AlertData, AlertEditFormMethods } from './alert-types';
import './alerts-page.scss';
import EditAlertForm from './edit-alert-form';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const fetchAlerts = async () => {
  const response = await fetch(`${baseUrl}/alerts/`);
  const data = await response.json();
  const alert_data = data as Alert[];
  return alert_data;
};

const AlertsPage: React.FC = () => {
  const { data: alerts, isLoading, error } = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const dialogEditRef = useRef<HTMLDialogElement>(null);
  const [ currentAlertId, setCurrentAlertId ] = useState<number>(-1);
  const alertEditFormRef = useRef<AlertEditFormMethods>(null);

  const handleAddAlert = () => {
    dialogRef.current?.showModal();
  };

  const handleFormSubmit = async (formData: AlertData) => {
    try {
      const response = await fetch(`${baseUrl}/alerts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Handle the successful response 
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      dialogRef.current?.close();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleEdit = (alertId: number) => {
    setCurrentAlertId(alertId);
    dialogEditRef.current?.showModal();
    alertEditFormRef.current?.clearForm();
    const alert = alerts?.find((alert: Alert) => alert.id === alertId);
    if (alert) {
      alertEditFormRef.current?.setData(alert);
    }
  };

  const handleEditSubmit = async (formData: AlertData) => {
    try {
      const response = await fetch(`${baseUrl}/alerts/${currentAlertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Handle the successful response
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setCurrentAlertId(-1);
      dialogEditRef.current?.close();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const handleDeleteAlert = async () => {
    try {
      const response = await fetch(`${baseUrl}/alerts/${currentAlertId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Handle the successful response
      await queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setCurrentAlertId(-1);
      dialogEditRef.current?.close();
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <main className='p-alerts-page'>
      <h1>Alerts</h1>
      <div className="cards-container">
        {alerts?.map((alert: Alert) => (
          <Card title={`Alert ${alert.id}`} key={alert.id} onClick={() => {handleEdit(alert.id)}}></Card>
        ))}
      </div>

      <button onClick={handleAddAlert}>Add Alert</button>

      <dialog ref={dialogRef}>
        <AddAlertForm onSubmit={handleFormSubmit} onCancel={() => {dialogRef.current?.close()}} />
      </dialog>

      <dialog ref={dialogEditRef}>
        <EditAlertForm ref={alertEditFormRef} onSubmit={handleEditSubmit} onCancel={() => {dialogEditRef.current?.close()}} onDelete={handleDeleteAlert} />
      </dialog>
    </main>
  );
};

export default AlertsPage;
