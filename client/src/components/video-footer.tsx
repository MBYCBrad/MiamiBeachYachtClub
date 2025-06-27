import { useQuery } from "@tanstack/react-query";

export function VideoFooter() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
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
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Enhanced gradient blur from black at top - stronger blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-transparent" />
      
      {/* Additional top blur for seamless blend */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
      
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
    </section>
  );
}