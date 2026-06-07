import { Request, Response } from 'express';
import { eq, and, like, or, asc, desc, sql } from 'drizzle-orm';
import { db } from '../db/index';
import { products, orderItems, orders } from '../db/schema';
import cloudinary from '../utils/cloudinary';

export const getAllProducts = async (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, sort, includeInactive } = req.query;

  try {
    const conditions = [];

    // Se não for admin pedindo inativos, apenas retorna produtos ativos por padrão
    if (includeInactive !== 'true') {
      conditions.push(eq(products.isActive, true));
    }

    // Filtro por categoria (agora por categoryId)
    if (category && category !== 'all') {
      conditions.push(eq(products.categoryId, parseInt(category as string)));
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

    return res.status(200).json({ products: allProducts });
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ message: 'Erro ao buscar catálogo de produtos.', error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, parseInt(id)),
      with: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    return res.status(200).json({ product });
  } catch (error: any) {
    console.error('Erro ao buscar produto por ID:', error);
    return res.status(500).json({ message: 'Erro ao obter detalhes do produto.', error: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock, imageUrl, categoryId, puffs, nicotine, flavor } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !imageUrl || !categoryId) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes: nome, descrição, preço, estoque, imagem e categoria.' });
  }

  try {
    // Skip Cloudinary upload for now - use provided image URL directly
    const finalImageUrl = imageUrl;

    const [newProduct] = await db.insert(products).values({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl: finalImageUrl,
      categoryId: parseInt(categoryId),
      puffs: puffs ? parseInt(puffs) : null,
      nicotine: nicotine || null,
      flavor: flavor || null,
    }).returning();

    return res.status(201).json({
      message: 'Produto cadastrado com sucesso!',
      product: newProduct,
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar produto:', error);
    return res.status(500).json({ message: 'Erro ao criar novo produto.', error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, imageUrl, categoryId, puffs, nicotine, flavor, isActive } = req.body;

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Skip Cloudinary upload for now - use provided image URL directly
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
      .where(eq(products.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      message: 'Produto atualizado com sucesso!',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ message: 'Erro ao atualizar o produto.', error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Em vez de deletar de forma dura e quebrar histórico de pedidos, desativamos o produto (Soft Delete)
    const [disabledProduct] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, parseInt(id)))
      .returning();

    return res.status(200).json({
      message: 'Produto desativado com sucesso (histórico de pedidos preservado).',
      product: disabledProduct,
    });
  } catch (error: any) {
    console.error('Erro ao excluir/desativar produto:', error);
    return res.status(500).json({ message: 'Erro ao remover produto.', error: error.message });
  }
};

export const getHeroProduct = async (req: Request, res: Response) => {
  try {
    // Query to get products with total sold
    const productsWithSales = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        stock: products.stock,
        imageUrl: products.imageUrl,
        categoryId: products.categoryId,
        puffs: products.puffs,
        nicotine: products.nicotine,
        flavor: products.flavor,
        isActive: products.isActive,
        createdAt: products.createdAt,
        totalSold: sql<number>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`.as('totalSold'),
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.isActive, true))
      .groupBy(products.id)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orderItems.quantity} ELSE 0 END), 0)`));

    // Fetch category details for all products
    const productsWithCategories = await Promise.all(
      productsWithSales.map(async (p) => {
        const productWithCategory = await db.query.products.findFirst({
          where: eq(products.id, p.id),
          with: {
            category: true,
          },
        });
        return productWithCategory;
      })
    );

    return res.status(200).json({ products: productsWithCategories });
  } catch (error: any) {
    console.error('Erro ao buscar produtos hero:', error);
    return res.status(500).json({ message: 'Erro ao buscar produtos hero.', error: error.message });
  }
};
