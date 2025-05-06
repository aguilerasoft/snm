'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export default function PerfilPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const documentid = searchParams.get('documentid');

    const [state, setState] = useState({
        showModal: false,
        issatisfied: null,
        observations: '',
        attach: null,
        loading: false,
        error: null,
        cedulasPermitidas: [],
        cedulasCargadas: false,
        yaRespondio: false,// Nuevo estado para controlar si ya respondió
        personId: null,
        credential: null,
        lastname: null,
        name: null,
        subject_type: null,
        email: null,
        answers: []



    });

    const { showModal, issatisfied, observations, loading, error, cedulasPermitidas, cedulasCargadas, yaRespondio, personId, credential, lastname, name, subject_type, email, attach, answers } = state;

    const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

    const fetchCedulas = useCallback(async () => {
        try {
            updateState({ loading: true });

            // 1. Obtener lista de cédulas permitidas
            const response = await fetch('http://172.17.2.131:8000/api/persons/');
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();

            console.log(data);

            const person = data.find(item =>
                item.documentid === documentid.toUpperCase()
            );

            if (person) {
                updateState({
                    cedulasPermitidas: data.map(item => item.documentid),
                    loading: false,
                    cedulasCargadas: true,
                    yaRespondio: person.issatisfied !== null,
                    issatisfied: person.issatisfied,
                    observations: person.observations || '',
                    personId: person.id, // Store the person's ID for updates
                    credential: person.credential,
                    lastname: person.lastname,
                    name: person.name,
                    subject_type: person.subject_type,
                    email: person.email,
                    attach: person.attach,
                    answers: person.answers
                });
            } else {
                updateState({
                    cedulasPermitidas: [],
                    loading: false,
                    cedulasCargadas: true
                });
            }

            // 2. Verificar si ya respondió (opcional - puede ser otra llamada API)
            const respuestaUsuario = data.find(item => item.documentid === documentid);


            const respondioPreviamente = respuestaUsuario && respuestaUsuario.issatisfied !== null;

            updateState({
                cedulasPermitidas: data.map(item => item.documentid),
                loading: false,
                cedulasCargadas: true,
                yaRespondio: respondioPreviamente,
                issatisfied: respondioPreviamente ? respuestaUsuario.issatisfied : null,
                observations: respondioPreviamente ? respuestaUsuario.observations || '' : ''
            });
        } catch (err) {
            updateState({
                error: 'Error al cargar datos',
                loading: false,
                cedulasCargadas: true
            });
        }
    }, [documentid]);

    useEffect(() => { fetchCedulas() }, [fetchCedulas]);

    const cedulaValida = documentid && cedulasPermitidas.includes(documentid.toUpperCase());

    useEffect(() => {
        // Solo mostrar modal si:
        // 1. Las cédulas están cargadas
        // 2. La cédula es válida
        // 3. No ha respondido aún
        if (cedulasCargadas && cedulaValida && !yaRespondio && issatisfied === null) {
            updateState({ showModal: true });
        }
    }, [cedulaValida, cedulasCargadas, yaRespondio, issatisfied]);

    const handleSubmit = async () => {


        updateState({ loading: true });

        try {
            const formData = new FormData();
            formData.append('documentid', documentid);
            formData.append('issatisfied', issatisfied);
            formData.append('credential', credential);
            formData.append('lastname', lastname);
            formData.append('name', name);
            formData.append('subject_type', subject_type);
            formData.append('email', email);
            formData.append('answers', answers)


            let filePath = null
            // Enviar el archivo real al servidor
            if (attach) {
                formData.append('attach', attach); // Envía el archivo real

                const uploadResponse = await fetch(`/api/upload`, { // Cambia esta URL a tu endpoint de carga
                    method: 'POST',
                    body: formData,
                });

                // Primero, sube el archivo al servidor


                if (!uploadResponse.ok) throw new Error('Error al subir el archivo');

                const uploadData = await uploadResponse.json();

                console.log(uploadData)
                filePath = uploadData.fileName;
                //filePath.append('name', filePath)
            }

            // Asegúrate de que tu backend devuelva la ruta del archivo
            console.log(JSON.stringify({
                documentid,
                issatisfied,
                observations,
                credential,
                lastname,
                name,
                subject_type,
                email,
                answers: [{
                    "observations": observations,
                    "attach": filePath,
                    "response_super": null,
                    "deleted": false
                }], // Envía la ruta del archivo
            }))
            // Ahora, envía la ruta del archivo al backend de Django
            const response = await fetch(`http://172.17.2.131:8000/api/persons/${personId}/`, {
                method: 'PUT', // Cambiado a PUT para actualizar el recurso
                body: JSON.stringify({
                    documentid,
                    issatisfied,
                    observations,
                    credential,
                    lastname,
                    name,
                    subject_type,
                    email,
                    answers: [{
                        "observations": observations,
                        "attach": filePath,
                        "response_super": null,
                        "deleted": false
                    }],
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(response)
            if (!response.ok) throw new Error('Error al procesar la solicitud');

            // Marcar como ya respondió y cerrar modal
            updateState({
                showModal: false,
                yaRespondio: true
            });
        } catch (err) {
            updateState({ error: err.message || 'Error al procesar tu solicitud' });
        } finally {
            updateState({ loading: false });
        }
    };

    if (!cedulasCargadas) return <LoadingScreen />;
    if (!cedulaValida) return <AccessDeniedScreen documentid={documentid} router={router} />;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
            <NotificationModal
                show={showModal && !yaRespondio} // Doble verificación
                onClose={() => updateState({ showModal: false })}
                issatisfied={issatisfied}
                onAgree={() => updateState({ issatisfied: true })}
                onDisagree={() => updateState({ issatisfied: false })}
                observations={observations}
                onObservationsChange={(e) => updateState({ observations: e.target.value })}
                onFileChange={(e) => updateState({ attach: e.target.files[0] })}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
                credential={credential}
                name={name}
                subject_type={subject_type}
                lastname={lastname}
            />

            <ProfileContent
                documentid={documentid}
                credential={credential}
                name={name}
                subject_type={subject_type}
                lastname={lastname}
                router={router}
                yaRespondio={yaRespondio}
                issatisfied={issatisfied}
                onShowModal={() => !yaRespondio && updateState({ showModal: true })}
            />
        </main>
    );
}

// Componentes auxiliares actualizados
function LoadingScreen() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
            <div className="max-w-4xl mx-auto text-center">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto">
                    <p className="text-xl mb-4">Verificando acceso...</p>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        </main>
    );
}

function AccessDeniedScreen({ documentid, router }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b p-8" style={{
            backgroundImage: `url('/fondo2.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')`
        }}>

            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-bold text-[#ffff] mb-6">Usted no posee multa</h1>
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md mx-auto border-[#b59054] border-2" >
                    <p className="text-xl mb-4">La cédula {documentid || 'proporcionada'} no tiene acceso autorizado.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 px-6 py-3 bg-[#b59054] text-[#ffff] rounded-lg hover:bg-[#b59054] transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        </main>
    );
}

function ProfileContent({ documentid, router, yaRespondio, issatisfied, onShowModal, credential, name, lastname, subject_type }) {
    return (
        <div className="fixed inset-0 flex flex-col items-start p-4 overflow-y-auto z-49" style={{
            backgroundImage: `url('/Imagen-Fondo-3.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <div className='mx-auto mt-[10%]'>
            <h1 className="text-2xl font-bold text-[#ffff] mb-6 text-left md:text-5xl">Perfil Sujeto Regulado <br /> {subject_type}</h1>
            <p className="text-xl mb-4 text-[#ffff] mt-5 text-left">Detalles de la Informacion:</p>
            <div className="bg-white p-3 rounded-xl shadow-md md:p-8">

                <p className="text-sm font-mono bg-gray-100 p-4 rounded-lg text-black text-left md:text-2xl">
                    Cedula: {documentid} <br />
                    Credencial: {credential} <br />
                    Nombre: {name} <br />
                    Apellido: {lastname}
                </p>
            </div>
            <div className='rounded-xl shadow-md'>

                {yaRespondio && (
                    <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
                        <p className="font-semibold text-left">Usted ya ha respondido a esta notificación</p>
                        <p className="text-left">Respuesta: {issatisfied ? 'Aceptada' : 'Rechazada'}</p>
                    </div>
                )}

                {!yaRespondio && (
                    <button
                        onClick={onShowModal}
                        className="mt-6 px-6 py-3 bg-[#b59054] text-white rounded-lg hover:bg-blue-700 transition-colors mr-3"
                    >
                        Ver notificación
                    </button>
                )}

                <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-6 py-3 border border-gray-300 text-[#ffff] rounded-lg hover:bg-[#b59054] transition-colors"
                >
                    Volver al inicio
                </button>
            </div>
            </div>
        </div>
    );
}

// Componente NotificationModal permanece igual

function NotificationModal({
    show,
    onClose,
    issatisfied,
    onAgree,
    onDisagree,
    observations,
    onObservationsChange,
    onFileChange,
    onSubmit,
    loading,
    error,
    credential,
    name,
    lastname,
    subject_type
}) {
    const [fileError, setFileError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    if (!show) return null;

    // Validar si el campo de observaciones está lleno cuando no está de acuerdo
    const isObservationsFilled = observations.trim() !== '';

    // Manejar el cambio de archivo
    const handleFileChange = (event) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const fileType = file.type;
            // Validar el tipo de archivo (PDF y PNG)
            const allowedTypes = ['application/pdf', 'image/png'];
            if (!allowedTypes.includes(fileType)) {
                setFileError('Solo se permiten archivos PDF y PNG.');
                setSelectedFile(null);
            } else {
                setFileError('');
                setSelectedFile(file);
            }
        } else {
            // No file selected (user cleared input)
            setFileError('');
            setSelectedFile(null);
        }
        // Pasar todo el evento al onFileChange para que el padre maneje el cambio
        if (onFileChange) {
            onFileChange(event);
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center p-4 overflow-y-auto z-50" style={{
            backgroundImage: `url('/Imagen-Fondo-3.jpg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <img src="/Icono-Infracción.png" alt="" className='mt-10' width={80} />
            <h1 className="text-white mb-4 px-4 py-2 rounded-md shadow-md text-lg font-bold md:text-3xl">
                Notificación de Infracción
            </h1>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">

                <div className="border-b border-gray-200 mb-6"></div>

                <div className="space-y-6 text-gray-700">
                    <p className="font-semibold text-lg md:text-2xl">Estimado/a {name} {lastname},</p>
                    <p className='text-sm md:text-lg'>Por medio de la presente, se le informa que ha incurrido en una infracción.</p>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-4 text-lg md:text-2xl">¿Está de acuerdo con esta notificación?</h3>
                        <div className="flex space-x-4">
                            <button
                                onClick={onAgree}
                                className={`px-4 py-2 text-base rounded-lg ${issatisfied === true ? 'bg-green-500 text-white' : 'bg-[#b59054] text-[#ffff]'}`}
                            >
                                Sí, estoy de acuerdo
                            </button>
                            <button
                                onClick={onDisagree}
                                className={`px-4 py-2 text-base rounded-lg ${issatisfied === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                No estoy de acuerdo
                            </button>
                        </div>
                    </div>

                    {issatisfied === false && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observaciones:
                            </label>
                            <textarea
                                value={observations}
                                onChange={onObservationsChange}
                                className="w-full p-3 border border-[#b59054] rounded-lg focus:ring-blue-500 focus:border-[#b59054]"
                                rows="4"
                                placeholder="Describa el motivo de su desacuerdo..."
                                required
                            />
                            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
                                Adjuntar archivo (opcional):
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.png"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-[#b59054] hover:file:bg-blue-100"
                            />
                            {fileError && <div className="mt-2 text-red-600">{fileError}</div>}
                        </div>
                    )}
                </div>

                {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Leer más tarde
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={issatisfied === null || (issatisfied === false && !observations.trim()) || fileError || loading}
                        className={`px-6 py-2 bg-[#b59054] text-white rounded-lg hover:bg-[#b59054] transition-colors ${issatisfied === null || (issatisfied === false && !observations.trim()) || fileError || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Procesando...' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
