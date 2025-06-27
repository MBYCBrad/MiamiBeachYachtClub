import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function VideoCTA() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative py-32 overflow-hidden">
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
      
      {/* Gradient Overlay - blur on top, sharp edge on bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2
          className="text-4xl md:text-6xl font-bold text-white mb-8"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Join Miami Beach Yacht Club today and experience luxury yachting like never before.
        </p>
        <Link href="/apply">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            Apply for Membership
          </Button>
        </Link>
      </div>
    </section>
  );
}