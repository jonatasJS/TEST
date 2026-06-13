import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getUserFromToken } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export async function PUT(request: NextRequest) {
  try {
    const userPayload = await getUserFromToken();

    if (!userPayload) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      currentPassword,
      confirmNewPassword,
      newPassword,
      phone,
      address,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      profileImage
    } = body;

    // Buscar usuário atual
    const user = await db.query.users.findFirst({
      where: eq(users.id, userPayload.id),
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
    }

    let imageUrl = user.profileImage;

    // Fazer upload apenas se uma nova imagem foi fornecida
    if (profileImage && profileImage !== user.profileImage) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: "avatars",
          width: 500,
          height: 500,
          crop: "fill"
        });
        imageUrl = result.secure_url;
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', cloudinaryError);
        imageUrl = user.profileImage || '';
      }
    }

    let passwordHash = user.passwordHash;

    if ((email && email !== user.email) || newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          message: 'Senha atual obrigatória para alterar email ou senha.'
        }, { status: 400 });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        return NextResponse.json({
          message: 'Senha atual incorreta.'
        }, { status: 401 });
      }

      if (email && email !== user.email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase().trim()),
        });

        if (existingUser) {
          return NextResponse.json({
            message: 'Este e-mail já está sendo utilizado.'
          }, { status: 400 });
        }
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          return NextResponse.json({
            message: 'A nova senha deve ter pelo menos 6 caracteres.'
          }, { status: 400 });
        }

        if (newPassword !== confirmNewPassword) {
          return NextResponse.json({
            message: 'As senhas não coincidem.'
          }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(newPassword, salt);
      }
    }

    // Atualizar usuário
    const [updatedUser] = await db
      .update(users)
      .set({
        name: name || user.name,
        email: email ? email.toLowerCase().trim() : user.email,
        phone: phone || user.phone,
        address: address || user.address,
        cep: cep || user.cep,
        street: street || user.street,
        number: number || user.number,
        complement: complement || user.complement,
        neighborhood: neighborhood || user.neighborhood,
        city: city || user.city,
        state: state || user.state,
        profileImage: imageUrl,
        passwordHash: passwordHash,
      })
      .where(eq(users.id, userPayload.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        cep: users.cep,
        street: users.street,
        number: users.number,
        complement: users.complement,
        neighborhood: users.neighborhood,
        city: users.city,
        state: users.state,
        profileImage: users.profileImage,
        createdAt: users.createdAt,
      });

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { message: 'Erro interno ao atualizar perfil.', error: error.message },
      { status: 500 }
    );
  }
}
