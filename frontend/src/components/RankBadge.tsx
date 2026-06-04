import { RankTier } from '../lib/rankingSystem';

interface RankBadgeProps {
  rank: RankTier;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
  showLabel?: boolean;
}

export function RankBadge({ rank, size = 'medium', showProgress = false, progress = 0, showLabel = true }: RankBadgeProps) {
  const sizeClasses = {
    small: {
      container: 'w-12 h-12',
      icon: 'text-xl',
      text: 'text-xs'
    },
    medium: {
      container: 'w-16 h-16',
      icon: 'text-3xl',
      text: 'text-sm'
    },
    large: {
      container: 'w-24 h-24',
      icon: 'text-5xl',
      text: 'text-base'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div className={`${sizes.container} rounded-full bg-gradient-to-br ${rank.gradient} flex items-center justify-center shadow-lg border-4 border-white`}>
          <span className={sizes.icon}>{rank.icon}</span>
        </div>
        {showProgress && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full">
            <div className="bg-gray-200 rounded-full h-1.5 w-full">
              <div 
                className={`bg-gradient-to-r ${rank.gradient} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      {showLabel && (
        <div className="text-center">
          <p className={`font-semibold text-gray-900 ${sizes.text}`}>
            {rank.name}
          </p>
        </div>
      )}
    </div>
  );
}
