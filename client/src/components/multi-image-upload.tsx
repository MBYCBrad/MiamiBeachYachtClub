import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MultiImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  currentImages?: string[];
  label?: string;
  maxImages?: number;
}

export function MultiImageUpload({ 
  onImagesUploaded, 
  currentImages = [], 
  label = "Images", 
  maxImages = 10 
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(currentImages);

  // Update images when currentImages prop changes
  useEffect(() => {
    setImages(currentImages);
  }, [currentImages]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast({
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const newImages = [...images, ...result.imageUrls];
      
      setImages(newImages);
      onImagesUploaded(newImages);

      toast({
        title: "Upload successful",
        description: `${result.count} image(s) uploaded`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const triggerFileInput = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('Triggering file input...', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUploadAreaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && images.length < maxImages) {
      console.log('Upload area clicked, triggering file input...');
      triggerFileInput();
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-purple-400 bg-purple-400/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <>
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              <p className="text-sm text-gray-400">Uploading images...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-300">
                Drop images here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                {images.length}/{maxImages} images • Max 10MB per image
              </p>
            </>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading || images.length >= maxImages}
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((imageUrl, index) => (
              <motion.div
                key={`${imageUrl}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800"
              >
                <img
                  src={imageUrl.startsWith('/api/media/') ? imageUrl : `/api/media/${imageUrl}`}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/yacht-placeholder.jpg';
                  }}
                />
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Primary badge for first image */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add more button */}
          {images.length < maxImages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={triggerFileInput}
              disabled={uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 flex flex-col items-center justify-center space-y-2 text-gray-400 hover:text-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">Add More</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}