import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartModalProps {
    visible: boolean;
    onClose: () => void;
    cartItems: Record<string, any>;
    cartTotal: number;
    onUpdateCart: (productId: string, newQuantity: number) => void;
}

export const CartModal = ({ visible, onClose, cartItems, cartTotal, onUpdateCart }: CartModalProps) => {
    const navigate = useNavigate();
    const items = Object.keys(cartItems).map(id => ({ id, ...cartItems[id] })).filter(item => item.quantity > 0);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />

            {/* Bottom Sheet Modal */}
            <div 
                className="relative bg-white w-full max-w-md max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom-full duration-300 pb-20"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="text-primary" /> Savatcha
                    </h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <ShoppingBag size={48} className="mb-3 opacity-20" />
                            <p>Savatingiz bo'sh</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🍔</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                                        <p className="font-bold text-primary text-sm shrink-0 ml-2">{(item.price || 0).toLocaleString()} s</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button 
                                                onClick={() => onUpdateCart(item.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-primary active:scale-95 transition-all"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-semibold text-gray-900 text-sm w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => onUpdateCart(item.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center bg-primary rounded shadow-sm text-white hover:bg-primary-dark active:scale-95 transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Footer */}
                {items.length > 0 && (
                    <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-3xl sm:rounded-b-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 font-medium">Jami summa:</span>
                            <span className="text-xl font-bold text-gray-900">{cartTotal.toLocaleString()} so'm</span>
                        </div>
                        <button 
                            onClick={() => {
                                onClose();
                                navigate('/checkout', { state: { cartTotal, cartItems } });
                            }}
                            className="w-full btn-primary text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                        >
                            <span>Rasmiylashtirish</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
