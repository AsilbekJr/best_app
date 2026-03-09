import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';
import Branch from '../models/Branch';

// Kategoriya
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find({ isActive: true });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// Mahsulotlar (Menyu)
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.query;
        let query: any = { isActive: true };
        if (categoryId) {
            query.categoryId = categoryId;
        }
        const products = await Product.find(query).populate('categoryId', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

// Filiallar
export const getBranches = async (req: Request, res: Response) => {
    try {
        const branches = await Branch.find({ isActive: true });
        res.json(branches);
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
};
