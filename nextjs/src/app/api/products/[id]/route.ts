import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, parseInt(params.id)),
      with: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Erro ao buscar produto por ID:', error);
    return NextResponse.json(
      { message: 'Erro ao obter detalhes do produto.', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, price, stock, imageUrl, categoryId, puffs, nicotine, flavor, isActive } = body;

    const existing = await db.query.products.findFirst({
      where: eq(products.id, parseInt(params.id)),
    });

    if (!existing) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    const finalImageUrl = imageUrl || existing.imageUrl;

    const updatedValues: any = {};
    if (name !== undefined) updatedValues.name = name;
    if (description !== undefined) updatedValues.description = description;
    if (price !== undefined) updatedValues.price = parseFloat(price);
    if (stock !== undefined) updatedValues.stock = parseInt(stock);
    if (imageUrl !== undefined) updatedValues.imageUrl = finalImageUrl;
    if (categoryId !== undefined) updatedValues.categoryId = parseInt(categoryId);
    if (puffs !== undefined) updatedValues.puffs = puffs ? parseInt(puffs) : null;
    if (nicotine !== undefined) updatedValues.nicotine = nicotine || null;
    if (flavor !== undefined) updatedValues.flavor = flavor || null;
    if (isActive !== undefined) updatedValues.isActive = isActive;

    const [updatedProduct] = await db
      .update(products)
      .set(updatedValues)
      .where(eq(products.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({
      message: 'Produto atualizado com sucesso!',
      product: updatedProduct,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar o produto.', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const existing = await db.query.products.findFirst({
      where: eq(products.id, parseInt(params.id)),
    });

    if (!existing) {
      return NextResponse.json({ message: 'Produto não encontrado.' }, { status: 404 });
    }

    // Em vez de deletar de forma dura e quebrar histórico de pedidos, desativamos o produto (Soft Delete)
    const [disabledProduct] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({
      message: 'Produto desativado com sucesso (histórico de pedidos preservado).',
      product: disabledProduct,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao excluir/desativar produto:', error);
    return NextResponse.json(
      { message: 'Erro ao remover produto.', error: error.message },
      { status: 500 }
    );
  }
}
