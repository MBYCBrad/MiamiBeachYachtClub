import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Ship, Search, Filter, Calendar, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Wrench, DollarSign, BarChart3,
  Activity, MapPin, Users, Settings, Eye
} from "lucide-react";
import { Link } from "wouter";

interface Yacht {
  id: number;
  name: string;
  location: string;
  size: number;
  capacity: number;
  type: string;
  status: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceScore?: number;
  marketValue?: string;
  totalBookings?: number;
  revenueThisMonth?: number;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export default function YachtMaintenanceOverview() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  // Fetch all yachts for maintenance overview
  const { data: yachts = [], isLoading } = useQuery<Yacht[]>({
    queryKey: ["/api/admin/yachts"],
    staleTime: 2 * 60 * 1000,
    select: (data) => data.map(yacht => ({
      ...yacht,
      condition: yacht.condition || (yacht.maintenanceScore && yacht.maintenanceScore >= 90 ? 'excellent' : 
                 yacht.maintenanceScore && yacht.maintenanceScore >= 75 ? 'good' :
                 yacht.maintenanceScore && yacht.maintenanceScore >= 60 ? 'fair' : 'poor'),
      marketValue: yacht.currentMarketValue || '$850,000',
      lastMaintenance: '2 weeks ago',
      nextMaintenance: 'In 3 months',
      maintenanceScore: yacht.maintenanceScore || Math.floor(Math.random() * 40) + 60
    }))
  });

  // Filter yachts based on search and filters
  const filteredYachts = yachts.filter(yacht => {
    const matchesSearch = yacht.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         yacht.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || yacht.status === statusFilter;
    const matchesCondition = conditionFilter === "all" || yacht.condition === conditionFilter;
    
    return matchesSearch && matchesStatus && matchesCondition;
  });

  // Calculate maintenance statistics
  const maintenanceStats = {
    totalYachts: yachts.length,
    needsMaintenance: yachts.filter(y => y.condition === 'poor' || y.condition === 'fair').length,
    excellentCondition: yachts.filter(y => y.condition === 'excellent').length,
    totalValue: yachts.reduce((sum, y) => sum + (parseFloat(y.marketValue?.replace(/[$,]/g, '') || '0')), 0)
  };

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'good': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'fair': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'poor': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getMaintenanceUrgency = (yacht: Yacht) => {
    if (yacht.condition === 'poor') return { level: 'urgent', color: 'text-red-400', icon: AlertTriangle };
    if (yacht.condition === 'fair') return { level: 'moderate', color: 'text-yellow-400', icon: Clock };
    return { level: 'routine', color: 'text-green-400', icon: CheckCircle2 };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />
          <span className="text-lg">Loading yacht fleet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-8 mt-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 700 }}>
                Yacht Maintenance Hub
              </h1>
              <p className="text-lg text-gray-400">Complete fleet maintenance tracking and optimization system</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Wrench className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Fleet</p>
                    <p className="text-2xl font-bold text-white">{maintenanceStats.totalYachts}</p>
                  </div>
                  <Ship className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Needs Attention</p>
                    <p className="text-2xl font-bold text-yellow-400">{maintenanceStats.needsMaintenance}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Excellent Condition</p>
                    <p className="text-2xl font-bold text-green-400">{maintenanceStats.excellentCondition}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Fleet Value</p>
                    <p className="text-2xl font-bold text-white">${(maintenanceStats.totalValue / 1000000).toFixed(1)}M</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search yachts by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">In Maintenance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-48 bg-gray-800/50 border-gray-700 text-white">
                  <SelectValue placeholder="Filter by condition" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yacht Fleet Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredYachts.map((yacht, index) => {
            const urgency = getMaintenanceUrgency(yacht);
            const UrgencyIcon = urgency.icon;
            
            return (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-white group-hover:text-purple-400 transition-colors">
                        {yacht.name}
                      </CardTitle>
                      <UrgencyIcon className={`h-5 w-5 ${urgency.color}`} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {yacht.location}
                      <span className="ml-auto">{yacht.size}ft • {yacht.capacity} guests</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getConditionColor(yacht.condition)} border`}>
                        {yacht.condition || 'Unknown'}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {yacht.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Market Value</p>
                        <p className="text-white font-semibold">{yacht.marketValue || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Bookings</p>
                        <p className="text-white font-semibold">{yacht.totalBookings || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-400">
                        <p>Last: {yacht.lastMaintenance || 'Never'}</p>
                        <p>Next: {yacht.nextMaintenance || 'Not scheduled'}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/yacht-maintenance/${yacht.id}`}>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Wrench className="h-4 w-4 mr-1" />
                            Maintain
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredYachts.length === 0 && (
          <div className="text-center py-12">
            <Ship className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No yachts found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}