import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { memberThemes, useMemberTheme } from '@/contexts/MemberThemeContext';
import { Check, Palette, Settings, Sparkles, X } from 'lucide-react';

interface MemberThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MemberThemeModal: React.FC<MemberThemeModalProps> = ({ open, onOpenChange }) => {
  const { currentTheme, setTheme, isCustomizing, setIsCustomizing, customTheme, updateCustomTheme, saveCustomTheme } = useMemberTheme();
  const [activeTab, setActiveTab] = useState('presets');
  const [tempCustomTheme, setTempCustomTheme] = useState(customTheme || currentTheme);

  const handleColorChange = (field: keyof typeof tempCustomTheme, value: string) => {
    setTempCustomTheme(prev => ({ ...prev!, [field]: value }));
    updateCustomTheme({ [field]: value });
  };

  const handleSaveCustomTheme = async () => {
    await saveCustomTheme();
    onOpenChange(false);
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="member-theme-modal bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Palette className="h-6 w-6 text-purple-400" />
            Theme & UI Customization
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a preset theme or create your own custom look
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="presets" className="data-[state=active]:bg-purple-600">
              <Sparkles className="h-4 w-4 mr-2" />
              Preset Themes
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-purple-600">
              <Settings className="h-4 w-4 mr-2" />
              Custom Theme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-6">
            <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {memberThemes.map((theme) => (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer border-2 transition-all duration-300 ${
                      currentTheme.id === theme.id 
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white">{theme.name}</h3>
                        {currentTheme.id === theme.id && (
                          <div className="p-1 bg-purple-600 rounded-full">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Theme Preview */}
                      <div 
                        className="rounded-lg p-3 space-y-2"
                        style={{ backgroundColor: theme.background }}
                      >
                        <div 
                          className="h-20 rounded-md flex items-center justify-center text-sm font-medium"
                          style={{ 
                            background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
                            color: theme.text 
                          }}
                        >
                          Preview
                        </div>
                        <div className="flex gap-2">
                          <div 
                            className="h-8 flex-1 rounded"
                            style={{ backgroundColor: theme.card, border: `1px solid ${theme.border}` }}
                          />
                          <div 
                            className="h-8 w-8 rounded"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <div 
                            className="h-8 w-8 rounded"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {/* Live Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Live Preview</h3>
                <div 
                  className="rounded-lg p-4 space-y-3"
                  style={{ backgroundColor: tempCustomTheme.background }}
                >
                  <div 
                    className="h-24 rounded-md flex items-center justify-center text-lg font-bold"
                    style={{ 
                      background: `linear-gradient(135deg, ${tempCustomTheme.gradientFrom}, ${tempCustomTheme.gradientTo})`,
                      color: tempCustomTheme.text 
                    }}
                  >
                    Your Custom Theme
                  </div>
                  <div className="flex gap-3">
                    <div 
                      className="flex-1 p-3 rounded"
                      style={{ 
                        backgroundColor: tempCustomTheme.card, 
                        border: `1px solid ${tempCustomTheme.border}`,
                        color: tempCustomTheme.text
                      }}
                    >
                      Card Component
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="h-10 w-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: tempCustomTheme.primary }}
                      >
                        P
                      </div>
                      <div 
                        className="h-10 w-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: tempCustomTheme.accent }}
                      >
                        A
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Background Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.background}
                      onChange={(e) => handleColorChange('background', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Card Background</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.card}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.card}
                      onChange={(e) => handleColorChange('card', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Text Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.text}
                      onChange={(e) => handleColorChange('text', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Border Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.border}
                      onChange={(e) => handleColorChange('border', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.border}
                      onChange={(e) => handleColorChange('border', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Gradient Start</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.gradientFrom}
                      onChange={(e) => handleColorChange('gradientFrom', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.gradientFrom}
                      onChange={(e) => handleColorChange('gradientFrom', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 text-sm">Gradient End</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={tempCustomTheme.gradientTo}
                      onChange={(e) => handleColorChange('gradientTo', e.target.value)}
                      className="h-10 w-20 p-1 bg-gray-800 border-gray-700"
                    />
                    <Input
                      type="text"
                      value={tempCustomTheme.gradientTo}
                      onChange={(e) => handleColorChange('gradientTo', e.target.value)}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveCustomTheme}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save Custom Theme
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTempCustomTheme(currentTheme);
                    setActiveTab('presets');
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Reset
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};