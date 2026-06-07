import { Response } from 'express';
import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db/index';
import { promotions } from '../db/schema';
import { AuthRequest } from '../middleware/auth';

export const getAllPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const allPromotions = await db.query.promotions.findMany({
      orderBy: [desc(promotions.createdAt)],
    });
    return res.status(200).json({ promotions: allPromotions });
  } catch (error: any) {
    console.error('Erro ao buscar promoções:', error);
    return res.status(500).json({ message: 'Erro ao buscar promoções', error: error.message });
  }
};

export const getActivePromotions = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const allPromotions = await db.query.promotions.findMany({
      where: eq(promotions.isActive, true),
      orderBy: [desc(promotions.createdAt)],
    });
    
    // Filter by date range using JavaScript
    const activePromotions = allPromotions.filter(promo => {
      const startDate = new Date(promo.startDate);
      const endDate = new Date(promo.endDate);
      return now >= startDate && now <= endDate;
    });
    
    return res.status(200).json({ promotions: activePromotions });
  } catch (error: any) {
    console.error('Erro ao buscar promoções ativas:', error);
    return res.status(500).json({ message: 'Erro ao buscar promoções ativas', error: error.message });
  }
};

export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      type,
      value,
      minPurchaseAmount = 0,
      maxDiscountAmount,
      startDate,
      endDate,
      isActive = true,
      usageLimit,
      applicableCategories,
      applicableProducts,
    } = req.body;

    if (!name || !type || !value || !startDate || !endDate) {
      return res.status(400).json({ message: 'Campos obrigatórios: name, type, value, startDate, endDate' });
    }

    const newPromotion = await db.insert(promotions).values({
      name,
      description,
      type,
      value,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      usageLimit,
      currentUsage: 0,
      applicableCategories: applicableCategories ? JSON.stringify(applicableCategories) : null,
      applicableProducts: applicableProducts ? JSON.stringify(applicableProducts) : null,
    }).returning();

    return res.status(201).json({ promotion: newPromotion[0] });
  } catch (error: any) {
    console.error('Erro ao criar promoção:', error);
    return res.status(500).json({ message: 'Erro ao criar promoção', error: error.message });
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      type,
      value,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      isActive,
      usageLimit,
      applicableCategories,
      applicableProducts,
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (minPurchaseAmount !== undefined) updateData.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories ? JSON.stringify(applicableCategories) : null;
    if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts ? JSON.stringify(applicableProducts) : null;

    const updatedPromotion = await db
      .update(promotions)
      .set(updateData)
      .where(eq(promotions.id, parseInt(id)))
      .returning();

    if (updatedPromotion.length === 0) {
      return res.status(404).json({ message: 'Promoção não encontrada' });
    }

    return res.status(200).json({ promotion: updatedPromotion[0] });
  } catch (error: any) {
    console.error('Erro ao atualizar promoção:', error);
    return res.status(500).json({ message: 'Erro ao atualizar promoção', error: error.message });
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deletedPromotion = await db
      .delete(promotions)
      .where(eq(promotions.id, parseInt(id)))
      .returning();

    if (deletedPromotion.length === 0) {
      return res.status(404).json({ message: 'Promoção não encontrada' });
    }

    return res.status(200).json({ message: 'Promoção deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar promoção:', error);
    return res.status(500).json({ message: 'Erro ao deletar promoção', error: error.message });
  }
};

export const incrementPromotionUsage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updatedPromotion = await db
      .update(promotions)
      .set({
        currentUsage: sql`${promotions.currentUsage} + 1`,
      })
      .where(eq(promotions.id, parseInt(id)))
      .returning();

    if (updatedPromotion.length === 0) {
      return res.status(404).json({ message: 'Promoção não encontrada' });
    }

    return res.status(200).json({ promotion: updatedPromotion[0] });
  } catch (error: any) {
    console.error('Erro ao incrementar uso da promoção:', error);
    return res.status(500).json({ message: 'Erro ao incrementar uso da promoção', error: error.message });
  }
};
