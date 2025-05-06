import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Obtener FormData
    const formData = await request.formData();
    const documentid = formData.get('documentid') as string;
    const file = formData.get('attach') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // Convertir a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.name);
    const fileName = `${documentid || 'file'}-${uniqueSuffix}${ext}`;

    // Ruta de guardado (en /public/uploads)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, fileName);

    // Crear directorio si no existe
    await writeFile(filePath, buffer);

    // Retornar ruta accesible
    return NextResponse.json({
      success: true,
      filePath: `/uploads/${fileName}`,
      fileName,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}

// Opcional: Exportar otros métodos como no permitidos
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}