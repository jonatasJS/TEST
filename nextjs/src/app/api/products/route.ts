import { NextRequest, NextResponse } from 'next/server';
import { eq, and, like, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, orderItems, orders } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');
    const includeInactive = searchParams.get('includeInactive');

    const conditions = [];

    // Se não for admin pedindo inativos, apenas retorna produtos ativos por padrão
    if (includeInactive !== 'true') {
      conditions.push(eq(products.isActive, true));
    }

    // Filtro por categoria (agora por categoryId)
    if (category && category !== 'all') {
      conditions.push(eq(products.categoryId, parseInt(category)));
    }

    // Busca textual por nome, descrição ou sabor
    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          like(products.name, searchPattern),
          like(products.description, searchPattern),
          like(products.flavor, searchPattern)
        )
      );
    }

    // Ordenação
    let orderSpec = desc(products.createdAt);
    if (sort === 'price_asc') {
      orderSpec = asc(products.price);
    } else if (sort === 'price_desc') {
      orderSpec = desc(products.price);
    } else if (sort === 'name_asc') {
      orderSpec = asc(products.name);
    }

    const allProducts = await db.query.products.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [orderSpec],
      with: {
        category: true,
      },
    });

    return NextResponse.json({ products: allProducts });
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { message: 'Erro ao buscar catálogo de produtos.', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, price, stock, imageUrl, categoryId, puffs, nicotine, flavor } = body;

    if (!name || !description || price === undefined || stock === undefined || !imageUrl || !categoryId) {
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes: nome, descrição, preço, estoque, imagem e categoria.' },
        { status: 400 }
      );
    }

    const [newProduct] = await db.insert(products).values({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl,
      categoryId: parseInt(categoryId),
      puffs: puffs ? parseInt(puffs) : null,
      nicotine: nicotine || null,
      flavor: flavor || null,
    }).returning();

    return NextResponse.json({
      message: 'Produto cadastrado com sucesso!',
      product: newProduct,
    }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao cadastrar produto:', error);
    return NextResponse.json(
      { message: 'Erro ao criar novo produto.', error: error.message },
      { status: 500 }
    );
  }
}
