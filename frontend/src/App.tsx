import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import { ShoppingBag, Search } from 'lucide-react'; // Added lucide-react imports
import { Menu } from './components/Menu'
import { Checkout } from './components/Checkout'
import { SplashScreen } from './components/SplashScreen'

import { CartModal } from './components/CartModal'

function HomePage({ cartTotal, cartItems, onCartChange }: any) {
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const hasItems = Object.keys(cartItems).length > 0;

  const handleUpdateCart = (productId: string, newQuantity: number) => {
    const newItems = { ...cartItems };
    if (newQuantity <= 0) {
      delete newItems[productId];
    } else {
      if (newItems[productId]) {
          newItems[productId] = { ...newItems[productId], quantity: newQuantity };
      }
    }
    const newTotal = Object.values(newItems).reduce((acc: number, item: any) => acc + ((item.price || 0) * item.quantity), 0);
    onCartChange(newTotal, newItems);
  };

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
        <Menu onCartChange={onCartChange} cartItems={cartItems} searchQuery={searchQuery} />
      </main>

      {hasItems && !showCart && (
        <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <button 
            onClick={() => setShowCart(true)}
            className="btn-primary w-full flex items-center justify-between shadow-lg shadow-green-500/20"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span>Savatni ko'rish</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">{cartTotal.toLocaleString()} so'm</span>
          </button>
        </div>
      )}

      <CartModal 
        visible={showCart} 
        onClose={() => setShowCart(false)} 
        cartItems={cartItems} 
        cartTotal={cartTotal} 
        onUpdateCart={handleUpdateCart} 
      />
    </div>
  )
}

function App() {
  const [total, setTotal] = useState(0);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
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

  const handleCartChange = (newTotal: number, newItems: any) => {
    setTotal(newTotal);
    setCartItems(newItems);
  };

  return (
    <Router>
      <div className="max-w-md mx-auto relative shadow-2xl shadow-black/5 min-h-screen bg-white">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <Routes>
          <Route path="/" element={<HomePage cartTotal={total} cartItems={cartItems} onCartChange={handleCartChange} />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App


