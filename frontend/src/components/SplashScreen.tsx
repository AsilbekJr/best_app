import { useEffect, useState } from 'react';

export const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('exit'), 1800);
        const t3 = setTimeout(onFinish, 2200);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onFinish]);

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, #0f5c26 0%, #1a7a38 50%, #0d4a1f 100%)',
                opacity: phase === 'exit' ? 0 : 1,
                transition: phase === 'exit' ? 'opacity 0.4s ease-out' : 'none',
                pointerEvents: phase === 'exit' ? 'none' : 'all',
            }}
        >
            {/* Burger Emoji — scale-in animatsiya */}
            <div
                style={{
                    fontSize: '5rem',
                    transform: phase === 'enter' ? 'scale(0.4) rotate(-20deg)' : 'scale(1) rotate(0deg)',
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))',
                }}
            >
                🍔
            </div>

            {/* Logo matni */}
            <div
                style={{
                    marginTop: '20px',
                    opacity: phase === 'enter' ? 0 : 1,
                    transform: phase === 'enter' ? 'translateY(10px)' : 'translateY(0)',
                    transition: 'all 0.5s ease 0.3s',
                    textAlign: 'center',
                }}
            >
                <h1 style={{
                    color: '#ffffff',
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                }}>
                    Best<span style={{ color: '#fce100' }}>!</span> Burger
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    marginTop: '6px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                }}>
                    Toshkentning eng mazali burgeri
                </p>
            </div>

            {/* Pastki loader nuqtalari */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '48px', opacity: phase === 'enter' ? 0 : 1, transition: 'opacity 0.3s ease 0.6s' }}>
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.6)',
                            animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{`
                @keyframes pulse-dot {
                    0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
                    40% { transform: scale(1.2); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
