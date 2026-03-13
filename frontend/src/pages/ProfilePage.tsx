import { User, Bell, Shield, Settings, LogOut } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

export const ProfilePage = () => {
    const user = WebApp.initDataUnsafe?.user;

    return (
        <div className="min-h-screen bg-background pb-32">
            <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md px-4 py-4 flex items-center justify-between shadow-sm">
                <h1 className="text-xl font-black text-gray-900">Profil</h1>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 transition-colors hover:bg-gray-200 active:scale-95 text-gray-600">
                    <Settings size={20} />
                </button>
            </header>

            <main className="p-4 space-y-6">
                {/* User Info Card */}
                <div className="card p-6 flex flex-col items-center justify-center text-center mt-4">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-white mb-4 overflow-hidden flex items-center justify-center shadow-md">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={48} className="text-gray-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {user?.first_name || 'Foydalanuvchi'} {user?.last_name || ''}
                    </h2>
                    <p className="font-semibold text-gray-500 mt-1">
                        @{user?.username || 'yashirin'}
                    </p>
                </div>

                {/* Settings Menu */}
                <div className="space-y-3">
                    <button className="w-full card p-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                                <Bell size={20} className="text-green-600" />
                            </div>
                            <span className="font-bold text-gray-800">Bildirishnomalar</span>
                        </div>
                    </button>
                    
                    <button className="w-full card p-4 flex items-center justify-between hover:bg-gray-50 transition-colors active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Shield size={20} className="text-blue-600" />
                            </div>
                            <span className="font-bold text-gray-800">Xavfsizlik</span>
                        </div>
                    </button>

                    <button className="w-full card border-red-100 p-4 flex items-center justify-between bg-red-50 hover:bg-red-100 transition-colors active:scale-[0.98] mt-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <LogOut size={20} className="text-red-500" />
                            </div>
                            <span className="font-bold text-red-600">Ilovadan chiqish</span>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};
