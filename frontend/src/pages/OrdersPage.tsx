import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Clock, RefreshCw, Loader2, Package } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { useGetMyOrdersQuery } from '../store/apiSlice';
import { addToCart, clearCart } from '../store/cartSlice';

export const OrdersPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const chatId = WebApp.initDataUnsafe?.user?.id?.toString() || '';

    const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery(chatId, {
        skip: !chatId, // faqat chatId bo'lsa fetch qilamiz
    });

    useEffect(() => {
        if (chatId) refetch();
    }, [chatId, refetch]);

    const handleReorder = (order: any) => {
        dispatch(clearCart());
        order.items.forEach((item: any) => {
            dispatch(addToCart({
                id: item.productId,
                name: item.productName || 'Mahsulot',
                price: item.price || 0, // Backend hozircha 0 qaytarishi mumkin agar narx yozilmagan bo'lsa
                image: item.image || '', // Rasm bo'lmasligi ham mumkin, fallbackni menu da hal qilgandek ko'ramiz
                quantity: item.quantity
            }));
        });
        navigate('/checkout');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24">
                <Loader2 size={40} className="animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Buyurtmalar yuklanmoqda...</p>
            </div>
        );
    }

    if (error || !chatId) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-24 px-4 text-center">
                <Package size={48} className="text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Buyurtmalar topilmadi</h2>
                <p className="text-gray-500 text-sm">Tarixni ko'rish uchun Telegram orqali kirganingizga ishonch hosil qiling.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md px-4 py-4 shadow-sm border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="text-primary" /> Mening buyurtmalarim
                </h1>
            </header>

            <main className="p-4 space-y-4">
                {!orders || orders.length === 0 ? (
                    <div className="card p-8 text-center flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
                        <Package size={48} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700">Hali buyurtma qilmadingiz</h3>
                        <p className="text-gray-500 text-sm mt-1 mb-4">Birinchi buyurtmangizni berish vaqti keldi!</p>
                        <button onClick={() => navigate('/')} className="btn-primary px-6 text-sm">
                            Menyuga o'tish
                        </button>
                    </div>
                ) : (
                    orders.map((order: any) => (
                        <div key={order._id} className="card p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-bold border border-primary/20">
                                            #{order._id.slice(-4).toUpperCase()}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('uz-UZ')} {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="font-bold text-sm text-gray-900">
                                        {order.orderType === 'delivery' ? '🛵 Dostavka' : order.orderType === 'takeaway' ? '🏃 Olib ketish' : '🪑 Zalda'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary drop-shadow-sm">
                                        {order.totalAmount.toLocaleString()} s
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                {order.items.map((item: any, idx: number) => (
                                    <p key={idx} className="text-xs font-medium text-gray-600 flex justify-between">
                                        <span>• {item.productName || 'Mahsulot'}</span>
                                        <span className="font-bold">x{item.quantity}</span>
                                    </p>
                                ))}
                            </div>

                            <button 
                                onClick={() => handleReorder(order)}
                                className="mt-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 text-gray-700"
                            >
                                <RefreshCw size={16} /> 
                                <span>Qayta buyurtma qilish</span>
                            </button>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};
