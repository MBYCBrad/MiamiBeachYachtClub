import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface VideoCTAProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  onApplyClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export function VideoCTA({
  title = "Ready to Start Your Journey?",
  description = "Join Miami Beach Yacht Club today and experience luxury yachting like never before.",
  primaryButtonText = "Apply for Membership",
  primaryButtonLink = "/apply",
  onApplyClick,
  secondaryButtonText,
  secondaryButtonLink
}: VideoCTAProps = {}) {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden">
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
      
      {/* Gradient Overlay - blur only on top, clean edge on bottom */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge - Enhanced blur to blend into black background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col justify-center min-h-full">
        <h2
          className="text-4xl md:text-6xl font-bold text-white mb-8"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          {title}
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
            onClick={onApplyClick}
          >
            {primaryButtonText}
          </Button>
          {secondaryButtonText && secondaryButtonLink && (
            <Link href={secondaryButtonLink}>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
              >
                {secondaryButtonText}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}