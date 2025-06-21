interface BottomNavigationProps {
  activeTab: 'bookings' | 'services' | 'experiences';
  onTabChange: (tab: 'bookings' | 'services' | 'experiences') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: 'fas fa-anchor',
      isNew: false
    },
    {
      id: 'services' as const,
      label: 'Services',
      icon: 'fas fa-concierge-bell',
      isNew: true
    },
    {
      id: 'experiences' as const,
      label: 'Experiences',
      icon: 'fas fa-glass-cheers',
      isNew: true
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-purple-800/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-purple-600/20'
                  : 'hover:bg-gray-800/50'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center relative">
                <i className={`${tab.icon} ${
                  activeTab === tab.id 
                    ? 'text-purple-400' 
                    : 'text-gray-400'
                }`}></i>
                {tab.isNew && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <span className={`text-xs font-medium ${
                activeTab === tab.id 
                  ? 'text-purple-400' 
                  : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
              {tab.isNew && (
                <div className="absolute top-1 right-3 px-1 py-0.5 bg-red-500 rounded-full text-xs text-white font-bold">
                  NEW
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
