import { Request, Response } from 'express';
import { eq, and, like, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/index';
import { categories, products, orderItems, orders } from '../db/schema';

export const getAllCategories = async (req: Request, res: Response) => {
  const { search, includeInactive } = req.query;

  try {
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

    return res.status(200).json({ categories: categoriesWithCount });
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error);
    return res.status(500).json({ message: 'Erro ao buscar categorias.', error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(id)),
      with: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const categoryWithCount = {
      ...category,
      productCount: category.products?.length || 0,
    };

    return res.status(200).json({ category: categoryWithCount });
  } catch (error: any) {
    console.error('Erro ao buscar categoria por ID:', error);
    return res.status(500).json({ message: 'Erro ao obter detalhes da categoria.', error: error.message });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
      with: {
        products: true,
      },
    });

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    const categoryWithCount = {
      ...category,
      productCount: category.products?.length || 0,
    };

    return res.status(200).json({ category: categoryWithCount });
  } catch (error: any) {
    console.error('Erro ao buscar categoria por slug:', error);
    return res.status(500).json({ message: 'Erro ao obter detalhes da categoria.', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, description, slug, imageUrl, isActive } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes: nome e slug.' });
  }

  // Gerar slug automaticamente se não fornecido
  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    // Verificar se slug já existe
    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });

    if (existing) {
      return res.status(400).json({ message: 'Slug já está em uso. Escolha outro.' });
    }

    const [newCategory] = await db.insert(categories).values({
      name,
      description: description || null,
      slug: categorySlug,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();

    return res.status(201).json({
      message: 'Categoria criada com sucesso!',
      category: newCategory,
    });
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({ message: 'Erro ao criar categoria.', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, slug, imageUrl, isActive } = req.body;

  try {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Se slug foi alterado, verificar se já existe
    if (slug && slug !== existing.slug) {
      const slugExists = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });

      if (slugExists) {
        return res.status(400).json({ message: 'Slug já está em uso. Escolha outro.' });
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
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      message: 'Categoria atualizada com sucesso!',
      category: updatedCategory,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error);
    return res.status(500).json({ message: 'Erro ao atualizar categoria.', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(id)),
      with: {
        products: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Categoria não encontrada.' });
    }

    // Verificar se há produtos vinculados
    if (existing.products && existing.products.length > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir categoria com produtos vinculados. Desvincule ou exclua os produtos primeiro.' 
      });
    }

    // Soft delete - desativar categoria
    const [disabledCategory] = await db
      .update(categories)
      .set({ isActive: false })
      .where(eq(categories.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      message: 'Categoria desativada com sucesso.',
      category: disabledCategory,
    });
  } catch (error: any) {
    console.error('Erro ao excluir/desativar categoria:', error);
    return res.status(500).json({ message: 'Erro ao remover categoria.', error: error.message });
  }
};

export const getCategoriesSortedBySales = async (req: Request, res: Response) => {
  try {
    // Query to get all active categories with total products sold
    const categoriesWithSales = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        slug: categories.slug,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
        createdAt: categories.createdAt,
        totalSold: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`.as('totalSold'),
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(categories.isActive, true))
      .groupBy(categories.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`));

    return res.status(200).json({ categories: categoriesWithSales });
  } catch (error: any) {
    console.error('Erro ao buscar categorias por vendas:', error);
    return res.status(500).json({ message: 'Erro ao buscar categorias por vendas.', error: error.message });
  }
};
