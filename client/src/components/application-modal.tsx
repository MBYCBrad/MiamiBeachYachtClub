import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, X, Crown, Star, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

// Membership Tiers Data (matching actual website packages)
const membershipTiers = [
  {
    name: "gold",
    title: "Gold Membership",
    icon: <Crown className="w-6 h-6" />,
    price: "$5,000/month + $25,000 One Time Member Ownership Fee",
    yachtSize: "Up to 70ft",
    features: ["Unlimited reservations 4 Bookings at a time", "2 on weekdays and 2 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-yellow-400 to-yellow-500"
  },
  {
    name: "platinum",
    title: "Platinum Membership",
    icon: <Star className="w-6 h-6" />,
    price: "$7,500/month + $50,000 One Time Member Ownership Fee",
    yachtSize: "Up to 80ft",
    features: ["Unlimited reservations 6 Bookings at a time", "3 on weekdays and 3 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-gray-300 to-gray-400"
  },
  {
    name: "diamond",
    title: "Diamond Membership",
    icon: <Sparkles className="w-6 h-6" />,
    price: "$10,000/month + $100,000 One Time Member Ownership Fee",
    yachtSize: "Up to 100ft",
    features: ["Unlimited reservations 6 Bookings at a time", "3 on weekdays and 3 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-blue-400 to-purple-500"
  }
];

// Package Types Data
const packageTypes = [
  {
    name: "full",
    title: "Full Membership",
    description: "Complete access to all yacht club amenities and services",
    features: ["All yacht access", "Premium concierge services", "Member events", "Guest privileges"]
  },
  {
    name: "mariners",
    title: "Mariner's Membership",
    description: "À la carte access for specific yacht experiences",
    features: ["Pay-per-use yacht access", "Basic concierge services", "Select member events", "Limited guest privileges"]
  }
];

export function ApplicationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    
    // Financial Information
    annualIncome: "",
    netWorth: "",
    liquidAssets: "",
    employmentStatus: "",
    employer: "",
    occupation: "",
    
    // Yacht Experience
    yachtingExperience: "",
    currentBoats: "",
    preferredYachtSize: "",
    intendedUsage: "",
    
    // Membership & Preferences
    membershipTier: "",
    membershipPackage: "", // regular or mariners
    referralSource: "",
    specialRequests: "",
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      console.log('Form data before mapping:', data);
      
      // Map frontend form data to backend schema
      const [firstName, ...lastNameParts] = (data.fullName || '').split(' ');
      const lastName = lastNameParts.join(' ') || 'Unknown';
      
      const backendData = {
        // Step 1: Personal Information  
        firstName: firstName || 'Unknown',
        lastName: lastName || 'Unknown',
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '1990-01-01',
        address: data.address || 'N/A',
        city: data.city || 'Miami',
        state: data.state || 'Florida',
        zipCode: data.zipCode || '33139',
        country: data.country || 'United States',
        occupation: data.occupation || 'Professional',
        employer: data.employer || 'N/A',
        
        // Step 2: Membership Package Selection
        membershipTier: data.membershipTier || 'gold',
        membershipPackage: data.membershipPackage || 'full',
        preferredLocation: 'Miami Beach',
        expectedUsageFrequency: data.intendedUsage || 'weekly',
        primaryUseCase: data.intendedUsage || 'recreation',
        groupSize: data.preferredYachtSize || 'medium',
        
        // Step 3: Financial Information
        annualIncome: data.annualIncome || '100k-250k',
        netWorth: data.netWorth || '1m-5m',
        liquidAssets: data.liquidAssets || data.netWorth || '500k-1m',
        creditScore: '750+',
        bankName: 'Chase Bank',
        hasBoatingExperience: data.yachtingExperience !== 'beginner',
        boatingExperienceYears: data.yachtingExperience === 'expert' ? 10 : data.yachtingExperience === 'advanced' ? 7 : data.yachtingExperience === 'intermediate' ? 3 : 1,
        boatingLicenseNumber: 'FL-123456',
        
        // Step 4: References and Final Details
        referenceSource: data.referralSource || 'website',
        referralName: 'Online Application',
        preferredStartDate: new Date().toISOString().split('T')[0],
        specialRequests: data.specialRequests || '',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '555-0123',
        emergencyContactRelation: 'Family',
        agreeToTerms: data.agreeToTerms || false,
        agreeToBackground: data.agreeToPrivacy || false,
        marketingOptIn: true
      };
      
      console.log('Backend data being sent:', backendData);
      return apiRequest('POST', '/api/applications', backendData);
    },
    onSuccess: () => {
      // Invalidate queries for real-time admin synchronization
      queryClient.invalidateQueries({ queryKey: ['/api/admin/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      
      toast({
        title: "Application Submitted Successfully!",
        description: "Thank you for your interest in Miami Beach Yacht Club. We'll review your application and contact you within 48 hours.",
      });
      onClose();
      setCurrentStep(1);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        annualIncome: "",
        netWorth: "",
        liquidAssets: "",
        employmentStatus: "",
        employer: "",
        occupation: "",
        yachtingExperience: "",
        currentBoats: "",
        preferredYachtSize: "",
        intendedUsage: "",
        membershipTier: "",
        membershipPackage: "",
        referralSource: "",
        specialRequests: "",
        agreeToTerms: false,
        agreeToPrivacy: false
      });
    },
    onError: (error) => {
      console.error('Application submission error:', error);
      toast({
        title: "Application Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and privacy policy to proceed.",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(formData);
  };

  const updateFormData = (field: string, value: any) => {
    console.log('updateFormData called:', field, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-950 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Membership Application</h2>
            <p className="text-gray-400 mt-2">Step {currentStep} of 4</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="relative flex items-center justify-between mb-4">
            {/* Continuous connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-700 -translate-y-1/2 z-0" />
            <div className={`absolute top-1/2 left-4 h-1 -translate-y-1/2 z-0 transition-all duration-300 rounded ${
              currentStep >= 2 ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-700'
            }`} style={{ width: currentStep > 1 ? `calc(${((currentStep - 1) / 3) * 100}% - 1rem)` : '0%' }} />
            
            {/* Step indicators */}
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Personal Info</span>
            <span>Financial Info</span>
            <span>Yacht Experience</span>
            <span>Review & Submit</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-white">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth" className="text-white">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-white">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city" className="text-white">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-white">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-white">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Financial Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="annualIncome" className="text-white">Annual Income *</Label>
                  <Select onValueChange={(value) => updateFormData('annualIncome', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select income range" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="100k-250k">$100,000 - $250,000</SelectItem>
                      <SelectItem value="250k-500k">$250,000 - $500,000</SelectItem>
                      <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                      <SelectItem value="5m+">$5,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="netWorth" className="text-white">Net Worth *</Label>
                  <Select onValueChange={(value) => updateFormData('netWorth', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select net worth range" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                      <SelectItem value="1m-5m">$1,000,000 - $5,000,000</SelectItem>
                      <SelectItem value="5m-10m">$5,000,000 - $10,000,000</SelectItem>
                      <SelectItem value="10m-25m">$10,000,000 - $25,000,000</SelectItem>
                      <SelectItem value="25m+">$25,000,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentStatus" className="text-white">Employment Status *</Label>
                  <Select onValueChange={(value) => updateFormData('employmentStatus', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self-employed">Self-Employed</SelectItem>
                      <SelectItem value="business-owner">Business Owner</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="occupation" className="text-white">Occupation *</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation}
                    onChange={(e) => updateFormData('occupation', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Your occupation"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="employer" className="text-white">Employer/Company</Label>
                <Input
                  id="employer"
                  value={formData.employer}
                  onChange={(e) => updateFormData('employer', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Company name"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Yacht Experience & Preferences</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="yachtingExperience" className="text-white">Yachting Experience *</Label>
                  <Select onValueChange={(value) => updateFormData('yachtingExperience', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currentBoats" className="text-white">Current Yachts Owned</Label>
                  <Textarea
                    id="currentBoats"
                    value={formData.currentBoats}
                    onChange={(e) => updateFormData('currentBoats', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Describe any yachts you currently own"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="preferredYachtSize" className="text-white">Preferred Yacht Size *</Label>
                  <Select onValueChange={(value) => updateFormData('preferredYachtSize', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select preferred yacht size" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="small">Small (30-45 ft)</SelectItem>
                      <SelectItem value="medium">Medium (45-65 ft)</SelectItem>
                      <SelectItem value="large">Large (65-85 ft)</SelectItem>
                      <SelectItem value="superyacht">Super Yacht (85+ ft)</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intendedUsage" className="text-white">Intended Usage *</Label>
                  <Select onValueChange={(value) => updateFormData('intendedUsage', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="How do you plan to use the yacht?" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="family-recreation">Family Recreation</SelectItem>
                      <SelectItem value="business-entertainment">Business Entertainment</SelectItem>
                      <SelectItem value="social-events">Social Events</SelectItem>
                      <SelectItem value="fishing">Fishing</SelectItem>
                      <SelectItem value="water-sports">Water Sports</SelectItem>
                      <SelectItem value="relaxation">Relaxation & Leisure</SelectItem>
                      <SelectItem value="all-purposes">All of the Above</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-lg font-semibold mb-4 block">Preferred Membership Tier *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {membershipTiers.map((tier) => (
                      <div
                        key={tier.name}
                        onClick={() => {
                          console.log('Tier clicked:', tier.name);
                          updateFormData('membershipTier', tier.name);
                        }}
                        className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
                          formData.membershipTier === tier.name
                            ? 'border-purple-600 bg-purple-600/10'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                        style={{ zIndex: 10 }}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                            {tier.icon}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{tier.title}</h4>
                            <p className="text-gray-400 text-sm">{tier.yachtSize}</p>
                          </div>
                        </div>
                        <p className="text-purple-400 font-medium mb-3">{tier.price}</p>
                        <ul className="space-y-1">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {formData.membershipTier === tier.name && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-white text-lg font-semibold mb-4 block">Membership Package *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packageTypes.map((pkg) => (
                      <div
                        key={pkg.name}
                        onClick={() => {
                          console.log('Package clicked:', pkg.name);
                          updateFormData('membershipPackage', pkg.name);
                        }}
                        className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
                          formData.membershipPackage === pkg.name
                            ? 'border-purple-600 bg-purple-600/10'
                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                        }`}
                        style={{ zIndex: 10 }}
                      >
                        <h4 className="text-white font-semibold mb-2">{pkg.title}</h4>
                        <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
                        <ul className="space-y-1">
                          {pkg.features.map((feature, idx) => (
                            <li key={idx} className="text-sm text-gray-300 flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {formData.membershipPackage === pkg.name && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Review & Submit</h3>
              
              {/* Personal Information Section */}
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{formData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{formData.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Date of Birth:</span>
                    <span className="text-white ml-2">{formData.dateOfBirth}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-400">Address:</span>
                    <span className="text-white ml-2">{formData.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">City:</span>
                    <span className="text-white ml-2">{formData.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">State:</span>
                    <span className="text-white ml-2">{formData.state}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Zip Code:</span>
                    <span className="text-white ml-2">{formData.zipCode}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Country:</span>
                    <span className="text-white ml-2">{formData.country}</span>
                  </div>
                </div>
              </div>

              {/* Employment & Financial Information */}
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Employment & Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Employment Status:</span>
                    <span className="text-white ml-2 capitalize">{formData.employmentStatus?.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Occupation:</span>
                    <span className="text-white ml-2">{formData.occupation}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Employer:</span>
                    <span className="text-white ml-2">{formData.employer}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Annual Income:</span>
                    <span className="text-white ml-2">{formData.annualIncome}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Net Worth:</span>
                    <span className="text-white ml-2">{formData.netWorth}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Liquid Assets:</span>
                    <span className="text-white ml-2">{formData.liquidAssets}</span>
                  </div>
                </div>
              </div>

              {/* Yacht Experience & Preferences */}
              <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Yacht Experience & Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Yachting Experience:</span>
                    <span className="text-white ml-2 capitalize">{formData.yachtingExperience}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Preferred Yacht Size:</span>
                    <span className="text-white ml-2 capitalize">{formData.preferredYachtSize?.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Intended Usage:</span>
                    <span className="text-white ml-2 capitalize">{formData.intendedUsage?.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Membership Tier:</span>
                    <span className="text-white ml-2 capitalize">{formData.membershipTier}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Package:</span>
                    <span className="text-white ml-2 capitalize">{formData.membershipPackage}</span>
                  </div>
                  {formData.currentBoats && (
                    <div className="md:col-span-2">
                      <span className="text-gray-400">Current Yachts Owned:</span>
                      <span className="text-white ml-2">{formData.currentBoats}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="referralSource" className="text-white">How did you hear about us?</Label>
                <Select value={formData.referralSource} onValueChange={(value) => updateFormData('referralSource', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="referral">Friend Referral</SelectItem>
                    <SelectItem value="advertising">Online Advertising</SelectItem>
                    <SelectItem value="event">Event/Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialRequests" className="text-white">Special Requests or Comments</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests}
                  onChange={(e) => updateFormData('specialRequests', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Any special requests or additional information"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                    className="bg-gray-800 border-gray-600"
                  />
                  <Label htmlFor="agreeToTerms" className="text-white text-sm leading-relaxed">
                    I agree to the <span className="text-purple-400 underline cursor-pointer">Terms of Service</span> and understand the membership requirements and fees.
                  </Label>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={(checked) => updateFormData('agreeToPrivacy', checked)}
                    className="bg-gray-800 border-gray-600"
                  />
                  <Label htmlFor="agreeToPrivacy" className="text-white text-sm leading-relaxed">
                    I agree to the <span className="text-purple-400 underline cursor-pointer">Privacy Policy</span> and consent to the collection and use of my personal information.
                  </Label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}