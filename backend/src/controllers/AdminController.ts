import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import Branch from '../models/Branch';
import mongoose from 'mongoose';

// ===================== CATEGORIES =====================
export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Kategoriya topilmadi' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Kategoriya o\'chirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// ===================== PRODUCTS =====================
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find().populate('categoryId', 'name').sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Mahsulot topilmadi' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        await Product.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Mahsulot o\'chirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// ===================== BRANCHES =====================
export const getAllBranches = async (req: Request, res: Response) => {
    try {
        const branches = await Branch.find().sort({ createdAt: -1 });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const createBranch = async (req: Request, res: Response) => {
    try {
        const branch = new Branch(req.body);
        await branch.save();
        res.status(201).json(branch);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const updateBranch = async (req: Request, res: Response) => {
    try {
        const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!branch) return res.status(404).json({ message: 'Filial topilmadi' });
        res.json(branch);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const deleteBranch = async (req: Request, res: Response) => {
    try {
        await Branch.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ message: 'Filial o\'chirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// ===================== STATISTICS =====================
export const getStats = async (req: Request, res: Response) => {
    try {
        const Order = require('../models/Order').default;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Bugungi statistika
        const todayOrders = await Order.find({ createdAt: { $gte: today, $lt: tomorrow } });
        const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        // Umumiy statistika
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Status bo'yicha hisob
        const statusCount = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // So'nggi 7 kun tushumi
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const dayOrders = await Order.find({ createdAt: { $gte: dayStart, $lt: dayEnd } });
            const dayRevenue = dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
            last7Days.push({
                date: dayStart.toLocaleDateString('uz', { weekday: 'short', month: 'short', day: 'numeric' }),
                revenue: dayRevenue,
                orders: dayOrders.length
            });
        }

        res.json({
            today: { orders: todayOrders.length, revenue: todayRevenue },
            total: { orders: totalOrders, revenue: totalRevenue[0]?.total || 0 },
            statusCount,
            last7Days
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const getTopProducts = async (req: Request, res: Response) => {
    try {
        const Order = require('../models/Order').default;
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $group: {
                _id: '$items.productName',
                totalQty: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }},
            { $sort: { totalQty: -1 } },
            { $limit: 5 }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const getHourlyStats = async (req: Request, res: Response) => {
    try {
        const Order = require('../models/Order').default;
        const hourly = await Order.aggregate([
            { $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 }
            }},
            { $sort: { '_id': 1 } }
        ]);
        // 0-23 soat uchun to'liq massiv
        const result = Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            label: `${String(h).padStart(2,'0')}:00`,
            count: hourly.find((x: any) => x._id === h)?.count || 0
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// ===================== ORDERS =====================
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const Order = require('../models/Order').default;
        const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// ===================== PROMOS =====================
import Promo from '../models/Promo';

export const listPromos = async (req: Request, res: Response) => {
    try {
        const promos = await Promo.find().sort({ createdAt: -1 });
        res.json(promos);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const createPromo = async (req: Request, res: Response) => {
    try {
        const promo = new Promo({ ...req.body, code: req.body.code?.toUpperCase() });
        await promo.save();
        res.status(201).json(promo);
    } catch (error: any) {
        if (error.code === 11000) return res.status(400).json({ message: 'Bu promokod allaqachon mavjud' });
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const updatePromo = async (req: Request, res: Response) => {
    try {
        const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!promo) return res.status(404).json({ message: 'Promokod topilmadi' });
        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const deletePromo = async (req: Request, res: Response) => {
    try {
        await Promo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Promokod o\'chirildi' });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// Public: promokod tekshirish (Checkout sahifasi uchun)
export const validatePromo = async (req: Request, res: Response) => {
    try {
        const { code, orderAmount } = req.body;
        const promo = await Promo.findOne({ code: code?.toUpperCase(), isActive: true });

        if (!promo) return res.status(404).json({ message: 'Promokod topilmadi yoki noto\'g\'ri' });
        if (promo.expiresAt && promo.expiresAt < new Date()) {
            return res.status(400).json({ message: 'Promokodning muddati tugagan' });
        }
        if (promo.usedCount >= promo.maxUses) {
            return res.status(400).json({ message: 'Promokod limitga yetdi' });
        }
        if (orderAmount < promo.minOrderAmount) {
            return res.status(400).json({
                message: `Minimal buyurtma summasi: ${promo.minOrderAmount.toLocaleString()} so'm`
            });
        }

        const discount = promo.discountType === 'percent'
            ? Math.round(orderAmount * promo.discountValue / 100)
            : promo.discountValue;

        res.json({
            valid: true,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discount,
            finalAmount: orderAmount - discount,
            message: promo.discountType === 'percent'
                ? `${promo.discountValue}% chegirma qo'llanildi! -${discount.toLocaleString()} so'm`
                : `-${discount.toLocaleString()} so'm chegirma!`
        });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

