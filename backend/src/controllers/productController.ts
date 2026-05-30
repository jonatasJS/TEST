import { Request, Response } from 'express';
import { eq, and, like, or, asc, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { products } from '../db/schema';

export const getAllProducts = async (req: Request, res: Response) => {
  const { category, search, minPrice, maxPrice, sort, includeInactive } = req.query;

  try {
    const conditions = [];

    // Se não for admin pedindo inativos, apenas retorna produtos ativos por padrão
    if (includeInactive !== 'true') {
      conditions.push(eq(products.isActive, true));
    }

    // Filtro por categoria
    if (category && category !== 'all') {
      conditions.push(eq(products.category, category as string));
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
  const { name, description, price, stock, imageUrl, category, puffs, nicotine, flavor } = req.body;

  if (!name || !description || price === undefined || stock === undefined || !imageUrl || !category) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes: nome, descrição, preço, estoque, imagem e categoria.' });
  }

  try {
    const [newProduct] = await db.insert(products).values({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      imageUrl,
      category,
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
  const { name, description, price, stock, imageUrl, category, puffs, nicotine, flavor, isActive } = req.body;

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, parseInt(id)),
    });

    if (!existing) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    const updatedValues: any = {};
    if (name !== undefined) updatedValues.name = name;
    if (description !== undefined) updatedValues.description = description;
    if (price !== undefined) updatedValues.price = parseFloat(price);
    if (stock !== undefined) updatedValues.stock = parseInt(stock);
    if (imageUrl !== undefined) updatedValues.imageUrl = imageUrl;
    if (category !== undefined) updatedValues.category = category;
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
