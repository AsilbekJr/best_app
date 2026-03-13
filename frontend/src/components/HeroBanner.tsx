import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const HERO_ITEMS = [
    {
        id: 1,
        title: 'Oilaviy Set',
        subtitle: 'Barchasi bitta qutida! Burgerlar, fri va ichimlik.',
        tag: '🔥 Top Set',
        discount: '-20%',
        image: '/images/1550547660-d9450f859349.jpg',
        categoryKey: 'Set',
    },
    {
        id: 2,
        title: 'Gourmet Burger',
        subtitle: '100% Halol mol go\'shti va maxsus sous.',
        tag: '⭐ Premium',
        discount: null,
        image: '/images/1568901346375-23c9450c58cd.jpg',
        categoryKey: 'Burger',
    },
    {
        id: 3,
        title: 'Qarsildoq Jo\'ja',
        subtitle: 'Maxsus sirrli retsept asosida.',
        tag: '✨ Yangi',
        discount: null,
        image: '/images/1626082927389-6cd097cdc6ec.jpg',
        categoryKey: 'Tovuq',
    },
];

interface HeroBannerProps {
    onBannerTap?: (categoryKey: string) => void;
}

export const HeroBanner = ({ onBannerTap }: HeroBannerProps) => {
    // Embla carousel init
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [
        Autoplay({ delay: 3500, stopOnInteraction: false })
    ]);

    return (
        <div className="-mx-4 mb-4 overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y">
                {HERO_ITEMS.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="flex-[0_0_88%] min-w-0 pl-4 cursor-pointer"
                        style={{ paddingRight: index === HERO_ITEMS.length - 1 ? '16px' : '0' }}
                        onClick={() => onBannerTap?.(item.categoryKey)}
                    >
                        <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                            {/* Orqa fon rasmi */}
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-1000 hover:scale-105"
                            />
                            
                            {/* Qora qoraytirilgan gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Kontent */}
                            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-primary/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md">
                                        {item.tag}
                                    </span>
                                    {item.discount && (
                                        <span className="bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                                            {item.discount}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-white text-xl font-black leading-tight drop-shadow-md tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-white/90 text-xs mt-1 font-medium drop-shadow-sm max-w-[80%] line-clamp-1">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
