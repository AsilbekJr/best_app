import { Router } from 'express';
import { getCategories, getProducts, getBranches } from '../controllers/MenuController';
import { createOrder, getMyOrders } from '../controllers/OrderController';
import {
    createCategory, updateCategory, deleteCategory,
    getAllProducts, createProduct, updateProduct, deleteProduct,
    getAllBranches, createBranch, updateBranch, deleteBranch,
    getAllOrders, getStats, getTopProducts, getHourlyStats,
    listPromos, createPromo, updatePromo, deletePromo, validatePromo
} from '../controllers/AdminController';

const router = Router();

// ========== PUBLIC (Frontend) API ==========
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/branches', getBranches);
router.post('/orders', createOrder);
router.get('/orders/my/:chatId', getMyOrders);

// ========== ADMIN API ==========
// Categories
router.post('/admin/categories', createCategory);
router.put('/admin/categories/:id', updateCategory);
router.delete('/admin/categories/:id', deleteCategory);

// Products
router.get('/admin/products', getAllProducts);
router.post('/admin/products', createProduct);
router.put('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);

// Branches
router.get('/admin/branches', getAllBranches);
router.post('/admin/branches', createBranch);
router.put('/admin/branches/:id', updateBranch);
router.delete('/admin/branches/:id', deleteBranch);

// Orders
router.get('/admin/orders', getAllOrders);

// Statistics
router.get('/admin/stats', getStats);
router.get('/admin/top-products', getTopProducts);
router.get('/admin/hourly-stats', getHourlyStats);

// Promos (Admin)
router.get('/admin/promos', listPromos);
router.post('/admin/promos', createPromo);
router.put('/admin/promos/:id', updatePromo);
router.delete('/admin/promos/:id', deletePromo);

// Promo validation (Public — Checkout sahifasi uchun)
router.post('/check-promo', validatePromo);

export default router;
