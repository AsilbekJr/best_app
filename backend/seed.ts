import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category';
import Product from './src/models/Product';
import Branch from './src/models/Branch';

dotenv.config();

const seed = async () => {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB ga ulandi');

    // Eski ma'lumotlarni tozalash
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Branch.deleteMany({});
    console.log('Eski ma\'lumotlar tozalandi');

    // ===================== KATEGORIYALAR =====================
    const categories = await Category.insertMany([
        { name: '🍔 Burgerlar', isActive: true },
        { name: '🌯 Lavashlar', isActive: true },
        { name: '🌭 Hot-Doglar', isActive: true },
        { name: '🍟 Gazaklar (Snack)', isActive: true },
        { name: '🥤 Ichimliklar', isActive: true },
        { name: '🍱 Setlar', isActive: true },
    ]);
    console.log('Kategoriyalar qo\'shildi:', categories.map(c => c.name));

    const [burgersCat, lavashCat, hotdogCat, snacksCat, drinksCat, setsCat] = categories;

    // ===================== MAHSULOTLAR =====================
    const products = await Product.insertMany([

        // ===== BURGERLAR =====
        {
            name: 'BBQ Burger',
            description: 'Ko\'mir olovida pishirilgan juicy go\'sht, BBQ sous bilan',
            price: 38000,
            categoryId: burgersCat._id,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Cheeseburger',
            description: '2 qatlam pishloq, yangi sabzavot va maxsus sous',
            price: 32000,
            categoryId: burgersCat._id,
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Double Burger',
            description: 'Ikki karra go\'sht, maxsus sous va pishloq',
            price: 45000,
            categoryId: burgersCat._id,
            image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Tovuq Burger',
            description: 'Qovurilgan tovuq filesi, karam va mayonez bilan',
            price: 35000,
            categoryId: burgersCat._id,
            image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Veggie Burger',
            description: 'Go\'shtsiz, sabzavotli va pishloqli burger',
            price: 28000,
            categoryId: burgersCat._id,
            image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },

        // ===== LAVASHLAR =====
        {
            name: 'Tovuq Lavash',
            description: 'Grilled tovuq, sabzavot, smetana va maxsus sous bilan',
            price: 30000,
            categoryId: lavashCat._id,
            image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Go\'sht Lavash',
            description: 'Juicy go\'sht, piyoz, tomat va sous bilan',
            price: 34000,
            categoryId: lavashCat._id,
            image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Pishloqli Lavash',
            description: 'Erib ketadigan pishloq va sabzavot bilan',
            price: 27000,
            categoryId: lavashCat._id,
            image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'O\'tkir Lavash',
            description: 'Achchiq sous va jalapeno bilan — issiq sevuvchilar uchun!',
            price: 32000,
            categoryId: lavashCat._id,
            image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },

        // ===== HOT-DOGLAR =====
        {
            name: 'Klassik Hot-Dog',
            description: 'Juicy sosiska, ketchup va xantal bilan',
            price: 22000,
            categoryId: hotdogCat._id,
            image: 'https://images.unsplash.com/photo-1612392062631-94b23e052543?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'O\'tkir Hot-Dog',
            description: 'Achchiq jalap sous va qizil piyoz bilan',
            price: 24000,
            categoryId: hotdogCat._id,
            image: 'https://images.unsplash.com/photo-1610040078-6679b77d5c57?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Double Hot-Dog',
            description: 'Ikki karra sosiska, pishloq va sous bilan',
            price: 32000,
            categoryId: hotdogCat._id,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Pishloqli Hot-Dog',
            description: 'Erib ketadigan pishloq va crispy piyoz bilan',
            price: 26000,
            categoryId: hotdogCat._id,
            image: 'https://images.unsplash.com/photo-1533483595632-c5f0e57a1936?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },

        // ===== GAZAKLAR =====
        {
            name: 'Katta Fri',
            description: 'Tuzlangan oltin kartoshka fri',
            price: 18000,
            categoryId: snacksCat._id,
            image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Pishloqli Tayoqchalar',
            description: 'Erib ketadigan pishloqli qaynoq tayoqchalar',
            price: 22000,
            categoryId: snacksCat._id,
            image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Nuggets (8 dona)',
            description: 'Tanlangan tovuq go\'shtidan, sous bilan',
            price: 28000,
            categoryId: snacksCat._id,
            image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Qovurilgan Qanot',
            description: 'Spicy marinadli qovurilgan tovuq qanoti',
            price: 35000,
            categoryId: snacksCat._id,
            image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },

        // ===== ICHIMLIKLAR =====
        {
            name: 'Coca-Cola 0.5L',
            description: 'Sovuq Coca-Cola muz bilan',
            price: 8000,
            categoryId: drinksCat._id,
            image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Fanta 0.5L',
            description: 'Apelsin Fanta sovuq',
            price: 8000,
            categoryId: drinksCat._id,
            image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Sprite 0.5L',
            description: 'Limon Sprite sovuq',
            price: 8000,
            categoryId: drinksCat._id,
            image: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Mineral Suv',
            description: 'Sof mineral suv 0.5L',
            price: 5000,
            categoryId: drinksCat._id,
            image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Limonad (Uy taomi)',
            description: 'Yangi tayyorlangan limon va nanali limonad',
            price: 18000,
            categoryId: drinksCat._id,
            image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },

        // ===== SETLAR =====
        {
            name: 'Oilaviy Set (4 kishi)',
            description: '4 ta Burger + 4 ta Fri + 4 ta Ichimlik — 20% chegirma bilan',
            price: 150000,
            categoryId: setsCat._id,
            image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Juft Set (2 kishi)',
            description: '2 ta Burger + 2 ta Fri + 2 ta Ichimlik — 15% chegirma',
            price: 85000,
            categoryId: setsCat._id,
            image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Tushlik Seti',
            description: '1 ta Burger + Katta Fri + 0.5L Ichimlik',
            price: 55000,
            categoryId: setsCat._id,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
        {
            name: 'Yakkaxon Set',
            description: '1 ta Lavash + Nuggets + Ichimlik',
            price: 62000,
            categoryId: setsCat._id,
            image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=60',
            isActive: true
        },
    ]);
    console.log('Mahsulotlar qo\'shildi:', products.length, 'ta');

    // ===================== FILIALLAR =====================
    const branches = await Branch.insertMany([
        {
            name: 'Best Burger — Chilonzor',
            address: 'Chilonzor, 9-mavze',
            location: { lat: 41.2995, lng: 69.2401 },
            isActive: true
        },
        {
            name: 'Best Burger — Yunusobod',
            address: 'Yunusobod, 7-mavze',
            location: { lat: 41.3543, lng: 69.3200 },
            isActive: true
        },
        {
            name: 'Best Burger — Mirzo Ulugbek',
            address: 'Mirzo Ulugbek tumani',
            location: { lat: 41.3408, lng: 69.3072 },
            isActive: true
        },
    ]);
    console.log('Filiallar qo\'shildi:', branches.map(b => b.name));

    console.log('\n✅ Seed muvaffaqiyatli yakunlandi!');
    console.log(`📊 ${products.length} ta mahsulot, ${categories.length} ta kategoriya, ${branches.length} ta filial`);
    await mongoose.disconnect();
    process.exit(0);
};

seed().catch(err => {
    console.error('Seed xatosi:', err);
    process.exit(1);
});
