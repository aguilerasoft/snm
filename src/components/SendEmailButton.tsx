import React, { useState } from 'react';

export async function sendMail(): Promise<Payment[]> {
  try {
    const response = await fetch('http://172.17.2.131:8000/send-email/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ /* Aquí puedes incluir los datos que necesites enviar */ }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const dataa: Payment[] = await response.json();
    return dataa;
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
}

const Modal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resultado del Envío</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

const SendEmailButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setMessage(null); // Reset message

    const result = await sendMail();

    if (result) {
      setMessage(result.message);
    } else {
      setMessage('Error al enviar los correos.');
    }

    setLoading(false);
    setModalVisible(true); // Mostrar el modal
  };

  const handleModalClose = () => {
    setModalVisible(false);
    window.location.reload(); // Recargar la página al cerrar el modal
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        className={`mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar Correos'}
      </button>
      
      {modalVisible && message && (
        <Modal message={message} onClose={handleModalClose} />
      )}
      
    </div> 
  );
};

export default SendEmailButton;
