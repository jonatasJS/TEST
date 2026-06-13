import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(params.id)),
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
    console.error('Erro ao buscar categoria por ID:', error);
    return NextResponse.json(
      { message: 'Erro ao obter detalhes da categoria.', error: error.message },
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
    const { name, description, slug, imageUrl, isActive } = body;

    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(params.id)),
    });

    if (!existing) {
      return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    // Se slug foi alterado, verificar se já existe
    if (slug && slug !== existing.slug) {
      const slugExists = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });

      if (slugExists) {
        return NextResponse.json(
          { message: 'Slug já está em uso. Escolha outro.' },
          { status: 400 }
        );
      }
    }

    const updatedValues: any = {};
    if (name !== undefined) updatedValues.name = name;
    if (description !== undefined) updatedValues.description = description || null;
    if (slug !== undefined) updatedValues.slug = slug;
    if (imageUrl !== undefined) updatedValues.imageUrl = imageUrl || null;
    if (isActive !== undefined) updatedValues.isActive = isActive;

    const [updatedCategory] = await db
      .update(categories)
      .set(updatedValues)
      .where(eq(categories.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({
      message: 'Categoria atualizada com sucesso!',
      category: updatedCategory,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { message: 'Erro ao atualizar categoria.', error: error.message },
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

    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(params.id)),
      with: {
        products: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Categoria não encontrada.' }, { status: 404 });
    }

    // Verificar se há produtos vinculados
    if (existing.products && existing.products.length > 0) {
      return NextResponse.json({
        message: 'Não é possível excluir categoria com produtos vinculados. Desvincule ou exclua os produtos primeiro.'
      }, { status: 400 });
    }

    // Soft delete - desativar categoria
    const [disabledCategory] = await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, parseInt(params.id)))
      .returning();

    return NextResponse.json({
      message: 'Categoria desativada com sucesso.',
      category: disabledCategory,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    console.error('Erro ao excluir/desativar categoria:', error);
    return NextResponse.json(
      { message: 'Erro ao remover categoria.', error: error.message },
      { status: 500 }
    );
  }
}
