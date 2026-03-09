import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import WebApp from '@twa-dev/sdk'
import { Menu } from './components/Menu'
import { Checkout } from './components/Checkout'
import { SplashScreen } from './components/SplashScreen'

function HomePage({ cartTotal, cartItems, onCartChange }: any) {
  const navigate = useNavigate();
  const hasItems = Object.keys(cartItems).length > 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <img src="/logo.jpg" alt="Best Burger" className="h-9 w-9 rounded-full object-cover shadow-sm border border-gray-100" />
        <h1 className="text-xl font-black text-primary tracking-tight">
          Best<span className="text-secondary">!</span> Burger
        </h1>
      </header>

      <main className="p-4">
        <Menu onCartChange={onCartChange} cartItems={cartItems} />
      </main>

      {hasItems && (
        <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
          <button 
            onClick={() => navigate('/checkout', { state: { cartTotal, cartItems } })}
            className="btn-primary w-full flex items-center justify-between shadow-lg shadow-green-500/20"
          >
            <span>Rasmiylashtirish</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">{cartTotal.toLocaleString()} so'm</span>
          </button>
        </div>
      )}
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


