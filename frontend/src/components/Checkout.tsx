import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, UtensilsCrossed, Loader2, Tag, CheckCircle2, XCircle, Wallet, CreditCard, Navigation } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartTotal, cartItems } = location.state || { cartTotal: 0, cartItems: {} };
    
    const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway' | 'dine-in'
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'click'
    
    // Form states
    const [name, setName] = useState(WebApp.initDataUnsafe?.user?.first_name || '');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [tableInfo, setTableInfo] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [branches, setBranches] = useState<any[]>([]);
    // Promokod states
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<any>(null);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    // Filiallarni API dan yuklab olish
    useEffect(() => {
        fetch(`${API_URL}/branches`)
            .then(r => r.json())
            .then(data => {
                setBranches(data);
                if (data.length > 0) setSelectedBranch(data[0].name);
            })
            .catch(err => console.error('Filiallar xatosi:', err));
    }, []);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.startsWith('998')) {
            val = val.substring(3);
        }
        if (val.length === 0) {
            setPhone('');
            return;
        }
        let formatted = '+998';
        if (val.length > 0) formatted += ' ' + val.substring(0, 2);
        if (val.length > 2) formatted += ' ' + val.substring(2, 5);
        if (val.length > 5) formatted += ' ' + val.substring(5, 7);
        if (val.length > 7) formatted += ' ' + val.substring(7, 9);
        setPhone(formatted);
    };

    const [isLocating, setIsLocating] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Qurilmangiz lokatsiyani qo'llab-quvvatlamaydi.");
            return;
        }
        
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setAddress(`https://maps.google.com/?q=${latitude},${longitude}`);
                setIsLocating(false);
            },
            (error) => {
                let msg = error.message;
                if (error.code === error.PERMISSION_DENIED) msg = "Lokatsiyaga ruxsat berilmadi.";
                alert("Lokatsiyani olishda xatolik yuz berdi: " + msg);
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Agar savat bo'sh bo'lsa orqaga qaytarish
    if (cartTotal === 0) {
        return (
             <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 mb-4">Savatchangiz bo'sh</p>
                <button onClick={() => navigate('/')} className="btn-primary">Menyuga qaytish</button>
             </div>
        );
    }
    
    const baseTotal = cartTotal + (orderType === 'delivery' ? 15000 : 0);
    const discount = promoResult?.discount || 0;
    const calculatedTotal = baseTotal - discount;

    const handleCheckPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        setPromoResult(null);
        try {
            const res = await axios.post(`${API_URL}/check-promo`, {
                code: promoCode.trim(),
                orderAmount: baseTotal
            });
            setPromoResult(res.data);
        } catch (err: any) {
            setPromoError(err.response?.data?.message || 'Promokod xato');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleSubmitOrder = async () => {
        if (!name || !phone) {
            alert("Iltimos, ism va telefon raqamingizni kiriting!");
            return;
        }

        if (orderType === 'delivery' && !address) {
            alert("Iltimos, yetkazib berish manzilini kiriting!");
            return;
        }

        const confirmed = window.confirm("Buyurtmani tasdiqlaysizmi?");
        if (confirmed) {
            setIsLoading(true);
            try {
                // API ga jo'natish formati
                const orderData = {
                    customerName: name,
                    customerPhone: phone,
                    orderType: orderType,
                    paymentMethod: paymentMethod,
                    tableNumber: orderType === 'dine-in' ? tableInfo : undefined,
                    branchName: (orderType === 'takeaway' || orderType === 'dine-in') ? selectedBranch : undefined,
                    deliveryAddress: orderType === 'delivery' ? address : undefined,
                    // Bu yerda aslida Product ID lar ketishi kerak, vizualizatsiya uchun oddiy object
                    items: Object.keys(cartItems).map(id => ({
                        productId: id,
                        productName: cartItems[id].name, // Foydalanuvchiga tushunarli nomi o'tadi
                        quantity: cartItems[id].quantity,
                        price: 0
                    })),
                    totalAmount: calculatedTotal,
                    telegramChatId: WebApp.initDataUnsafe?.user?.id?.toString()
                };

                await axios.post(`${API_URL}/orders`, orderData);
                
                alert("Buyurtmangiz qabul qilindi! Oshpazlar uni tayyorlashni boshlashdi.");
                // Kelajakda bu yerda tozalash yoki yopish mantiqi ishlaydi
                WebApp.close(); 
            } catch (error) {
                console.error("Order error", error);
                alert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface px-4 py-4 flex items-center gap-3 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-1 active:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold">Buyurtmani rasmiylashtirish</h1>
            </header>

            <main className="p-4 space-y-6">
                
                {/* Order Type Selector */}
                <div className="bg-white p-1 rounded-2xl flex shadow-sm border border-gray-100">
                    <button 
                        onClick={() => setOrderType('delivery')}
                        className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${orderType === 'delivery' ? 'bg-primary text-white shadow-md' : 'text-gray-500'}`}
                    >
                        <MapPin size={18} /> Dostavka
                    </button>
                    <button 
                        onClick={() => setOrderType('takeaway')}
                        className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${orderType === 'takeaway' ? 'bg-primary text-white shadow-md' : 'text-gray-500'}`}
                    >
                        <Store size={18} /> Olib ketish
                    </button>
                    <button 
                        onClick={() => setOrderType('dine-in')}
                        className={`flex-1 py-2.5 px-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${orderType === 'dine-in' ? 'bg-primary text-white shadow-md' : 'text-gray-500'}`}
                    >
                        <UtensilsCrossed size={18} /> Zalda
                    </button>
                </div>

                {/* Form Fields Based on Type */}
                <div className="card p-4 space-y-4">
                    <h2 className="font-semibold text-gray-800">Ma'lumotlar</h2>
                    
                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm text-gray-500 mb-1 block">Ismingiz</span>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Ismni kiriting" />
                        </label>
                        <label className="block">
                            <span className="text-sm text-gray-500 mb-1 block">Telefon raqamingiz</span>
                            <input type="tel" value={phone} onChange={handlePhoneChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium" placeholder="+998 90 123 45 67" />
                        </label>

                        {orderType === 'delivery' && (
                            <label className="block relative">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-500 block">Yetkazib berish manzili</span>
                                    <button type="button" onClick={handleGetLocation} className="text-primary text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform bg-primary/10 px-2 py-1 rounded-md" disabled={isLocating}>
                                        {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />} 
                                        {isLocating ? "Olinmoqda..." : "Lokatsiyamni jo'natish"}
                                    </button>
                                </div>
                                <textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-20 resize-none" placeholder="Manzilni kiriting yoki xaritadan jo'nating..." />
                            </label>
                        )}

                        {orderType === 'dine-in' && (
                            <label className="block">
                                <span className="text-sm text-gray-500 mb-1 block">Stol raqami</span>
                                <input type="text" value={tableInfo} onChange={e => setTableInfo(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Masalan: 12" />
                            </label>
                        )}
                        
                        {(orderType === 'takeaway' || orderType === 'dine-in') && (
                            <label className="block">
                                <span className="text-sm text-gray-500 mb-1 block">Qaysi filialdan?</span>
                                <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                                    {branches.map(b => (
                                        <option key={b._id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                    </div>
                </div>

                {/* To'lov turi (Payment Method) */}
                <div className="card p-4 space-y-3">
                    <h2 className="font-semibold text-gray-800">To'lov turi</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('cash')}
                            className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'cash' ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}`}
                        >
                            <Wallet size={24} /> Naqd pul
                        </button>
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}`}
                        >
                            <CreditCard size={24} /> Terminal
                        </button>
                        <button 
                            type="button"
                            onClick={() => setPaymentMethod('click')}
                            className={`py-3 px-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'click' ? 'bg-primary text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'}`}
                        >
                            <div className="w-6 h-6 flex items-center justify-center font-bold text-[11px] bg-white rounded-full select-none shadow-sm" style={{ color: paymentMethod === 'click' ? 'var(--color-primary)' : '#3b82f6' }}>C</div> Click/Payme
                        </button>
                    </div>
                </div>

                {/* Promokod */}
                <div className="card p-4">
                    <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Tag size={16} className="text-primary" /> Promokod
                    </h2>
                    {promoResult ? (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 animate-in fade-in duration-300">
                            <CheckCircle2 size={20} className="text-green-600 shrink-0" />
                            <div className="flex-1">
                                <p className="text-green-700 font-semibold text-sm">{promoResult.message}</p>
                                <p className="text-green-600 text-xs mt-0.5">Promokod qo'llanildi ✓</p>
                            </div>
                            <button onClick={() => { setPromoResult(null); setPromoCode(''); }} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleCheckPromo()}
                                placeholder="GRAND10"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 font-mono font-bold tracking-widest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm uppercase"
                            />
                            <button
                                onClick={handleCheckPromo}
                                disabled={promoLoading || !promoCode.trim()}
                                className="px-4 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm disabled:opacity-50 active:scale-95 transition-transform"
                            >
                                {promoLoading ? <Loader2 size={16} className="animate-spin" /> : 'Tekshir'}
                            </button>
                        </div>
                    )}
                    {promoError && (
                        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                            <XCircle size={12} /> {promoError}
                        </p>
                    )}
                </div>

                {/* Summary */}
                <div className="card p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Mahsulotlar:</span>
                        <span>{cartTotal.toLocaleString()} so'm</span>
                    </div>
                    {orderType === 'delivery' && (
                        <div className="flex justify-between text-gray-600">
                            <span>Yetkazib berish:</span>
                            <span>15,000 so'm</span>
                        </div>
                    )}
                    {promoResult && (
                        <div className="flex justify-between text-green-600 font-semibold animate-in fade-in duration-300">
                            <span>🎁 Chegirma ({promoCode}):</span>
                            <span>-{discount.toLocaleString()} so'm</span>
                        </div>
                    )}
                    <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
                        <span>Jami summa:</span>
                        <span className={promoResult ? 'text-primary' : ''}>{calculatedTotal.toLocaleString()} so'm</span>
                    </div>
                </div>

            </main>

            {/* Bottom Button */}
            <div className="fixed bottom-4 left-0 right-0 px-4 max-w-md mx-auto">
                <button 
                    onClick={handleSubmitOrder}
                    disabled={isLoading}
                    className="btn-primary w-full shadow-lg shadow-green-500/20 text-lg flex justify-center items-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Buyurtma berish"}
                </button>
            </div>
        </div>
    );
};
