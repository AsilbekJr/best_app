import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Clock, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const BottomNav = ({ onCartClick, onItemClick }: { onCartClick: () => void, onItemClick?: () => void }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const cartItemCount = Object.keys(cartItems).reduce((acc, current) => acc + cartItems[current].quantity, 0);

    // Checkout sahifasida BottomNav yashiringan bo'lishi kerak
    if (location.pathname === '/checkout') return null;

    const navItems = [
        { path: '/', icon: Home, label: 'Menyu' },
        { path: '#cart', icon: ShoppingBag, label: 'Savat', action: onCartClick, badge: cartItemCount },
        { path: '/orders', icon: Clock, label: 'Buyurtmalar' },
        { path: '/profile', icon: User, label: 'Profil' },
    ];

    return (
        <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto z-50">
            <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2 flex justify-between items-center border border-gray-200">
                {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (item.action) {
                                    item.action();
                                } else {
                                    if (onItemClick) onItemClick();
                                    navigate(item.path);
                                }
                            }}
                            className={`flex-[1] py-2 px-1 flex flex-col items-center justify-center gap-1 transition-all rounded-full ${
                                isActive 
                                ? 'text-primary drop-shadow-[0_0_8px_rgba(255,214,0,0.4)] scale-110' 
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                        >
                            <div className="relative">
                                <Icon size={isActive ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
                                {/* Badge for Cart */}
                                {item.badge ? (
                                    <div className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-black text-white border-2 border-white ring-1 ring-red-100 shadow-sm animate-pulse-slow">
                                        {item.badge}
                                    </div>
                                ) : null}
                            </div>
                            {isActive && <span className="text-[10px] font-bold leading-none">{item.label}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
