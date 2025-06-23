import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  label = "Upload Image",
  accept = "image/*"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/yacht-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onImageUploaded(result.imageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      setPreviewUrl(currentImageUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className="text-gray-300">{label}</Label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 bg-gray-800/50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={previewUrl.startsWith('/api/media/') ? previewUrl : previewUrl}
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Image uploaded</p>
                <p className="text-gray-400 text-xs">Click to change image</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleButtonClick}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 bg-black/50 hover:bg-black/70 transition-opacity"
          >
            {uploading ? "Uploading..." : "Change Image"}
          </Button>
        </div>
      ) : (
        <div 
          onClick={handleButtonClick}
          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors bg-gray-800/30 hover:bg-gray-800/50"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 rounded-full bg-gray-700">
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
              ) : (
                <Upload className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">
                {uploading ? "Uploading..." : "Upload yacht image"}
              </p>
              <p className="text-gray-400 text-sm">
                Click to select or drag and drop
              </p>
              <p className="text-gray-500 text-xs mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}