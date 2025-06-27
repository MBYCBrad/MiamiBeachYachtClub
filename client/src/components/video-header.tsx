import { useQuery } from "@tanstack/react-query";

interface VideoHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function VideoHeader({ title, subtitle, children }: VideoHeaderProps) {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {heroVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
        </video>
      )}
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Gradient blur to black at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
      
      {/* 3D Anamorphic Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge - Deeper for mobile */}
        <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-b from-black/40 to-transparent" />
        
        {/* Bottom Edge - Deeper for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {subtitle}
          </p>
        )}
        
        {children && (
          <div>{children}</div>
        )}
      </div>
    </section>
  );
}