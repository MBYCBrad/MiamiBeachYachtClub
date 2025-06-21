import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchFilters() {
  const [filters, setFilters] = useState({
    departureDate: '',
    returnDate: '',
    yachtSize: '',
    location: ''
  });

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search filters:', filters);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 mb-12">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-purple-800/30 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Label className="block text-sm font-medium text-gray-200 mb-2">Departure Date</Label>
            <Input 
              type="date" 
              value={filters.departureDate}
              onChange={(e) => setFilters({...filters, departureDate: e.target.value})}
              className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-3 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-300"
            />
          </div>
          <div className="relative">
            <Label className="block text-sm font-medium text-gray-200 mb-2">Return Date</Label>
            <Input 
              type="date" 
              value={filters.returnDate}
              onChange={(e) => setFilters({...filters, returnDate: e.target.value})}
              className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-3 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-300"
            />
          </div>
          <div className="relative">
            <Label className="block text-sm font-medium text-gray-200 mb-2">Yacht Size</Label>
            <Select value={filters.yachtSize} onValueChange={(value) => setFilters({...filters, yachtSize: value})}>
              <SelectTrigger className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg px-4 py-3 text-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-300">
                <SelectValue placeholder="Any Size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="any">Any Size</SelectItem>
                <SelectItem value="40-50">40-50 ft</SelectItem>
                <SelectItem value="50-70">50-70 ft</SelectItem>
                <SelectItem value="70+">70+ ft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-search mr-2"></i>Search Yachts
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
