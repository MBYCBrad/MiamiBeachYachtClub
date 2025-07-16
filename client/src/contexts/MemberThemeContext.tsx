import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface MemberTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  border: string;
  gradientFrom: string;
  gradientTo: string;
}

export const memberThemes: MemberTheme[] = [
  {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: '#3B82F6', // blue-500
    secondary: '#1E40AF', // blue-800
    accent: '#60A5FA', // blue-400
    background: '#0F172A', // slate-900
    card: '#1E293B', // slate-800
    text: '#F1F5F9', // slate-100
    border: '#334155', // slate-700
    gradientFrom: '#8B5CF6', // purple-500
    gradientTo: '#3B82F6', // blue-500
  },
  {
    id: 'emerald',
    name: 'Emerald Seas',
    primary: '#10B981', // emerald-500
    secondary: '#047857', // emerald-800
    accent: '#34D399', // emerald-400
    background: '#064E3B', // emerald-950
    card: '#065F46', // emerald-900
    text: '#D1FAE5', // emerald-100
    border: '#047857', // emerald-800
    gradientFrom: '#10B981', // emerald-500
    gradientTo: '#14B8A6', // teal-500
  },
  {
    id: 'sunset',
    name: 'Sunset Cruise',
    primary: '#F97316', // orange-500
    secondary: '#C2410C', // orange-800
    accent: '#FB923C', // orange-400
    background: '#431407', // orange-950
    card: '#7C2D12', // orange-900
    text: '#FED7AA', // orange-100
    border: '#9A3412', // orange-800
    gradientFrom: '#F97316', // orange-500
    gradientTo: '#EF4444', // red-500
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    primary: '#8B5CF6', // purple-500
    secondary: '#5B21B6', // purple-800
    accent: '#A78BFA', // purple-400
    background: '#1E1B4B', // indigo-950
    card: '#312E81', // indigo-900
    text: '#E0E7FF', // indigo-100
    border: '#4338CA', // indigo-700
    gradientFrom: '#8B5CF6', // purple-500
    gradientTo: '#EC4899', // pink-500
  },
  {
    id: 'gold',
    name: 'Golden Hour',
    primary: '#F59E0B', // amber-500
    secondary: '#B45309', // amber-800
    accent: '#FCD34D', // amber-300
    background: '#451A03', // amber-950
    card: '#78350F', // amber-900
    text: '#FEF3C7', // amber-100
    border: '#92400E', // amber-800
    gradientFrom: '#F59E0B', // amber-500
    gradientTo: '#EAB308', // yellow-500
  },
];

interface MemberThemeContextType {
  currentTheme: MemberTheme;
  setTheme: (themeId: string) => void;
  isCustomizing: boolean;
  setIsCustomizing: (value: boolean) => void;
  customTheme: MemberTheme | null;
  updateCustomTheme: (updates: Partial<MemberTheme>) => void;
  saveCustomTheme: () => Promise<void>;
}

const MemberThemeContext = createContext<MemberThemeContextType | undefined>(undefined);

export const useMemberTheme = () => {
  const context = useContext(MemberThemeContext);
  if (!context) {
    throw new Error('useMemberTheme must be used within MemberThemeProvider');
  }
  return context;
};

export const MemberThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTheme, setCurrentTheme] = useState<MemberTheme>(memberThemes[0]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customTheme, setCustomTheme] = useState<MemberTheme | null>(null);

  // Load user's theme preference from database
  useEffect(() => {
    if (user?.themePreference) {
      const savedTheme = memberThemes.find(t => t.id === user.themePreference);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      } else if (user.customTheme) {
        // Load custom theme from user data
        setCurrentTheme(user.customTheme);
        setCustomTheme(user.customTheme);
      }
    }
  }, [user]);

  // Apply theme CSS variables to member components
  useEffect(() => {
    if (!currentTheme) return;

    // Only apply to member-specific elements
    const root = document.documentElement;
    const memberRoot = document.querySelector('.member-experience-container');
    
    if (memberRoot) {
      // Apply CSS variables to member container
      memberRoot.setAttribute('style', `
        --member-primary: ${currentTheme.primary};
        --member-secondary: ${currentTheme.secondary};
        --member-accent: ${currentTheme.accent};
        --member-background: ${currentTheme.background};
        --member-card: ${currentTheme.card};
        --member-text: ${currentTheme.text};
        --member-border: ${currentTheme.border};
        --member-gradient-from: ${currentTheme.gradientFrom};
        --member-gradient-to: ${currentTheme.gradientTo};
      `);
    }
  }, [currentTheme]);

  const setTheme = async (themeId: string) => {
    const theme = memberThemes.find(t => t.id === themeId);
    if (!theme) return;

    setCurrentTheme(theme);
    setCustomTheme(null);

    // Save to database
    try {
      await apiRequest('PATCH', '/api/profile', {
        themePreference: themeId,
        customTheme: null
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    } catch (error) {
      toast({
        title: "Failed to save theme",
        description: "Your theme preference could not be saved.",
        variant: "destructive"
      });
    }
  };

  const updateCustomTheme = (updates: Partial<MemberTheme>) => {
    if (!customTheme) {
      // Start with current theme as base
      setCustomTheme({ ...currentTheme, id: 'custom', name: 'Custom Theme', ...updates });
    } else {
      setCustomTheme({ ...customTheme, ...updates });
    }
  };

  const saveCustomTheme = async () => {
    if (!customTheme) return;

    setCurrentTheme(customTheme);
    setIsCustomizing(false);

    try {
      await apiRequest('PATCH', '/api/profile', {
        themePreference: 'custom',
        customTheme: customTheme
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Theme saved",
        description: "Your custom theme has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save theme",
        description: "Your custom theme could not be saved.",
        variant: "destructive"
      });
    }
  };

  return (
    <MemberThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        isCustomizing,
        setIsCustomizing,
        customTheme,
        updateCustomTheme,
        saveCustomTheme,
      }}
    >
      {children}
    </MemberThemeContext.Provider>
  );
};