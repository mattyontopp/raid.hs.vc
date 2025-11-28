import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SocialLinkProps {
  icon: LucideIcon;
  label: string;
  href: string;
  username?: string;
}

const SocialLink = ({ icon: Icon, label, href, username }: SocialLinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/60 hover:bg-card/70 transition-all duration-300 p-4 hover:scale-105 hover:box-glow">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {label}
            </p>
            {username && (
              <p className="text-sm text-muted-foreground">{username}</p>
            )}
          </div>
          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </div>
        </div>
      </Card>
    </a>
  );
};

export default SocialLink;
