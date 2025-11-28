import { Github, Twitter, Instagram, Mail, Music2, MessageCircle, Twitch } from 'lucide-react';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import SocialLink from '@/components/SocialLink';
import VisitorCounter from '@/components/VisitorCounter';
import StatusBadge from '@/components/StatusBadge';
import MusicPlayer from '@/components/MusicPlayer';
import avatar from '@/assets/avatar.png';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in">
          
          {/* Header Section */}
          <div className="text-center space-y-6">
            {/* Avatar */}
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/50 animate-float box-glow-purple">
                <img
                  src={avatar}
                  alt="raid avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <StatusBadge status="online" />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl font-bold">
                <GlitchText text="raid" className="text-primary" />
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                @raid.hs.vc
              </p>
            </div>

            {/* Bio */}
            <div className="max-w-md mx-auto">
              <p className="text-foreground/80 text-sm leading-relaxed font-mono">
                <span className="text-primary">{'>'}</span> full-stack developer{' '}
                <span className="text-secondary">|</span> cybersecurity enthusiast{' '}
                <span className="text-secondary">|</span> nocturnal coder
              </p>
              <p className="text-muted-foreground text-xs mt-2 font-mono">
                // building in the digital shadows
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <SocialLink
              icon={Github}
              label="GitHub"
              href="https://github.com"
              username="@raid"
            />
            <SocialLink
              icon={Twitter}
              label="Twitter / X"
              href="https://twitter.com"
              username="@raid"
            />
            <SocialLink
              icon={Instagram}
              label="Instagram"
              href="https://instagram.com"
              username="@raid.hs"
            />
            <SocialLink
              icon={MessageCircle}
              label="Discord"
              href="https://discord.com"
              username="raid#0001"
            />
            <SocialLink
              icon={Twitch}
              label="Twitch"
              href="https://twitch.tv"
              username="raid"
            />
            <SocialLink
              icon={Mail}
              label="Email"
              href="mailto:contact@raid.hs.vc"
              username="contact@raid.hs.vc"
            />
          </div>

          {/* Music Player */}
          <MusicPlayer />

          {/* Footer */}
          <div className="flex items-center justify-between pt-8 border-t border-primary/20">
            <VisitorCounter />
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <span className="text-primary">raid.hs.vc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-secondary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
    </div>
  );
};

export default Index;
