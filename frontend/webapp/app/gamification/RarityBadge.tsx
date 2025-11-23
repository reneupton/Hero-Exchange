'use client';

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

type Props = {
  rarity: Rarity;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showGlow?: boolean;
  showLabel?: boolean;
  className?: string;
};

export default function RarityBadge({
  rarity,
  size = 'md',
  showGlow = false,
  showLabel = true,
  className = '',
}: Props) {
  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common':
        return {
          gradient: 'from-gray-500 to-gray-600',
          textColor: 'text-gray-300',
          borderColor: 'border-gray-500',
          glowColor: 'shadow-gray-500/50',
          bgColor: 'bg-gray-500/10',
        };
      case 'Uncommon':
        return {
          gradient: 'from-green-500 to-green-600',
          textColor: 'text-green-300',
          borderColor: 'border-green-500',
          glowColor: 'shadow-green-500/50',
          bgColor: 'bg-green-500/10',
        };
      case 'Rare':
        return {
          gradient: 'from-blue-500 to-blue-600',
          textColor: 'text-blue-300',
          borderColor: 'border-blue-500',
          glowColor: 'shadow-blue-500/50',
          bgColor: 'bg-blue-500/10',
        };
      case 'Epic':
        return {
          gradient: 'from-purple-500 to-purple-600',
          textColor: 'text-purple-300',
          borderColor: 'border-purple-500',
          glowColor: 'shadow-purple-500/50',
          bgColor: 'bg-purple-500/10',
        };
      case 'Legendary':
        return {
          gradient: 'from-orange-500 to-yellow-500',
          textColor: 'text-orange-300',
          borderColor: 'border-orange-500',
          glowColor: 'shadow-orange-500/50',
          bgColor: 'bg-orange-500/10',
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'xs':
        return 'text-xs px-2 py-0.5';
      case 'sm':
        return 'text-sm px-2 py-1';
      case 'md':
        return 'text-base px-3 py-1.5';
      case 'lg':
        return 'text-lg px-4 py-2';
      default:
        return 'text-base px-3 py-1.5';
    }
  };

  const config = getRarityConfig(rarity);
  const sizeClasses = getSizeClasses(size);

  if (!showLabel) {
    // Just a colored dot indicator
    return (
      <div
        className={`w-3 h-3 rounded-full bg-gradient-to-br ${config.gradient} ${
          showGlow ? `shadow-lg ${config.glowColor}` : ''
        } ${className}`}
      ></div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase ${sizeClasses} bg-gradient-to-r ${
        config.gradient
      } ${showGlow ? `shadow-lg ${config.glowColor}` : ''} ${className}`}
    >
      <span className="text-white drop-shadow-lg">{rarity}</span>
    </div>
  );
}

// Rarity border component for wrapping items
type RarityBorderProps = {
  rarity: Rarity;
  children: React.ReactNode;
  showGlow?: boolean;
  showShimmer?: boolean;
  className?: string;
};

export function RarityBorder({
  rarity,
  children,
  showGlow = true,
  showShimmer = false,
  className = '',
}: RarityBorderProps) {
  const getRarityConfig = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common':
        return {
          borderColor: 'border-gray-500',
          glowColor: 'shadow-gray-500/30',
          gradientFrom: 'from-gray-500',
          gradientTo: 'to-gray-600',
        };
      case 'Uncommon':
        return {
          borderColor: 'border-green-500',
          glowColor: 'shadow-green-500/30',
          gradientFrom: 'from-green-500',
          gradientTo: 'to-green-600',
        };
      case 'Rare':
        return {
          borderColor: 'border-blue-500',
          glowColor: 'shadow-blue-500/30',
          gradientFrom: 'from-blue-500',
          gradientTo: 'to-blue-600',
        };
      case 'Epic':
        return {
          borderColor: 'border-purple-500',
          glowColor: 'shadow-purple-500/30',
          gradientFrom: 'from-purple-500',
          gradientTo: 'to-purple-600',
        };
      case 'Legendary':
        return {
          borderColor: 'border-orange-500',
          glowColor: 'shadow-orange-500/30',
          gradientFrom: 'from-orange-500',
          gradientTo: 'to-yellow-500',
        };
    }
  };

  const config = getRarityConfig(rarity);

  return (
    <div className={`relative ${className}`}>
      {/* Gradient border effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${
          config.gradientTo
        } rounded-lg ${showGlow ? `shadow-lg ${config.glowColor}` : ''}`}
      ></div>

      {/* Inner content */}
      <div className="relative bg-gray-900 rounded-lg m-[2px]">
        {/* Shimmer effect for legendary items */}
        {showShimmer && rarity === 'Legendary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer rounded-lg"></div>
        )}
        {children}
      </div>
    </div>
  );
}

// Rarity glow effect component for hovering/selection
type RarityGlowProps = {
  rarity: Rarity;
  intensity?: 'low' | 'medium' | 'high';
};

export function RarityGlow({ rarity, intensity = 'medium' }: RarityGlowProps) {
  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'Common':
        return 'rgba(107, 114, 128, 0.3)';
      case 'Uncommon':
        return 'rgba(34, 197, 94, 0.3)';
      case 'Rare':
        return 'rgba(59, 130, 246, 0.3)';
      case 'Epic':
        return 'rgba(168, 85, 247, 0.3)';
      case 'Legendary':
        return 'rgba(249, 115, 22, 0.3)';
    }
  };

  const getBlurAmount = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return '20px';
      case 'medium':
        return '40px';
      case 'high':
        return '60px';
      default:
        return '40px';
    }
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none rounded-lg"
      style={{
        boxShadow: `0 0 ${getBlurAmount(intensity)} ${getRarityColor(rarity)}`,
      }}
    ></div>
  );
}
