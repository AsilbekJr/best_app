import { useState, useEffect } from 'react';
import { Plus, Minus, Zap, Loader2 } from 'lucide-react';
import { ProductDetail } from './ProductDetail';
import { HeroBanner } from './HeroBanner';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Cross-sell qoidalari: Category bo'yicha (categoryId string)
// Backend dan kelgach dinamik qilinadi, hozir categoryName ga asoslangan qoidalar
const getCrossSellForCategory = (categoryName: string, allProducts: any[]) => {
    const isburger = categoryName?.includes('Burger') || categoryName?.includes('burger');
    if (isburger) {
        return allProducts.filter(p =>
            p.categoryId?.name?.includes('Gazak') ||
            p.categoryId?.name?.includes('Ichimlik')
        ).slice(0, 3);
    }
    return [];
};

interface MenuProps {
    cartItems?: Record<string, { quantity: number, name: string }>;
    onCartChange: (total: number, items: Record<string, { quantity: number, name: string }>) => void;
}

export const Menu = ({ cartItems = {}, onCartChange }: MenuProps) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [crossSellProducts, setCrossSellProducts] = useState<any[]>([]);
    const [showCrossSell, setShowCrossSell] = useState(false);

    // Kategoriyalarni yuklab olish
    useEffect(() => {
        fetch(`${API_URL}/categories`)
            .then(r => r.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0) setActiveCategory(data[0]._id);
            })
            .catch(err => console.error('Kategoriya xatosi:', err));
    }, []);

    // Barcha mahsulotlarni cross-sell uchun bir marta yuklab olamiz
    useEffect(() => {
        fetch(`${API_URL}/products`)
            .then(r => r.json())
            .then(data => setAllProducts(data))
            .catch(err => console.error('Mahsulotlar xatosi:', err));
    }, []);

    // Aktiv kategoriya o'zgarganda mahsulotlarni filter qilish
    useEffect(() => {
        if (!activeCategory) return;
        setLoading(true);
        const filtered = allProducts.filter(p => {
            const catId = typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId;
            return catId === activeCategory;
        });
        setProducts(filtered);
        setLoading(false);
    }, [activeCategory, allProducts]);

    // Cross-sell hisoblash
    useEffect(() => {
        const cartIds = Object.keys(cartItems);
        if (cartIds.length === 0) {
            setShowCrossSell(false);
            return;
        }

        const recommended = new Set<string>();
        cartIds.forEach(id => {
            const cartProduct = allProducts.find(p => p._id === id);
            if (cartProduct) {
                const suggestions = getCrossSellForCategory(cartProduct.categoryId?.name || '', allProducts);
                suggestions.forEach(s => recommended.add(s._id));
            }
        });
        cartIds.forEach(id => recommended.delete(id));

        const suggestions = Array.from(recommended)
            .map(id => allProducts.find(p => p._id === id)!)
            .filter(Boolean)
            .slice(0, 3);

        setCrossSellProducts(suggestions);
        setShowCrossSell(suggestions.length > 0);
    }, [cartItems, allProducts]);

    const getProductPrice = (productId: string) => {
        const product = allProducts.find(p => p._id === productId);
        return product ? product.price : 0;
    };

    const handleAdd = (product: any) => {
        const currentItem = cartItems[product._id] || { quantity: 0, name: product.name };
        const newCart = { ...cartItems, [product._id]: { ...currentItem, quantity: currentItem.quantity + 1 } };
        updateCartTotal(newCart);
    };

    const handleRemove = (product: any) => {
        if (!cartItems[product._id]) return;
        const newCart = { ...cartItems };
        newCart[product._id] = { ...newCart[product._id], quantity: newCart[product._id].quantity - 1 };
        if (newCart[product._id].quantity <= 0) delete newCart[product._id];
        updateCartTotal(newCart);
    };

    const updateCartTotal = (newCart: Record<string, { quantity: number, name: string }>) => {
        let total = 0;
        Object.keys(newCart).forEach(itemId => {
            total += getProductPrice(itemId) * newCart[itemId].quantity;
        });
        onCartChange(total, newCart);
    };

    return (
        <div className="space-y-4 pb-24">
            {/* Hero Bannerlar */}
            <HeroBanner onBannerTap={(categoryKey) => {
                // CategoryKey bo'yicha mos kategoriyani qidirish
                const match = categories.find(c =>
                    c.name.toLowerCase().includes(categoryKey.toLowerCase())
                );
                if (match) {
                    setActiveCategory(match._id);
                    // Sahifani kategoriya bo'limiga scroll qilish
                    setTimeout(() => {
                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }} />


            {/* Categories Scroll */}
            <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 snap-x before:content-[''] before:w-4 before:shrink-0 before:block after:content-[''] after:w-4 after:shrink-0 after:block" style={{ scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                    <button
                        key={cat._id}
                        onClick={() => setActiveCategory(cat._id)}
                        className={`snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            activeCategory === cat._id
                            ? 'bg-primary text-white shadow-md shadow-green-500/30'
                            : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* 🔥 "Bular bilan maza" Cross-sell Blok */}
            {showCrossSell && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                                <Zap size={14} className="text-white" fill="white" />
                            </div>
                            <h3 className="font-bold text-amber-800 text-sm">Bular bilan maza! 🔥</h3>
                        </div>
                        <div className="flex gap-3 overflow-x-auto pb-1">
                            {crossSellProducts.map(product => {
                                const itemData = cartItems[product._id];
                                const qty = itemData ? itemData.quantity : 0;
                                return (
                                    <div key={product._id} className="flex-shrink-0 w-28 bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-20 object-cover"
                                        />
                                        <div className="p-2">
                                            <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{product.name}</p>
                                            <p className="text-xs text-primary font-bold mt-0.5">{product.price.toLocaleString()} s</p>
                                            {qty === 0 ? (
                                                <button
                                                    onClick={() => handleAdd(product)}
                                                    className="mt-1.5 w-full bg-primary text-white text-xs py-1.5 rounded-lg font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform"
                                                >
                                                    <Plus size={12} /> Qo'shish
                                                </button>
                                            ) : (
                                                <div className="mt-1.5 flex items-center justify-between bg-green-50 rounded-lg px-1 py-0.5">
                                                    <button onClick={() => handleRemove(product)} className="w-6 h-6 flex items-center justify-center text-primary">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold text-primary">{qty}</span>
                                                    <button onClick={() => handleAdd(product)} className="w-6 h-6 flex items-center justify-center bg-primary rounded-md text-white">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={32} className="text-primary animate-spin" />
                </div>
            ) : (
                <div id="products-section" className="grid grid-cols-2 gap-4">
                    {products.map(product => {
                        const itemData = cartItems[product._id];
                        const qty = itemData ? itemData.quantity : 0;
                        // Premium badge logikasi
                        const isNew = product.name?.includes('Yangi') || product.name?.includes('Double');
                        const isHot = qty > 0 || product.name?.includes('BBQ') || product.name?.includes('Cheeseburger');
                        const isSpicy = product.name?.includes('O\'tkir') || product.name?.includes('Spicy');
                        return (
                            <div key={product._id} className="card flex flex-col" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)')}
                                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                            >
                                {/* Rasm va nom bosilganda Detail ochiladi */}
                                <button
                                    className="aspect-square bg-gray-100 overflow-hidden relative w-full text-left"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.3s' }} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">🍔</div>
                                    )}
                                    {/* Premium badge */}
                                    {isNew && (
                                        <div className="absolute top-2 left-2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            ✨ Yangi
                                        </div>
                                    )}
                                    {isHot && !isNew && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            🔥 Top
                                        </div>
                                    )}
                                    {isSpicy && (
                                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            🌶 O'tkir
                                        </div>
                                    )}
                                    {/* Tafsilotlar badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        Tafsilot
                                    </div>
                                </button>
                                <div className="p-3 flex-1 flex flex-col justify-between">
                                    <button className="text-left" onClick={() => setSelectedProduct(product)}>
                                        <h3 className="font-semibold text-gray-900 leading-tight mb-1 text-sm">{product.name}</h3>
                                        <p className="text-primary font-bold">{product.price.toLocaleString()} s</p>
                                    </button>
                                    <div className="mt-3">
                                        {qty === 0 ? (
                                            <button
                                                onClick={() => handleAdd(product)}
                                                className="w-full bg-green-50 text-primary hover:bg-green-100 py-2 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                + Qo'shish
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleRemove(product)}
                                                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary transition-colors active:scale-95"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-semibold flex-1 text-center">{qty}</span>
                                                <button
                                                    onClick={() => handleAdd(product)}
                                                    className="w-8 h-8 flex items-center justify-center bg-primary rounded shadow-sm text-white hover:bg-primary-dark transition-colors active:scale-95"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {products.length === 0 && !loading && (
                        <div className="col-span-2 text-center py-12 text-gray-400">
                            <p className="text-4xl mb-2">🍽️</p>
                            <p>Bu kategoriyada mahsulotlar yo'q</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Detail Bottom Sheet */}
            {selectedProduct && (
                <ProductDetail
                    product={selectedProduct}
                    cartQuantity={cartItems[selectedProduct._id]?.quantity || 0}
                    onClose={() => setSelectedProduct(null)}
                    onAdd={handleAdd}
                />
            )}
        </div>
    );
};
