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
      
      {/* Gradient blur from black at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent" />
    </section>
  );
}