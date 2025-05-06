'use client'; // Necesario para usar hooks y eventos

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [documentid, setCedula] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    if (!documentid.trim()) {
      setError('Por favor ingrese su número de Credencial');
      return;
    }
    
    if (!/^[VvEe]-\d{7,8}$/.test(documentid)) {
      setError('Formato incorrecto. Debe ser V-12345678 o E-12345678');
      return;
    }
    
    
    // Redirección a la página de perfil con el parámetro de cédula
    router.push(`/perfil?documentid=${encodeURIComponent(documentid)}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8" style={{
      backgroundImage: `url('/fondo.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')`
    }}>
      <img src="/Logo.png" alt="" className='mb-14' width={200}/>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-[#ffff] mb-6 animate-fade-in md:text-5xl">
          Bienvenido a nuestra página
        </h1>
        
        <p className="text-xl text-[#ffff] mb-8 animate-fade-in delay-100">
          Estamos encantados de tenerte aquí. Por favor ingresa tu número de cédula para continuar.
        </p>
        
        {/* Formulario de cédula */}
        <form onSubmit={handleSubmit} className="mb-8 animate-fade-in delay-200">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md mb-4">
              <input
                type="text"
                value={documentid}
                onChange={(e) => {
                  setCedula(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder="Ingresa tu número de Cedula"
                className="w-full px-4 py-3 border border-[#b59054] rounded-lg bg-[#ffff] text-black focus:ring-2 focus:ring-[#b59054] focus:border-[#b59054] outline-none transition-all"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-left">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#b59054] text-white rounded-lg hover:bg-[#b59054] transition-colors shadow-md w-full max-w-md"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}