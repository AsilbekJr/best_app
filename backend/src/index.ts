import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Telegraf } from 'telegraf';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Telegram Bot
export const bot = new Telegraf(process.env.BOT_TOKEN || 'DUMMY_TOKEN');

import fs from 'fs';

// Action Handlers
bot.on('message', (ctx, next) => {
    if (ctx.chat?.id) {
        fs.writeFileSync('last_chat_id.txt', ctx.chat.id.toString());
    }
    return next();
});

// Mijozga status xabari yuborish uchun yordamchi funksiya
const notifyCustomer = async (orderId: string, message: string) => {
    try {
        const Order = require('./models/Order').default;
        const order = await Order.findById(orderId);
        if (order && order.telegramChatId) {
            await bot.telegram.sendMessage(order.telegramChatId, message, { parse_mode: 'HTML' });
            console.log(`Mijozga xabar jo'natildi: ${order.telegramChatId}`);
        }
    } catch (e) {
        console.error('Mijozga xabar jo\'natishda xatolik:', e);
    }
};

bot.action(/accept_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    await ctx.answerCbQuery('Buyurtma qabul qilindi');
    
    const msg = ctx.callbackQuery.message as any;
    const originalText = msg?.text || '';
    const newText = originalText + `\n\n🟢 <b>STATUS:</b> Qabul qilindi va tayyorlanmoqda. ✅ by ${ctx.from.first_name}`;
    
    await ctx.editMessageText(newText, { parse_mode: 'HTML' });
    
    // Mijozga xabar yuborish
    await notifyCustomer(orderId, 
        `🍔 <b>Best Burger</b>\n\n✅ Buyurtmangiz qabul qilindi!\n\nOshpazlar hozirning o'zida tayyorlay boshlashdi. Tez orada tayyor bo'ladi! 🔥`
    );
});

bot.action(/cancel_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    await ctx.answerCbQuery('Buyurtma bekor qilindi');
    
    const msg = ctx.callbackQuery.message as any;
    const originalText = msg?.text || '';
    const newText = originalText + `\n\n🔴 <b>STATUS:</b> Bekor qilindi. ❌ by ${ctx.from.first_name}`;
    
    await ctx.editMessageText(newText, { parse_mode: 'HTML' });
    
    // Mijozga xabar yuborish
    await notifyCustomer(orderId, 
        `🍔 <b>Best Burger</b>\n\n❌ Afsuski, buyurtmangiz bekor qilindi.\n\nQo'shimcha ma'lumot uchun restoran bilan bog'laning.`
    );
});

bot.action(/delivering_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    await ctx.answerCbQuery("Kuryerga berildi");
    
    const msg = ctx.callbackQuery.message as any;
    const originalText = msg?.text || '';
    // Agar oldingi status yozilgan bo'lsa uni olib tashlab yangilaymiz
    const cleanText = originalText.split('\n\nSTATUS:')[0];
    const newText = cleanText + `\n\n🛵 <b>STATUS:</b> Kuryerga berildi (Yo'lga chiqdi). by ${ctx.from.first_name}`;
    
    await ctx.editMessageText(newText, { parse_mode: 'HTML' });
    
    // Mijozga xabar yuborish
    await notifyCustomer(orderId, 
        `🍔 <b>Best Burger</b>\n\n🛵 Buyurtmangiz yo'lda!\n\nKuryer siz tomon yo'lga chiqdi. Ko'p kutmang, tez yetib boradi! 😊`
    );
});

bot.action(/completed_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    await ctx.answerCbQuery("Yetkazib berildi");
    
    const msg = ctx.callbackQuery.message as any;
    const originalText = msg?.text || '';
    const cleanText = originalText.split('\n\nSTATUS:')[0];
    const newText = cleanText + `\n\n🎉 <b>STATUS:</b> Yetkazib berildi / Yakunlandi. by ${ctx.from.first_name}`;
    
    await ctx.editMessageText(newText, { parse_mode: 'HTML' });
    
    // Mijozga xabar yuborish
    await notifyCustomer(orderId, 
        `🍔 <b>Best Burger</b>\n\n🎉 Buyurtmangiz yetkazib berildi!\n\nOvqatlanishingiz xush o'tsin! Yana ko'rishguncha! ❤️\n\n⭐ Xizmatimizni baholasangiz iltimos: /rate`
    );
});

// ⭐ /rate komandasi — mijozdan reyting so'rash
bot.command('rate', (ctx) => {
    ctx.reply(
        `🍔 <b>Best Burger</b>\n\nXizmatimizni va taomlarimizni qanday baholaysiz?\n\n`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [[
                    { text: '1 ⭐', callback_data: 'rate_1' },
                    { text: '2 ⭐', callback_data: 'rate_2' },
                    { text: '3 ⭐', callback_data: 'rate_3' },
                    { text: '4 ⭐', callback_data: 'rate_4' },
                    { text: '5 ⭐', callback_data: 'rate_5' },
                ]]
            }
        }
    );
});

// ⭐ Reyting tugmasi bosilganda
bot.action(/rate_(\d)/, async (ctx) => {
    const stars = parseInt(ctx.match[1]);
    const starText = '⭐'.repeat(stars);
    
    await ctx.answerCbQuery();
    await ctx.editMessageText(
        `🍔 <b>Best Burger</b>\n\nSiz ${starText} baho berdingiz!\n\n${
            stars === 5 ? '🎉 Rahmat! Siz bizning eng yaxshi mijozimizdasiz!' :
            stars >= 4 ? '😊 Rahmat! Fikringiz bizga juda muhim.' :
            stars >= 3 ? '🙏 Rahmat! Kamchiliklarimizni tuzatishga harakat qilamiz.' :
            '😔 Uzr so\'ring. Sifatimizni yaxshilash ustida ishlaymiz.'
        }`,
        { parse_mode: 'HTML' }
    );

    // Reyting DB ga saqlash
    try {
        const Rating = require('./models/Rating').default;
        await Rating.create({
            telegramUserId: ctx.from?.id?.toString(),
            userName: ctx.from?.first_name || 'Noma\'lum',
            stars,
            createdAt: new Date()
        });
    } catch (e) {
        // Rating model bo'lmasa ham davom et
        console.log(`Rating: ${stars} yulduz - ${ctx.from?.first_name}`);
    }
});

bot.start((ctx) => {
    if (ctx.chat?.type !== 'private') {
        return ctx.reply("Salom! Ushbu buyruq orqali bot guruhda ishga tushirildi. Buyurtmalar shu yerga keladi.");
    }
    
    if (process.env.FRONTEND_URL) {
        ctx.setChatMenuButton({
            type: "web_app",
            text: "🍔 Menyu",
            web_app: { url: process.env.FRONTEND_URL }
        }).catch(err => console.error("Menu button update failed for user:", err));
    }

    const payload = ctx.payload;
    if (payload) {
        ctx.reply(`Xush kelibsiz! Siz stoldan kirdingiz. Kod: ${payload}. Web App ni ochish uchun quyidagi tugmani bosing:`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🍔 Menyu (Buyurtma berish)", web_app: { url: `${process.env.FRONTEND_URL}?table=${payload}` } }]
                ]
            }
        });
    } else {
        ctx.reply('Best Burger ga xush kelibsiz! Menyuni ko\'rish uchun pastdagi tugmani bosing.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🍔 Menyu (Yetkazib berish)", web_app: { url: process.env.FRONTEND_URL || 'http://localhost:5173' } }]
                ]
            }
        });
    }
});

import path from 'path';
import routes from './routes';

app.use('/api', routes);

// Serve Admin Panel
const adminPath = path.join(process.cwd(), 'public', 'admin');
app.use('/admin', express.static(adminPath));
app.get('/admin', (_req, res) => {
    res.sendFile(path.join(adminPath, 'index.html'));
});

// Serve Static Frontend Pages (frontend/dist papkasidan)
const frontendPath = path.join(process.cwd(), 'frontend', 'dist');
app.use(express.static(frontendPath));

// Wildcard for React Router
app.get('*', (req, res) => {
    const indexFile = path.join(frontendPath, 'index.html');
    // Agar frontend build mavjud bo'lsa — uni qaytarish
    if (require('fs').existsSync(indexFile)) {
        res.sendFile(indexFile);
    } else {
        res.status(404).json({ message: 'Frontend build topilmadi. npm run build:all ni ishga tushiring.' });
    }
});

// Database & Server Connection
mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, async () => {
            console.log(`Server is running on port ${PORT}`);
            if (process.env.BOT_TOKEN && process.env.BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
                try {
                    await bot.launch();
                    console.log('Telegram bot is running');
                    
                    if (process.env.FRONTEND_URL) {
                        try {
                            await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setChatMenuButton`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    menu_button: {
                                        type: "web_app",
                                        text: "🍔 Menyu",
                                        web_app: { url: process.env.FRONTEND_URL }
                                    }
                                })
                            });
                            console.log('Bot Menu Button successfully auto-updated!');
                        } catch (menuErr: any) {
                            console.error('Failed to update Bot Menu Button', menuErr.message);
                        }
                    }
                } catch (botErr) {
                    console.error('Failed to launch bot', botErr);
                }
            } else {
                console.log('Telegram bot skipping launch - Please provide a valid BOT_TOKEN');
            }
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));