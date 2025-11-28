import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import MatrixRain from '@/components/MatrixRain';
import GlitchText from '@/components/GlitchText';
import { Zap, Palette, Music, Link as LinkIcon, Eye, Shield } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <MatrixRain />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold">
                <GlitchText text="raid.hs.vc" className="text-primary" />
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-mono">
                // your links, your way
              </p>
              <p className="text-foreground/80 max-w-2xl mx-auto font-mono text-sm md:text-base">
                Create a cyberpunk link-in-bio page with full customization. Change backgrounds, colors, fonts, add music - make it uniquely yours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 box-glow">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/30 hover:border-primary text-lg px-8 py-6"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>

            <div className="pt-8">
              <img
                src={heroBanner}
                alt="Hero Banner"
                className="rounded-lg border-2 border-primary/30 shadow-2xl box-glow-purple"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-mono">
                Features
              </h2>
              <p className="text-muted-foreground font-mono">
                // everything you need to stand out
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <Palette className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Full Customization</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Customize colors, fonts, backgrounds - make your page truly unique
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <LinkIcon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Unlimited Links</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Add as many links as you want to all your social profiles and content
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <Music className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Music Integration</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Embed your favorite Spotify playlists to share your vibe
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <Eye className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Live Preview</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  See changes in real-time as you customize your page
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Secure & Fast</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Built with modern tech for speed and security
                </p>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6 hover:border-primary/60 transition-all">
                <Zap className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2 font-mono">Instant Setup</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Get your page live in minutes, no technical skills required
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-mono">
                <GlitchText text="Ready to stand out?" className="text-primary" />
              </h2>
              <p className="text-muted-foreground mb-8 font-mono">
                // join the cyberpunk revolution
              </p>
              <Link to="/auth">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 box-glow">
                  Create Your Page Now
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-primary/20">
          <p className="text-muted-foreground text-sm font-mono">
            © {new Date().getFullYear()} raid.hs.vc // all rights reserved
          </p>
        </footer>
      </div>

      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 via-transparent to-transparent pointer-events-none blur-3xl" />
    </div>
  );
};

export default Landing;
