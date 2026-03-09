// Hero banner — aksiyalar va mashxur setlar uchun
const HERO_ITEMS = [
    {
        id: 1,
        title: 'Oilaviy Set',
        subtitle: '4 burger + 4 fri + 4 ichimlik',
        tag: '🔥 Ommabop',
        discount: '-20%',
        bg: 'linear-gradient(135deg, #1d9e3d 0%, #0d6b2a 100%)',
        emoji: '👨‍👩‍👧‍👦',
        categoryKey: 'Set',
    },
    {
        id: 2,
        title: 'Tushlik Seti',
        subtitle: 'Burger + Fri + Kola',
        tag: '⚡ Tezkor',
        discount: '-15%',
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        emoji: '🌞',
        categoryKey: 'Set',
    },
    {
        id: 3,
        title: 'Yangi! Double BBQ',
        subtitle: 'Ikki karra go\'sht, maxsus sous',
        tag: '✨ Yangilik',
        discount: null,
        bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
        emoji: '🍔',
        categoryKey: 'Burger',
    },
];

interface HeroBannerProps {
    onBannerTap?: (categoryKey: string) => void;
}

export const HeroBanner = ({ onBannerTap }: HeroBannerProps) => {
    return (
        <div className="-mx-4 mb-4">
            <div
                className="flex gap-3 overflow-x-auto pb-2 snap-x before:content-[''] before:w-4 before:shrink-0 before:block after:content-[''] after:w-4 after:shrink-0 after:block"
                style={{ scrollbarWidth: 'none' }}
            >
                {HERO_ITEMS.map(item => (
                    <div
                        key={item.id}
                        className="snap-start shrink-0 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
                        style={{
                            width: '260px',
                            background: item.bg,
                            padding: '18px 20px',
                            position: 'relative',
                            minHeight: '110px',
                        }}
                        onClick={() => onBannerTap?.(item.categoryKey)}
                    >
                        {/* Tag */}
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(4px)',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '99px',
                            marginBottom: '8px',
                        }}>
                            {item.tag}
                        </div>

                        {/* Matn */}
                        <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2 }}>
                            {item.title}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', marginTop: '4px', maxWidth: '150px' }}>
                            {item.subtitle}
                        </p>

                        {/* Discount badge */}
                        {item.discount && (
                            <div style={{
                                display: 'inline-block',
                                background: '#fce100',
                                color: '#1a1a1a',
                                fontSize: '0.75rem',
                                fontWeight: 900,
                                padding: '4px 10px',
                                borderRadius: '8px',
                                marginTop: '10px',
                            }}>
                                {item.discount}
                            </div>
                        )}

                        {/* Katta emoji */}
                        <div style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '3.2rem',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                        }}>
                            {item.emoji}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
