import { useMemo } from 'react';
import './PixelBackground.css';

/**
 * PixelBackground — a full-screen animated pixel art scene
 * with stars, shooting stars, clouds, road, cars, trees, and fireflies.
 */
export const PixelBackground = () => {
    // Generate stars
    const stars = useMemo(() =>
        Array.from({ length: 60 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            size: Math.random() > 0.7 ? 4 : Math.random() > 0.4 ? 3 : 2,
            dur: `${2 + Math.random() * 5}s`,
            delay: `${Math.random() * 5}s`,
        })), []);

    // Shooting stars
    const shootingStars = useMemo(() =>
        Array.from({ length: 3 }, (_, i) => ({
            id: i,
            top: `${5 + Math.random() * 25}%`,
            left: `${Math.random() * 40}%`,
            dur: `${2.5 + Math.random() * 2}s`,
            delay: `${i * 6 + Math.random() * 3}s`,
        })), []);

    // Grass blades
    const grassBlades = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: `${(i / 40) * 100 + Math.random() * 2}%`,
            height: 6 + Math.random() * 14,
            dur: `${1.5 + Math.random() * 2}s`,
            delay: `${Math.random() * 2}s`,
        })), []);

    // Fireflies
    const fireflies = useMemo(() =>
        Array.from({ length: 8 }, (_, i) => ({
            id: i,
            left: `${10 + Math.random() * 80}%`,
            bottom: `${14 + Math.random() * 30}%`,
            dur: `${5 + Math.random() * 6}s`,
            delay: `${Math.random() * 8}s`,
            x: `${-30 + Math.random() * 60}px`,
            y: `${-40 - Math.random() * 60}px`,
            x2: `${-20 + Math.random() * 40}px`,
            y2: `${-80 - Math.random() * 80}px`,
        })), []);

    return (
        <div className="pixel-bg">
            {/* Stars */}
            <div className="pixel-bg__stars">
                {stars.map(s => (
                    <div
                        key={s.id}
                        className="pixel-bg__star"
                        style={{
                            left: s.left,
                            top: s.top,
                            width: `${s.size}px`,
                            height: `${s.size}px`,
                            '--dur': s.dur,
                            '--delay': s.delay,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Shooting Stars */}
            {shootingStars.map(s => (
                <div
                    key={s.id}
                    className="pixel-bg__shooting-star"
                    style={{
                        top: s.top,
                        left: s.left,
                        '--shoot-dur': s.dur,
                        '--shoot-delay': s.delay,
                    } as React.CSSProperties}
                />
            ))}

            {/* Clouds */}
            <div className="pixel-bg__clouds">
                <div
                    className="pixel-bg__cloud pixel-bg__cloud--large"
                    style={{ top: '5%', '--cloud-dur': '45s', '--cloud-delay': '0s' } as React.CSSProperties}
                />
                <div
                    className="pixel-bg__cloud pixel-bg__cloud--medium"
                    style={{ top: '20%', '--cloud-dur': '55s', '--cloud-delay': '10s' } as React.CSSProperties}
                />
                <div
                    className="pixel-bg__cloud pixel-bg__cloud--large"
                    style={{ top: '35%', '--cloud-dur': '40s', '--cloud-delay': '20s' } as React.CSSProperties}
                />
                <div
                    className="pixel-bg__cloud pixel-bg__cloud--small"
                    style={{ top: '12%', '--cloud-dur': '65s', '--cloud-delay': '5s' } as React.CSSProperties}
                />
                <div
                    className="pixel-bg__cloud pixel-bg__cloud--medium"
                    style={{ top: '45%', '--cloud-dur': '50s', '--cloud-delay': '30s' } as React.CSSProperties}
                />
            </div>

            {/* Trees */}
            <div className="pixel-bg__tree" style={{ left: '8%' }}>
                <div className="pixel-bg__tree-leaves" />
                <div className="pixel-bg__tree-trunk" />
            </div>
            <div className="pixel-bg__tree" style={{ left: '25%' }}>
                <div className="pixel-bg__tree-leaves" />
                <div className="pixel-bg__tree-trunk" />
            </div>
            <div className="pixel-bg__tree" style={{ left: '72%' }}>
                <div className="pixel-bg__tree-leaves" />
                <div className="pixel-bg__tree-trunk" />
            </div>
            <div className="pixel-bg__tree" style={{ left: '90%' }}>
                <div className="pixel-bg__tree-leaves" />
                <div className="pixel-bg__tree-trunk" />
            </div>

            {/* Grass */}
            <div className="pixel-bg__grass">
                {grassBlades.map(g => (
                    <div
                        key={g.id}
                        className="pixel-bg__grass-blade"
                        style={{
                            left: g.left,
                            height: `${g.height}px`,
                            '--grass-dur': g.dur,
                            '--grass-delay': g.delay,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* Road */}
            <div className="pixel-bg__road" />

            {/* Car 1 — red, going right */}
            <div className="pixel-bg__car-container">
                <div className="pixel-bg__car" />
            </div>

            {/* Car 2 — yellow, going left */}
            <div className="pixel-bg__car-container--2">
                <div className="pixel-bg__car--2" />
            </div>

            {/* Ground */}
            <div className="pixel-bg__ground" />

            {/* Fireflies */}
            {fireflies.map(f => (
                <div
                    key={f.id}
                    className="pixel-bg__firefly"
                    style={{
                        left: f.left,
                        bottom: f.bottom,
                        '--ff-dur': f.dur,
                        '--ff-delay': f.delay,
                        '--ff-x': f.x,
                        '--ff-y': f.y,
                        '--ff-x2': f.x2,
                        '--ff-y2': f.y2,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};
