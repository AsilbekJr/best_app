import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { updateQuantity } from './store/cartSlice';
import WebApp from '@twa-dev/sdk'
import { Search } from 'lucide-react'; // Added lucide-react imports
import { Menu } from './components/Menu'
import { Checkout } from './components/Checkout'
import { SplashScreen } from './components/SplashScreen'

import { CartModal } from './components/CartModal'
import { BottomNav } from './components/BottomNav';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Best Burger" className="h-9 w-9 rounded-full object-cover shadow-sm border border-gray-100" />
            <h1 className="text-xl font-black text-primary tracking-tight hidden sm:block">
            Best<span className="text-secondary">!</span>
            </h1>
        </div>
        <div className="flex-1 max-w-xs bg-gray-100 rounded-full flex items-center px-3 py-2 focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Nima yeysiz?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full px-2 text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </header>

      <main className="p-4">
        <Menu searchQuery={searchQuery} />
      </main>

      {/* CartModal endi Global App levelda boshqariladi va BottomNav'ga bog'lanadi, shuning uchun HomePage da modalni yashirin saqlab global state orqali chaqiramiz */}

    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Faqat birinchi marta ko'rsatish
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) return false;
    sessionStorage.setItem('splash_seen', '1');
    return true;
  });

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#ffffff');
  }, []);

  const [showCartModal, setShowCartModal] = useState(false);
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartTotal = useSelector((state: RootState) => state.cart.totalAmount);

  const handleUpdateCart = (productId: string, newQuantity: number) => {
    dispatch(updateQuantity({ id: productId, quantity: newQuantity }));
  };

  return (
    <Router>
      <div className="max-w-md mx-auto relative shadow-2xl shadow-black/5 min-h-screen bg-white">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        
        {/* Global Cart Modal */}
        <CartModal 
          visible={showCartModal} 
          onClose={() => setShowCartModal(false)} 
          cartItems={cartItems} 
          cartTotal={cartTotal} 
          onUpdateCart={handleUpdateCart} 
        />
        
        {/* Global Bottom Navigation */}
        <BottomNav onCartClick={() => setShowCartModal(true)} onItemClick={() => setShowCartModal(false)} />
      </div>
    </Router>
  )
}

export default App


