import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { VideoFooter } from "@/components/video-footer";
import { Footer } from "@/components/footer";
import { CheckCircle, Users, Calendar, Ship, Phone, Star, X, Lock, Crown, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const steps = [
  {
    number: "01",
    title: "Apply for Membership",
    description: "Complete our exclusive application process to join Miami Beach Yacht Club. Our team reviews each application to ensure the perfect fit.",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-600 to-purple-700"
  },
  {
    number: "02",
    title: "Select Your Tier",
    description: "Choose from Silver, Gold, or Diamond membership tiers. Each tier offers different yacht access and booking privileges.",
    icon: <Star className="w-8 h-8" />,
    color: "from-purple-700 to-indigo-600"
  },
  {
    number: "03",
    title: "Book Your Experience",
    description: "Use our exclusive booking portal or call our 24/7 concierge. Book up to 12 months in advance with no blackout dates.",
    icon: <Calendar className="w-8 h-8" />,
    color: "from-indigo-600 to-indigo-700"
  },
  {
    number: "04",
    title: "Enjoy Premium Service",
    description: "Arrive at the marina and let our professional crew handle everything. From catering to water sports, we've got you covered.",
    icon: <Ship className="w-8 h-8" />,
    color: "from-indigo-700 to-purple-600"
  }
];

// Membership Tiers Data (matching landing page)
const membershipTiers = [
  {
    name: "bronze",
    title: "Bronze Explorer",
    icon: <Ship className="w-6 h-6" />,
    price: "$2,500/month",
    yachtSize: "Up to 40ft",
    features: ["4 days/month", "Basic concierge", "Standard amenities"],
    color: "from-amber-600 to-amber-700"
  },
  {
    name: "silver",
    title: "Silver Navigator",
    icon: <Sparkles className="w-6 h-6" />,
    price: "$4,500/month",
    yachtSize: "Up to 55ft",
    features: ["8 days/month", "Premium concierge", "Enhanced amenities"],
    color: "from-gray-400 to-gray-500"
  },
  {
    name: "gold",
    title: "Gold Admiral",
    icon: <Crown className="w-6 h-6" />,
    price: "$7,500/month",
    yachtSize: "Up to 70ft",
    features: ["12 days/month", "VIP concierge", "Luxury amenities"],
    color: "from-yellow-400 to-yellow-500"
  },
  {
    name: "platinum",
    title: "Platinum Captain",
    icon: <Star className="w-6 h-6" />,
    price: "$15,000/month",
    yachtSize: "Unlimited",
    features: ["Unlimited access", "Dedicated concierge", "All amenities"],
    color: "from-purple-400 to-purple-500"
  }
];

// Application Modal Component (exactly matching landing page)
function ApplicationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
    mutationFn: (data: any) => apiRequest('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
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
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  <Label htmlFor="currentBoats" className="text-white">Current Boats/Yachts Owned</Label>
                  <Textarea
                    id="currentBoats"
                    value={formData.currentBoats}
                    onChange={(e) => updateFormData('currentBoats', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Describe any boats or yachts you currently own"
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
                  <Label htmlFor="membershipTier" className="text-white">Preferred Membership Tier *</Label>
                  <Select onValueChange={(value) => updateFormData('membershipTier', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select membership tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {membershipTiers.map((tier) => (
                        <SelectItem key={tier.name} value={tier.name}>
                          {tier.title} - {tier.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="membershipPackage" className="text-white">Membership Package *</Label>
                  <Select onValueChange={(value) => updateFormData('membershipPackage', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="regular">Regular Membership</SelectItem>
                      <SelectItem value="mariners">Mariner's Membership (à la carte)</SelectItem>
                    </SelectContent>
                  </Select>
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
              <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white ml-2">{formData.fullName || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{formData.email || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white ml-2">{formData.phone || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Membership Tier:</span>
                    <span className="text-white ml-2">
                      {formData.membershipTier 
                        ? membershipTiers.find(t => t.name === formData.membershipTier)?.title || formData.membershipTier
                        : 'Not selected'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Package:</span>
                    <span className="text-white ml-2">
                      {formData.membershipPackage === 'mariners' ? "Mariner's Membership" : 
                       formData.membershipPackage === 'regular' ? "Regular Membership" : 'Not selected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Preferred Yacht Size:</span>
                    <span className="text-white ml-2">{formData.preferredYachtSize || 'Not selected'}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="referralSource" className="text-white">How did you hear about us?</Label>
                <Select onValueChange={(value) => updateFormData('referralSource', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select referral source" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="search-engine">Search Engine</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="friend-referral">Friend/Family Referral</SelectItem>
                    <SelectItem value="business-associate">Business Associate</SelectItem>
                    <SelectItem value="yacht-show">Yacht Show/Event</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                    className="border-gray-600"
                  />
                  <Label htmlFor="agreeToTerms" className="text-white text-sm">
                    I agree to the <Link href="/terms" className="text-purple-400 hover:text-purple-300">Terms and Conditions</Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={(checked) => updateFormData('agreeToPrivacy', checked)}
                    className="border-gray-600"
                  />
                  <Label htmlFor="agreeToPrivacy" className="text-white text-sm">
                    I agree to the <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>
                  </Label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HowItWorks() {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Video Header */}
      <VideoHeader 
        title="How It Works"
        subtitle="Your journey to exclusive yacht experiences begins with four simple steps"
      />

      {/* Steps Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Step Number & Icon */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${step.color} p-1`}>
                    <div className="w-full h-full bg-black rounded-full flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-white mb-4">{step.number}</div>
                      <div className="p-4 rounded-full bg-white/10">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl">
                    {step.description}
                  </p>
                  
                  {/* Features for each step */}
                  <div className="space-y-3">
                    {index === 0 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Quick online application</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Background verification</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Exclusive member benefits</span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Silver: Up to 64ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gold: Up to 80ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Diamond: Full fleet access</span>
                        </div>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Online booking portal</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">24/7 concierge line</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Instant confirmation</span>
                        </div>
                      </>
                    )}
                    {index === 3 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Professional captain & crew</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gourmet catering options</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Water sports equipment</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA 
        onApplyClick={() => setIsApplicationModalOpen(true)}
      />
      
      {/* Footer */}
      <Footer />
      
      {/* Application Modal */}
      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen} 
          onClose={() => setIsApplicationModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
}