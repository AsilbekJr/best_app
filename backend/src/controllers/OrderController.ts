import { Request, Response } from 'express';
import Order from '../models/Order';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { 
            customerName, 
            customerPhone, 
            orderType, 
            tableNumber, 
            branchName, 
            deliveryAddress, 
            items, 
            totalAmount, 
            telegramChatId 
        } = req.body;

        const newOrder = new Order({
            customerName,
            customerPhone,
            orderType,
            tableNumber,
            branchName,
            deliveryAddress,
            items,
            totalAmount,
            telegramChatId
        });

        await newOrder.save();

        // Admin guruhiga xabar yuborish
        await sendOrderToAdminGroup(newOrder);

        res.status(201).json({ message: 'Buyurtma muvaffaqiyatli qabul qilindi', orderId: newOrder._id });
    } catch (error) {
        console.error('Buyurtma saqlashda xatolik:', error);
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.params;
        if (!chatId) {
            return res.status(400).json({ message: "Chat ID (Telegram ID) talab qilinadi" });
        }

        const orders = await Order.find({ telegramChatId: chatId })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(orders);
    } catch (error) {
        console.error('Buyurtmalarni olishda xatolik:', error);
        res.status(500).json({ message: 'Server xatosi', error });
    }
};

const sendOrderToAdminGroup = async (order: any) => {
    try {
        const adminGroupId = process.env.ADMIN_GROUP_ID;
        if (!adminGroupId || adminGroupId === '-1000000000000') return;

        let message = `🟢 <b>YANGI BUYURTMA #${order._id.toString().slice(-4).toUpperCase()}</b>\n\n`;
        message += `👤 <b>Mijoz:</b> ${order.customerName}\n`;
        if (order.customerPhone) {
            message += `📞 <b>Telefon:</b> ${order.customerPhone}\n`;
        }
        
        let typeStr = '';
        if (order.orderType === 'dine-in') typeStr = '🪑 Zalda ovqatlanish';
        else if (order.orderType === 'delivery') typeStr = '🛵 Yetkazib berish (Dostavka)';
        else if (order.orderType === 'takeaway') typeStr = '🏃 Olib ketish (Takeaway)';
        
        message += `📋 <b>Turi:</b> ${typeStr}\n`;

        if (order.orderType === 'dine-in') {
            message += `📍 <b>Filial:</b> ${order.branchName || "Noma'lum"}\n`;
            message += `🪑 <b>Stol raqami:</b> ${order.tableNumber}\n`;
        } else if (order.orderType === 'delivery') {
            message += `📍 <b>Manzil:</b> ${order.deliveryAddress}\n`;
        } else {
            message += `📍 <b>Qaysi filialdan olib ketish:</b> ${order.branchName}\n`;
        }

        message += `\n🛒 <b>Buyurtma ro'yxati:</b>\n`;
        order.items.forEach((item: any, index: number) => {
            const itemName = item.productName ? item.productName : `Mahsulot ID: ${item.productId}`;
            message += `${index + 1}. ${itemName} | Soni: ${item.quantity} ta\n`;
        });
        message += `\n💰 <b>Umumiy summa: ${order.totalAmount.toLocaleString()} so'm</b>\n`;

        // Keyboard
        const keyboard = {
            inline_keyboard: [
                [{ text: "✅ Qabul qildi va Tayyorlashni boshladi", callback_data: `accept_${order._id}` }],
                [{ text: "🛵 Kuryerga berildi (Yo'lga chiqdi)", callback_data: `delivering_${order._id}` }],
                [{ text: "🎉 Yetkazib berildi / Yakunlandi", callback_data: `completed_${order._id}` }],
                [{ text: "❌ Bekor qilish", callback_data: `cancel_${order._id}` }]
            ]
        };

        const indexModule = require('../index');
        const telegramBot = indexModule.bot || indexModule.default?.bot;
        
        console.log(`Sending to Admin Group: ${adminGroupId}, Bot defined: ${!!telegramBot}`);

        if (telegramBot) {
            await telegramBot.telegram.sendMessage(adminGroupId, message, { parse_mode: 'HTML', reply_markup: keyboard });
            console.log("Xabar adminga muvaffaqiyatli jo'natildi!");
        } else {
            console.error("Bot instansi topilmadi!");
        }
    } catch (e) {
        console.error("Adminga xabar jo'natishda xatolik", e);
    }
};
