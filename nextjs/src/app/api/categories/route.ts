import { NextRequest, NextResponse } from 'next/server';
import { eq, and, like, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products, orderItems, orders } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive');

    const conditions = [];

    // Se não for admin pedindo inativos, apenas retorna categorias ativas por padrão
    if (includeInactive !== 'true') {
      conditions.push(eq(categories.isActive, true));
    }

    // Busca textual por nome ou descrição
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(categories.name, searchPattern),
          like(categories.description || '', searchPattern)
        )
      );
    }

    const allCategories = await db.query.categories.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [asc(categories.name)],
      with: {
        products: true,
      },
    });

    // Contar produtos por categoria
    const categoriesWithCount = allCategories.map(cat => ({
      ...cat,
      productCount: cat.products?.length || 0,
    }));

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar categorias.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, slug, imageUrl, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes: nome e slug.' },
        { status: 400 }
      );
    }

    // Gerar slug automaticamente se não fornecido
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Verificar se slug já existe
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Slug já está em uso. Escolha outro.' },
        { status: 400 }
      );
    }

    const [newCategory] = await db.insert(categories).values({
      name,
      description: description || null,
      slug: categorySlug,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return NextResponse.json({
      message: 'Categoria criada com sucesso!',
      category: newCategory,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { message: 'Erro ao criar categoria.', error: error.message },
      { status: 500 }
    );
  }
}
