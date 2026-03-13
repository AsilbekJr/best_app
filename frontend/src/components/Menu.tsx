import { useState, useEffect } from 'react';
import { Plus, Minus, Zap, Loader2 } from 'lucide-react';
import { ProductDetail } from './ProductDetail';
import { HeroBanner } from './HeroBanner';

import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../store/cartSlice';
import { useGetCategoriesQuery, useGetProductsQuery } from '../store/apiSlice';
import type { RootState } from '../store';

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
    searchQuery?: string;
}

export const Menu = ({ searchQuery = '' }: MenuProps) => {
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    
    // RTK Query hooks
    const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
    const { data: allProductsData, isLoading: productsLoading } = useGetProductsQuery();

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [crossSellProducts, setCrossSellProducts] = useState<any[]>([]);
    const [showCrossSell, setShowCrossSell] = useState(false);

    // Initial category selection
    useEffect(() => {
        if (categoriesData && categoriesData.length > 0 && !activeCategory) {
            setActiveCategory(categoriesData[0]._id);
        }
    }, [categoriesData, activeCategory]);

    // Aktiv kategoriya o'zgarganda mahsulotlarni filter qilish
    useEffect(() => {
        if (!allProductsData) return;
        
        let filtered = allProductsData;
        
        if (searchQuery.trim()) {
            filtered = allProductsData.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        } else if (activeCategory) {
            filtered = allProductsData.filter(p => {
                const catId = typeof p.categoryId === 'object' ? p.categoryId._id : p.categoryId;
                return catId === activeCategory;
            });
        }
        
        setProducts(filtered);
    }, [activeCategory, allProductsData, searchQuery]);

    // Cross-sell hisoblash
    useEffect(() => {
        if (!allProductsData) return;
        const cartIds = Object.keys(cartItems);
        if (cartIds.length === 0) {
            setShowCrossSell(false);
            return;
        }

        const recommended = new Set<string>();
        cartIds.forEach(id => {
            const cartProduct = allProductsData.find(p => p._id === id);
            if (cartProduct) {
                const suggestions = getCrossSellForCategory(cartProduct.categoryId?.name || '', allProductsData);
                suggestions.forEach(s => recommended.add(s._id));
            }
        });
        cartIds.forEach(id => recommended.delete(id));

        const suggestions = Array.from(recommended)
            .map(id => allProductsData.find(p => p._id === id)!)
            .filter(Boolean)
            .slice(0, 3);

        setCrossSellProducts(suggestions);
        setShowCrossSell(suggestions.length > 0);
    }, [cartItems, allProductsData]);

    const handleAdd = (product: any) => {
        dispatch(addToCart({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        }));
    };

    const handleRemove = (product: any) => {
        dispatch(removeFromCart(product._id));
    };

    if (categoriesLoading || productsLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            {/* Hero Bannerlar */}
            <HeroBanner onBannerTap={(categoryKey) => {
                // CategoryKey bo'yicha mos kategoriyani qidirish
                const match = categoriesData?.find((c: any) =>
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
                {categoriesData?.map((cat: any) => (
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

            {categoriesLoading || productsLoading ? (
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
                    {products.length === 0 && !productsLoading && (
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
