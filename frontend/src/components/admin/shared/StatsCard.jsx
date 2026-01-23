import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StatsCard - Reusable stat display card for admin dashboard
 */
const StatsCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    subtitle,
    color = 'orange'
}) => {
    const colorMap = {
        orange: {
            bg: 'from-orange-500/10 to-amber-500/5',
            border: 'border-orange-500/20',
            icon: 'bg-orange-500/20 text-orange-400',
            text: 'text-orange-400',
            glow: 'bg-orange-500'
        },
        green: {
            bg: 'from-green-500/10 to-emerald-500/5',
            border: 'border-green-500/20',
            icon: 'bg-green-500/20 text-green-400',
            text: 'text-green-400',
            glow: 'bg-green-500'
        },
        blue: {
            bg: 'from-blue-500/10 to-cyan-500/5',
            border: 'border-blue-500/20',
            icon: 'bg-blue-500/20 text-blue-400',
            text: 'text-blue-400',
            glow: 'bg-blue-500'
        },
        purple: {
            bg: 'from-purple-500/10 to-pink-500/5',
            border: 'border-purple-500/20',
            icon: 'bg-purple-500/20 text-purple-400',
            text: 'text-purple-400',
            glow: 'bg-purple-500'
        }
    };

    const colors = colorMap[color] || colorMap.orange;

    const getTrendIcon = () => {
        if (!trend) return <Minus size={14} className="text-white/30" />;
        if (trend === 'up') return <TrendingUp size={14} className="text-green-400" />;
        if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
        return <Minus size={14} className="text-white/30" />;
    };

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border p-6 transition-all hover:scale-[1.02]",
            `bg-gradient-to-br ${colors.bg} ${colors.border}`
        )}>
            {/* Icon */}
            <div className="flex items-start justify-between mb-4">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    colors.icon
                )}>
                    {Icon && <Icon size={24} />}
                </div>

                {trend && trendValue && (
                    <div className="flex items-center gap-1 text-xs">
                        {getTrendIcon()}
                        <span className={cn(
                            "font-medium",
                            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-white/40'
                        )}>
                            {trendValue}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-2">
                    {title}
                </h3>
                <div className="flex items-baseline gap-2 mb-1">
                    <span className={cn("text-3xl font-bold", colors.text)}>
                        {value}
                    </span>
                </div>
                {subtitle && (
                    <p className="text-xs text-white/40">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Glow effect */}
            <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl rounded-full opacity-20",
                colors.glow
            )} />
        </div>
    );
};

export default StatsCard;
