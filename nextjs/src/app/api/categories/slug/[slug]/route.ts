import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, params.slug),
      with: {
        products: true,
      },
    });

    if (!category) {
      return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    const categoryWithCount = {
      ...category,
      productCount: category.products?.length || 0,
    };

    return NextResponse.json({ category: categoryWithCount });
  } catch (error: any) {
    console.error('Erro ao buscar categoria por slug:', error);
    return NextResponse.json(
      { message: 'Erro ao obter detalhes da categoria.', error: error.message },
      { status: 500 }
    );
  }
}
