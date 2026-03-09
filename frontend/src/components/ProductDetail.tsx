import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';

interface ProductDetailProps {
    product: any;
    cartQuantity: number;
    onClose: () => void;
    onAdd: (product: any) => void;
}

// Burger Konstruktori uchun opsiyalar
const BURGER_OPTIONS = [
    { id: 'no-onion', label: 'Piyozsiz', emoji: '🧅', extraPrice: 0 },
    { id: 'extra-cheese', label: 'Qo\'shimcha pishloq', emoji: '🧀', extraPrice: 3000 },
    { id: 'double-meat', label: 'Ikki karra go\'sht', emoji: '🥩', extraPrice: 8000 },
    { id: 'spicy', label: 'O\'tkir sous', emoji: '🌶️', extraPrice: 0 },
    { id: 'no-ketchup', label: 'Ketchupsiz', emoji: '🍅', extraPrice: 0 },
    { id: 'extra-sauce', label: 'Maxsus sous', emoji: '🫙', extraPrice: 2000 },
];

export const ProductDetail = ({ product, cartQuantity, onClose, onAdd }: ProductDetailProps) => {
    const [qty, setQty] = useState(cartQuantity || 1);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [visible, setVisible] = useState(false);

    const isBurger = product?.categoryId?.name?.includes('Burger') ||
                     product?.categoryId?.name?.includes('burger');

    useEffect(() => {
        // Animate in
        setTimeout(() => setVisible(true), 10);
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300);
    };

    const toggleOption = (optionId: string) => {
        setSelectedOptions(prev =>
            prev.includes(optionId)
                ? prev.filter(id => id !== optionId)
                : [...prev, optionId]
        );
    };

    const extraPrice = selectedOptions.reduce((sum, optId) => {
        const opt = BURGER_OPTIONS.find(o => o.id === optId);
        return sum + (opt?.extraPrice || 0);
    }, 0);

    const totalPrice = (product.price + extraPrice) * qty;

    const handleAddToCart = () => {
        for (let i = (cartQuantity || 0); i < qty; i++) {
            onAdd({ ...product, _selectedOptions: selectedOptions });
        }
        handleClose();
    };

    if (!product) return null;

    return (
        <div
            className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? 'bg-black/60' : 'bg-transparent'}`}
            onClick={handleClose}
        >
            {/* Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl overflow-hidden transition-transform duration-300 ease-out ${visible ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '92vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 100px)' }}>
                    {/* Hero Image */}
                    <div className="relative">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full object-cover"
                                style={{ height: '260px' }}
                            />
                        ) : (
                            <div className="w-full flex items-center justify-center bg-gray-100" style={{ height: '260px' }}>
                                <span className="text-8xl">🍔</span>
                            </div>
                        )}
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md"
                        >
                            <X size={18} className="text-gray-700" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Name & Price */}
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h2 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h2>
                                {product.description && (
                                    <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{product.description}</p>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-black text-primary">{product.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">so'm</p>
                            </div>
                        </div>

                        {/* Burger Konstruktori — faqat Burger kategoriyadagi mahsulotlarda */}
                        {isBurger && (
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-xl">⚙️</span> Burger Konstruktori
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {BURGER_OPTIONS.map(option => {
                                        const isSelected = selectedOptions.includes(option.id);
                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => toggleOption(option.id)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                                                    isSelected
                                                        ? 'border-primary bg-green-50 text-primary'
                                                        : 'border-gray-100 bg-gray-50 text-gray-700'
                                                }`}
                                            >
                                                <span className="text-lg">{option.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold leading-tight truncate">{option.label}</p>
                                                    {option.extraPrice > 0 && (
                                                        <p className="text-xs text-gray-400">+{option.extraPrice.toLocaleString()} s</p>
                                                    )}
                                                </div>
                                                {isSelected && (
                                                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {extraPrice > 0 && (
                                    <p className="text-xs text-primary font-semibold mt-2 text-right">
                                        +{extraPrice.toLocaleString()} so'm qo'shimcha
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Miqdor tanlash */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-3">
                            <span className="font-semibold text-gray-700">Miqdor</span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQty(q => Math.max(1, q - 1))}
                                    className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="text-xl font-black w-6 text-center text-gray-900">{qty}</span>
                                <button
                                    onClick={() => setQty(q => q + 1)}
                                    className="w-9 h-9 rounded-full bg-primary shadow flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Spacer for button */}
                        <div className="h-2" />
                    </div>
                </div>

                {/* Sticky Bottom Button */}
                <div className="px-5 pb-6 pt-3 bg-white border-t border-gray-100">
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-primary text-white font-black py-4 rounded-2xl flex items-center justify-between px-5 shadow-lg shadow-green-500/30 active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingCart size={20} />
                            <span>Savatga qo'shish</span>
                        </div>
                        <span className="bg-white/20 rounded-xl px-3 py-1 font-black text-sm">
                            {totalPrice.toLocaleString()} s
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
