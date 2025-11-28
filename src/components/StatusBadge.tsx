import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'online' | 'busy' | 'offline';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    online: {
      color: 'bg-green-500',
      text: 'online',
      pulse: true,
    },
    busy: {
      color: 'bg-yellow-500',
      text: 'busy',
      pulse: false,
    },
    offline: {
      color: 'bg-gray-500',
      text: 'offline',
      pulse: false,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className="border-primary/30 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          {config.pulse && (
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`} />
          )}
        </div>
        <span className="text-xs font-mono">{config.text}</span>
      </div>
    </Badge>
  );
};

export default StatusBadge;
