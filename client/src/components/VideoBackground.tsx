import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoBackgroundProps {
  className?: string;
  showControls?: boolean;
  overlay?: boolean;
}

// Premium yacht video URL - using high quality yacht footage
const YACHT_VIDEO_URL = "https://player.vimeo.com/external/451878268.hd.mp4?s=ea6d8a05c6ad9c53d41cfbc74b2a7f45bd0f9d46&profile_id=175";

export default function VideoBackground({ 
  className = "absolute inset-0 w-full h-full object-cover", 
  showControls = true,
  overlay = true 
}: VideoBackgroundProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <>
      <video
        className={className}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        poster="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&h=1080&fit=crop"
      >
        <source src={YACHT_VIDEO_URL} type="video/mp4" />
        <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
        <source src="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4" type="video/mp4" />
      </video>
      
      {/* Fallback image for browsers that don't support video */}
      <div 
        className={`${className} ${!isPlaying ? 'block' : 'hidden'}`}
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=1920&h=1080&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Gradient Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/80" />
      )}
      
      {/* Video Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full p-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 rounded-full p-2"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  );
}