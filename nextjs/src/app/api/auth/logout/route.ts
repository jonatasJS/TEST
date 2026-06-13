import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Sessão encerrada com sucesso!' });
  
  response.cookies.delete('token');
  
  return response;
}
