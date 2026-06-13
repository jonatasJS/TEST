import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { generateToken } from '@/lib/auth';

const COOKIE_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Por favor, preencha todos os campos obrigatórios (nome, email, senha).' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este e-mail já está sendo utilizado.' },
        { status: 400 }
      );
    }

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Estratégia de Bootstrap: se for o primeiro usuário do banco, torna-se Administrador automaticamente!
    const usersCountResult = await db.select({ value: count() }).from(users);
    const totalUsers = usersCountResult[0]?.value || 0;
    const role = totalUsers === 0 ? 'admin' : 'client';

    // Inserir usuário no banco
    const [newUser] = await db.insert(users).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });

    // Gerar token
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      message: 'Usuário registrado com sucesso!',
      user: newUser,
      token,
    }, { status: 201 });

    // Salvar token em cookie HttpOnly
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_EXPIRE,
    });

    return response;
  } catch (error: any) {
    console.error('Erro no registro do usuário:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor ao criar usuário.', error: error.message },
      { status: 500 }
    );
  }
}
