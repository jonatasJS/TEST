import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq, count } from 'drizzle-orm';
import { db } from '../db/index';
import { users } from '../db/schema';
import { AuthRequest } from '../middleware/auth';
import cloudinary from '../utils/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET || 'loja_vapes_cyber_glow_super_secret_jwt_key_2026';
const COOKIE_EXPIRE = 7 * 24 * 60 * 60 * 1000; // 7 dias

// Função para gerar JWT
const generateToken = (user: { id: number; email: string; role: string; name: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios (nome, email, senha).' });
  }

  try {
    // Verificar se o usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Este e-mail já está sendo utilizado.' });
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

    // Gerar token e salvar em cookie HttpOnly
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_EXPIRE,
    });

    return res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: newUser,
      token, // Retorna também no corpo caso o cliente queira armazenar manualmente
    });
  } catch (error: any) {
    console.error('Erro no registro do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao criar usuário.', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Por favor, informe e-mail e senha.' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas (e-mail ou senha incorretos).' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas (e-mail ou senha incorretos).' });
    }

    // Gerar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_EXPIRE,
    });

    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor ao realizar login.', error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.status(200).json({ message: 'Sessão encerrada com sucesso!' });
};

export const me = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        cep: true,
        street: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        profileImage: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar perfil.', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  const { name, email, currentPassword, confirmNewPassword, newPassword, phone, address, cep, street, number, complement, neighborhood, city, state, profileImage } = req.body;

  try {
    // Buscar usuário atual
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
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
        // Se o Cloudinary falhar, continuar com a imagem existente ou vazia
        imageUrl = user.profileImage || '';
      }
    }

    let passwordHash = user.passwordHash;

    if ((email && email !== user.email) || newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Senha atual obrigatória para alterar email ou senha.'
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Senha atual incorreta.'
        });
      }

      if (email && email !== user.email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase().trim()),
        });

        if (existingUser) {
          return res.status(400).json({
            message: 'Este e-mail já está sendo utilizado.'
          });
        }
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          return res.status(400).json({
            message: 'A nova senha deve ter pelo menos 6 caracteres.'
          });
        }

        if (newPassword !== confirmNewPassword) {
          return res.status(400).json({
            message: 'As senhas não coincidem.'
          });
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
      .where(eq(users.id, req.user.id))
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
        // passwordHash: users.passwordHash,
        createdAt: users.createdAt,
      });

    return res.status(200).json({
      message: 'Perfil atualizado com sucesso!',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar perfil.', error: error.message });
  }
};
