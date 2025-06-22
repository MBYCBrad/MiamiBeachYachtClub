import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users, Anchor, MapPin, Star } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import type { Yacht } from "@shared/schema";

const TIME_SLOTS = [
  "08:00", "12:00", "16:00", "20:00"
];

const MEMBERSHIP_TIERS = {
  bronze: { maxSize: 40, name: "Bronze" },
  silver: { maxSize: 55, name: "Silver" },
  gold: { maxSize: 70, name: "Gold" },
  platinum: { maxSize: 999, name: "Platinum" }
};

export default function YachtSearch() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  const { data: yachts, isLoading } = useQuery<Yacht[]>({
    queryKey: ["/api/yachts"],
  });

  const userTier = user?.membershipTier || 'bronze';
  const maxSize = MEMBERSHIP_TIERS[userTier as keyof typeof MEMBERSHIP_TIERS]?.maxSize || 40;

  const filteredYachts = yachts?.filter(yacht => yacht.size <= maxSize) || [];

  const handleSearch = () => {
    if (selectedDate && selectedTime) {
      setShowResults(true);
    }
  };

  const handleBookYacht = (yacht: Yacht) => {
    const searchParams = new URLSearchParams({
      date: selectedDate?.toISOString() || '',
      time: selectedTime,
      duration: '4'
    });
    setLocation(`/yacht/${yacht.id}?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-gray-800"
      >
        <div className="flex items-center gap-4">
          <Link href="/member">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Search Yachts</h1>
            <p className="text-gray-400">Find available yachts for your perfect day</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
          {MEMBERSHIP_TIERS[userTier as keyof typeof MEMBERSHIP_TIERS]?.name} Member
        </Badge>
      </motion.div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6"
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 hover:bg-gray-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Select Time (4-hour slots)</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time} className="text-white hover:bg-gray-800">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time} - {String(parseInt(time.split(':')[0]) + 4).padStart(2, '0')}:00
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Find Available</label>
                <Button 
                  onClick={handleSearch}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Anchor className="mr-2 h-4 w-4" />
                  Search Yachts
                </Button>
              </div>
            </div>

            {selectedDate && selectedTime && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-300">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Searching for yachts on {format(selectedDate, "MMMM d, yyyy")} from {selectedTime} - {String(parseInt(selectedTime.split(':')[0]) + 4).padStart(2, '0')}:00
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Results */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-6"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold">Available Yachts</h2>
            <p className="text-gray-400">
              {filteredYachts.length} yacht{filteredYachts.length !== 1 ? 's' : ''} available for your {MEMBERSHIP_TIERS[userTier as keyof typeof MEMBERSHIP_TIERS]?.name} membership
            </p>
          </div>

          <Separator className="mb-6 bg-gray-800" />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-32 bg-gray-800 rounded mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredYachts.map((yacht) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={yacht.imageUrl ? `/api/media/${yacht.imageUrl}` : '/api/media/default-yacht.jpg'}
                        alt={yacht.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500/90 text-white">Available</Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-purple-300 transition-colors">
                            {yacht.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin className="h-4 w-4" />
                            {yacht.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">4.9</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="h-4 w-4" />
                          <span>{yacht.capacity} guests</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Anchor className="h-4 w-4" />
                          <span>{yacht.size}ft</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-purple-300">FREE</p>
                          <p className="text-xs text-gray-400">4-hour experience</p>
                        </div>
                        <Button 
                          onClick={() => handleBookYacht(yacht)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {filteredYachts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Anchor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">No yachts available</h3>
              <p className="text-gray-500">Try selecting a different date or time slot</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}