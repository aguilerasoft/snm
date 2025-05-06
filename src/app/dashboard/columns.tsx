"use client"

import { ColumnDef } from "@tanstack/react-table"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  name: string
  lastname: string
  documentid: string
  type_sujeto: string
  email: string
  issatisfied: boolean
  wasnotified: boolean
}

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "id",
    header: "id",
  },
  {
    accessorKey: "documentid",
    header: "# Cedula",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "lastname",
    header: "Apellido",
  },
  {
    accessorKey: "credential",
    header: "Credencial",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "subject_type",
    header: "Tipo de Sujeto",
  },
  
{
  accessorKey: "issatisfied",
  header: () => <div className="text-right">Acepto?</div>,
  cell: ({ row }) => {
    const acceptValue = row.getValue("issatisfied");
    let displayText;
    let bgColor;

    if (acceptValue === true || acceptValue === 'true') {
      displayText = "Sí";
      bgColor = "bg-emerald-300"; // Verde
    } else if (acceptValue === false || acceptValue === 'false') {
      displayText = "No";
      bgColor = "bg-red-300"; // Rojo
    } else {
      displayText = "Sin respuesta";
      bgColor = "bg-gray-400"; // Gris
    }

    return (
      <div className="text-right font-medium">
        <span className={`${bgColor} text-white p-2 rounded-lg`}>
          {displayText}
        </span>
      </div>
    );
  },
},

{ 
    accessorKey: "wasreceived", 
    header: () => <div className="text-right">Notificado?</div>, 
    cell: ({ row }) => { 
        const acceptValue = row.getValue("wasreceived"); 
        const isAccepted = acceptValue === true || acceptValue === 'true';

    return (
      <div className="text-right font-medium">
        <span className={isAccepted ? "bg-emerald-300 text-white p-2 rounded-lg" : "bg-red-300 text-white p-2 rounded-lg"}>
          {isAccepted ? "Si" : "No"}
        </span>
      </div>
    );
  },
},

{ 
  accessorKey: "wasnotified", 
  header: () => <div className="text-right">2da Notificacion</div>, 
  cell: ({ row }) => { 
      const acceptValue = row.getValue("wasnotified"); 
      const isAccepted = acceptValue === true || acceptValue === 'true';

  return (
    <div className="text-right font-medium">
      <span className={isAccepted ? "bg-emerald-300 text-white p-2 rounded-lg" : "bg-red-300 text-white p-2 rounded-lg"}>
        {isAccepted ? "Si" : "No"}
      </span>
    </div>
  );
},
}



  
]
