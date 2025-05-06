"use client";

import React, { useEffect, useState } from 'react';
import { columns } from "./columns";
import { DataTable } from "./data-table";
import SendEmailButton from '@/components/SendEmailButton';



async function getData() {
  try {
    const response = await fetch('http://172.17.2.131:8000/api/persons/'); // Replace with your real API endpoint
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data: Payment[] = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getData();
      setData(result);
    };

    fetchData();
  }, []);

  let countTrue = 0;
  let countFalse = 0;
  let countNone = 0;

  data.forEach(element => {
    if (element.issatisfied === true) {
      countTrue++;
    } else if (element.issatisfied === false) {
      countFalse++;
    } else {
      countNone++; // This will count null, undefined, or any other non-boolean value
    }
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Administrador de Sujetos Regulados
            </h1>
            <p className="text-gray-500 mt-2">Gestión de respuestas y seguimiento</p>
          </div>
          <div className="mt-4 md:mt-0">
            {/* Puedes agregar aquí botones de acción si son necesarios */}
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-3">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-700">Aceptaron</h2>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{countTrue}</p>
              <p className="mt-1 text-sm text-gray-500">Personas registradas</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-red-500 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text -red-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-700">No Aceptaron</h2>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{countFalse}</p>
              <p className="mt-1 text-sm text-gray-500">Personas registradas</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-700">Sin Respuesta</h2>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-900">{countNone}</p>
              <p className="mt-1 text-sm text-gray-500">Personas registradas</p>
            </div>
          </div>
        </section>

        {/* Data Table Section */}
        <div className='mb-2 items-start flex'>
          <SendEmailButton /> 
        </div>
        <p className='text-gray-500 mb-2'>El envio de correo es para Notificar y Segunda Notificación</p>
        <section className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Registros Detallados</h2>
          </div>
          <div className="p-4 md:p-6">
            <DataTable
              columns={columns}
              data={data}
              className="border-none"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
