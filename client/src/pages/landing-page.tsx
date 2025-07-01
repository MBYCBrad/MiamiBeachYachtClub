import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves, Star, Users, Trophy, Shield, ArrowRight, Phone, Mail, MapPin, Clock, Check, Zap, Globe, Award, Crown, Quote, ChevronLeft, ChevronRight, User, Package, CreditCard, CheckCircle, Ship, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";
import { useState } from "react";
import { VideoFooter } from "@/components/video-footer";

// Membership Tiers Data
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

// Application Modal Component
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
                  <Label htmlFor="membershipTier" className="text-white">Preferred Membership Tier *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {membershipTiers.map((tier) => (
                      <Card
                        key={tier.name}
                        className={`cursor-pointer transition-all duration-300 ${
                          formData.membershipTier === tier.name
                            ? 'border-purple-500 bg-purple-900/20'
                            : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                        }`}
                        onClick={() => updateFormData('membershipTier', tier.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full bg-gradient-to-r ${tier.color}`}>
                              {tier.icon}
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{tier.title}</h4>
                              <p className="text-sm text-gray-400">{tier.price}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{tier.yachtSize}</p>
                          <div className="space-y-1">
                            {tier.features.map((feature, index) => (
                              <p key={index} className="text-xs text-gray-400">{feature}</p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="membershipPackage" className="text-white">Membership Package Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        formData.membershipPackage === "regular"
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                      onClick={() => updateFormData('membershipPackage', 'regular')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700">
                            <Anchor className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Regular Membership</h4>
                            <p className="text-sm text-gray-400">Annual Commitment</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">12-month commitment with discounted rates</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">• Lower monthly rates</p>
                          <p className="text-xs text-gray-400">• Annual payment plan</p>
                          <p className="text-xs text-gray-400">• Priority booking</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        formData.membershipPackage === "mariners"
                          ? 'border-purple-500 bg-purple-900/20'
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                      onClick={() => updateFormData('membershipPackage', 'mariners')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                            <Users className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">Mariner's Membership</h4>
                            <p className="text-sm text-gray-400">Month-to-Month Flexibility</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">$10,000 one-time fee + 2x monthly rates</p>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400">• Month-to-month flexibility</p>
                          <p className="text-xs text-gray-400">• Tier switching allowed</p>
                          <p className="text-xs text-gray-400">• Premium access</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div>
                  <Label htmlFor="yachtingExperience" className="text-white">Yachting Experience *</Label>
                  <Select onValueChange={(value) => updateFormData('yachtingExperience', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="none">No experience</SelectItem>
                      <SelectItem value="beginner">Beginner (1-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                      <SelectItem value="expert">Expert/Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="intendedUsage" className="text-white">Intended Usage *</Label>
                  <Select onValueChange={(value) => updateFormData('intendedUsage', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="How do you plan to use the yachts?" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="leisure">Leisure/Recreation</SelectItem>
                      <SelectItem value="business">Business Entertainment</SelectItem>
                      <SelectItem value="family">Family Outings</SelectItem>
                      <SelectItem value="events">Special Events</SelectItem>
                      <SelectItem value="mixed">Mixed Usage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referralSource" className="text-white">How did you hear about us?</Label>
                  <Select onValueChange={(value) => updateFormData('referralSource', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select referral source" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="social-media">Social Media</SelectItem>
                      <SelectItem value="referral">Friend/Member Referral</SelectItem>
                      <SelectItem value="event">Industry Event</SelectItem>
                      <SelectItem value="search">Online Search</SelectItem>
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
                    placeholder="Any special requirements or comments..."
                    rows={3}
                  />
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
                    <h4 className="font-semibold text-white mb-2">Personal Information</h4>
                    <p className="text-gray-300">Name: {formData.fullName}</p>
                    <p className="text-gray-300">Email: {formData.email}</p>
                    <p className="text-gray-300">Phone: {formData.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Membership Preference</h4>
                    <p className="text-gray-300">
                      Tier: {membershipTiers.find(t => t.name === formData.membershipTier)?.title || 'Not selected'}
                    </p>
                    <p className="text-gray-300">Experience: {formData.yachtingExperience}</p>
                    <p className="text-gray-300">Usage: {formData.intendedUsage}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                  />
                  <Label htmlFor="terms" className="text-white text-sm">
                    I agree to the Terms of Service and Membership Agreement
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formData.agreeToPrivacy}
                    onCheckedChange={(checked) => updateFormData('agreeToPrivacy', checked)}
                  />
                  <Label htmlFor="privacy" className="text-white text-sm">
                    I agree to the Privacy Policy and consent to background verification
                  </Label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !formData.agreeToTerms || !formData.agreeToPrivacy}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hero Section with Video Background
function HeroSection({ onApplyClick }: { onApplyClick: () => void }) {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {heroVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
        </video>
      )}
      
      {/* Light Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* 3D Anamorphic Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge - Enhanced blur to blend into black background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Bottom Edge - Deeper for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <img 
            src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
            alt="Miami Beach Yacht Club" 
            className="mx-auto w-[400px] md:w-[600px] lg:w-[700px] mb-8"
          />
        </motion.div>
        


        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Button 
            size="lg" 
            onClick={onApplyClick}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            APPLY NOW
          </Button>
          <Link href="/book-tour">
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              BOOK A PRIVATE TOUR
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  );
}

// Features Section with Phone Mockup
function FeaturesSection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  const leftFeatures = [
    {
      title: "Unlimited Access",
      description: "Book unlimited trips on our luxury yacht fleet",
      icon: <Anchor className="w-6 h-6" />
    },
    {
      title: "Concierge Service",
      description: "24/7 dedicated concierge for all your needs",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Exclusive Events",
      description: "Access to members-only events and experiences",
      icon: <Waves className="w-6 h-6" />
    }
  ];

  const rightFeatures = [
    {
      title: "Professional Crew",
      description: "Experienced captains and crew at your service",
      icon: <Anchor className="w-6 h-6" />
    },
    {
      title: "Premium Catering",
      description: "Gourmet dining options from top Miami chefs",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Flexible Booking",
      description: "Book up to 12 months in advance",
      icon: <Waves className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Silver Stars Background Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${starPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          backgroundPosition: '0 0',
          imageRendering: 'crisp-edges',
          opacity: 0.6,
        }}
      />
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-indigo-900/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Become A Member Today &
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Download the MBYC Mobile App
            </span>
          </h2>
          

        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left Features */}
          <div className="space-y-8">
            {leftFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-right"
              >
                <div className="flex items-center justify-end gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto"
          >
            <div className="relative w-[300px] h-[650px] mx-auto">
              {/* iPhone Frame Image */}
              <img 
                src="/api/media/apple-intelligence_hw__b7r46krxys9y_large_1751028888126.png"
                alt="iPhone Frame"
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
              />
              
              {/* Screen Content - positioned to fit within the phone screen area */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                <div className="relative w-[278px] h-[626px] rounded-[48px] overflow-hidden">
                  {heroVideo && (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={heroVideo.url} type={heroVideo.mimetype} />
                    </video>
                  )}
                  
                  {/* 3D Anamorphic Edges for Mobile Screen */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top Edge - Enhanced blur to blend into black background */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black via-black/80 to-transparent rounded-t-[48px]" />
                    
                    {/* Bottom Edge - Deeper for mobile */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent rounded-b-[48px]" />
                    
                    {/* Left Edge - Narrower */}
                    <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-black/40 to-transparent rounded-l-[48px]" />
                    
                    {/* Right Edge - Narrower */}
                    <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-black/40 to-transparent rounded-r-[48px]" />
                  </div>
                  
                  {/* App UI Overlay - Login Form */}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center px-6">
                    {/* Logo */}
                    <img 
                      src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
                      alt="Miami Beach Yacht Club" 
                      className="w-40 h-40 object-contain mb-6" 
                    />
                    
                    {/* Login Form */}
                    <div className="w-full max-w-[240px] space-y-4">
                      <h3 className="text-white text-xl font-bold text-center mb-2">Member Login</h3>
                      
                      {/* Username Input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Username" 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:border-purple-400"
                          defaultValue="Simon"
                        />
                      </div>
                      
                      {/* Password Input */}
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:border-purple-400"
                          defaultValue="••••••••"
                        />
                      </div>
                      
                      {/* Login Button */}
                      <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all">
                        Sign In
                      </button>
                      
                      {/* Footer Links */}
                      <div className="flex justify-between text-xs text-white/60 mt-4">
                        <a href="#" className="hover:text-white">Forgot Password?</a>
                        <a href="#" className="hover:text-white">Join MBYC</a>
                      </div>
                    </div>
                    
                    {/* Bottom Text */}
                    <p className="text-white/40 text-xs mt-8 text-center">
                      Exclusive access for MBYC members
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* App Store Badges Below Phone */}
            <div className="flex gap-4 justify-center mt-16">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <img 
                  src="/api/media/app-store-badge_1751029750830.png" 
                  alt="Download on the App Store" 
                  className="h-16 object-contain"
                />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <img 
                  src="/api/media/google-play-badge_1751029663061.png" 
                  alt="Get it on Google Play" 
                  className="h-16 object-contain"
                />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Features */}
          <div className="space-y-8">
            {rightFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400 ml-14">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



// Stats Section Component
function StatsSection() {
  const stats = [
    { value: "6+", label: "Luxury Yachts", icon: <Anchor className="w-8 h-8 text-white" /> },
    { value: "24/7", label: "Concierge Service", icon: <Phone className="w-8 h-8 text-white" /> },
    { value: "95%", label: "Member Satisfaction", icon: <Star className="w-8 h-8 text-white" /> },
    { value: "15+", label: "Years Experience", icon: <Award className="w-8 h-8 text-white" /> }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Why Choose
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> MBYC</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join Miami's most exclusive yacht club and experience luxury like never before
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 h-full"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-400 text-lg">{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Packages Section Component
function PackagesSection({ onApplyClick }: { onApplyClick?: () => void }) {
  const packages = [
    {
      name: "Gold",
      nameSubtext: "MEMBERSHIP",
      icon: <Crown className="w-8 h-8 text-white" />,
      price: "$5,000",
      priceSubtext: "every month",
      membershipFee: "+$25,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 70ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 4 Bookings at a time. *Gold members are entitled to four (4) reservations concurrently on the calendar, two (2) on weekdays and two (2) on weekends.",
      popular: false
    },
    {
      name: "Platinum", 
      nameSubtext: "MEMBERSHIP",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      price: "$7,500",
      priceSubtext: "every month",
      membershipFee: "+$50,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 80ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 6 Bookings at a time. *Platinum members are entitled to six (6) reservations concurrently on the calendar, no more than three (3) on weekdays and with three (3) on weekends.",
      popular: true
    },
    {
      name: "Diamond",
      nameSubtext: "MEMBERSHIP", 
      icon: <Award className="w-8 h-8 text-white" />,
      price: "$10,000",
      priceSubtext: "every month",
      membershipFee: "+$100,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 100ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 6 Bookings at a time. *Diamond members are entitled to six (6) reservations concurrently on the calendar, three (3) on weekdays and three (3) on weekends.",
      popular: false
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Choose Your
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Membership</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Select the perfect tier for your yachting lifestyle
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/pricing'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            View All Membership Tiers
          </motion.button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className={`h-full rounded-2xl p-8 ${
                  pkg.popular 
                    ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/50' 
                    : 'bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20'
                } backdrop-blur-sm`}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    {pkg.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-sm text-gray-400 mb-4 tracking-widest">{pkg.nameSubtext}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {pkg.price}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">{pkg.priceSubtext}</p>
                  <p className="text-sm text-purple-400 font-semibold mb-6">{pkg.membershipFee}</p>
                </div>
                <ul className="space-y-4 mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mb-8 p-4 bg-purple-900/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-gray-400 leading-relaxed">{pkg.detailedDescription}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onApplyClick || (() => window.location.href = '/book-tour')}
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                      : 'bg-purple-900/20 text-purple-400 border border-purple-500/50 hover:bg-purple-900/30'
                  }`}
                >
                  Apply Now
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <p className="text-gray-300 text-center leading-relaxed mb-6">
              The Member Ownership Fee is a one-time, lifetime fee that grants ownership of a membership which owns the right to use the yachts. As long as membership dues are maintained, and once we reach the maximum number of memberships sold, new members will only be able to join by purchasing a membership from an existing member through MBYC directly.
            </p>
            <div className="text-center">
              <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                The bookings replenish 48 hours after you complete your trip.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Mariner's Membership Section Component
function MarinersSection({ onApplyClick }: { onApplyClick?: () => void }) {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            MARINER'S MEMBERSHIP
          </h2>
          <p className="text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold tracking-wider" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            THE ULTIMATE FLEXIBLE YACHTING EXPERIENCE
          </p>
          <div className="max-w-4xl mx-auto mt-8">
            <p className="text-gray-300 leading-relaxed text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              The <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Mariner's Membership</span> is designed for those who seek <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">ultimate flexibility</span> in their yachting experience. This <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">à la carte</span> membership allows you to tailor your access to the club on a <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">month-to-month basis</span>, choosing your membership tier based on your plans and needs.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>HOW IT WORKS:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">1</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Membership can <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">begin on the 1st or 15th</span> of any month.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">2</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Members can <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">change tiers each month</span> depending on their schedule.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">3</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}><span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Example:</span> Be a Gold Member from <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Feb 15 - March 15</span>, switch to Diamond from <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">March 15 - April 15</span>, and take a break until returning in September, without paying for unused months.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">4</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}><span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">No long-term commitments</span>, only pay for the months you choose to be active.</p>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>PRICING</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-500/20">
                <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>One-Time Member Ownership Fee:</p>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$10,000</p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-500/20">
                <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Monthly Fee: 2X the standard membership rate</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Gold:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$10,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Platinum:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$15,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$20,000/month</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits & Outing Access */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>BENEFITS & OUTING ACCESS</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Gold Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>4 four-hour outings per month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Platinum Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>6 four-hour outings per month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>6 four-hour outings per month</p>
                  <p className="text-sm text-purple-300 mt-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond members get 2 outings on the 95' yacht, and the remaining 4 outings must be on other yachts in the fleet.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flexibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 max-w-6xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300">
            <h3 className="text-3xl font-bold text-white mb-6 text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>FLEXIBILITY:</h3>
            <p className="text-gray-300 leading-relaxed mb-6 text-center text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              This membership is perfect for those who <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">split their time between locations</span>, have <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">changing schedules</span>, or want the <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">flexibility to experience different levels of membership</span> throughout the year without any long-term obligations.
            </p>
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-6 border border-purple-500/20">
              <p className="text-gray-300 leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Mariner's Members</span> can switch to a yearly membership plan at any time, and their initial <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">$10,000 Member Ownership fee</span> will be credited towards their yearly membership. And by switching to full time membership your <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">monthly fees will be cut in half</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Apply Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onApplyClick || (() => window.location.href = '/apply')}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          >
            APPLY NOW
          </motion.button>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Ready to get started? Contact us today to learn more and secure your Mariner's Membership at The Miami Beach Yacht Club!
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection({ onApplyClick }: { onApplyClick: () => void }) {
  const testimonials = [
    {
      name: "Michael Chen",
      role: "Platinum Member",
      image: "/api/media/2018_10_01_13_06_40_1880672045400179171_458353437_1750933334676_176907645.jpg",
      quote: "MBYC has transformed my weekends. The concierge service is exceptional, and the yacht selection is unmatched in Miami."
    },
    {
      name: "Sarah Williams",
      role: "Gold Member",
      image: "/api/media/QK_5314_credit_Quin_BISSET_665x443_1751116152867_804854212.jpg",
      quote: "From booking to boarding, everything is seamless. The crew is professional and the experiences are unforgettable."
    },
    {
      name: "David Rodriguez",
      role: "Diamond Member",
      image: "/api/media/IMG_0243_2_1751116578225_891415775.jpg",
      quote: "Being a Diamond member has opened doors to incredible networking opportunities. It's more than a yacht club - it's a lifestyle."
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Member
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Stories</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hear from our members about their MBYC experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-purple-500/30 mb-4" />
                <p className="text-gray-300 italic">{testimonial.quote}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onApplyClick}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Join Our Community
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Fleet Preview Section
function FleetPreviewSection() {
  const { data: yachts = [], isLoading } = useQuery({
    queryKey: ['/api/yachts'],
  });

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Our Luxury
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Fleet</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience Miami's finest collection of luxury yachts
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl mb-4 bg-gray-800 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-700" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-6 bg-gray-600 rounded mb-2" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-600 rounded" />
                    <div className="h-4 w-20 bg-gray-600 rounded" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            yachts.slice(0, 3).map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => window.location.href = '/fleet'}
                >
                  <div className="relative overflow-hidden rounded-2xl mb-4">
                    <img 
                      src={yacht.imageUrl || yacht.images?.[0] || '/api/media/pexels-pixabay-163236_1750537277230.jpg'} 
                      alt={yacht.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Lock Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 flex items-start justify-center pt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <Lock className="w-16 h-16 text-white" />
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{yacht.name}</h3>
                      <div className="flex items-center gap-4 text-gray-300">
                        <span className="flex items-center gap-1">
                          <Anchor className="w-4 h-4" />
                          {yacht.size}ft
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {yacht.capacity} guests
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/fleet'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Explore Full Fleet
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "How does MBYC membership work?",
      answer: "MBYC offers tiered memberships that provide access to our luxury yacht fleet. Each tier includes a specific number of concurrent bookings, yacht size access, and exclusive benefits."
    },
    {
      question: "What's included in my membership?",
      answer: "All memberships include professional captain and crew, fuel, maintenance, insurance, and basic refreshments. Higher tiers add premium services like gourmet catering and private chefs."
    },
    {
      question: "How far in advance can I book?",
      answer: "Members can book yachts up to 90 days in advance. Platinum and Diamond members receive priority booking windows for peak times and special events."
    },
    {
      question: "Can I bring guests?",
      answer: "Yes! All memberships allow guests. The number depends on yacht capacity and your membership tier. Gold members and above receive complimentary guest passes each month."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Frequently Asked
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-purple-900/10 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-6 h-6 text-purple-400 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-6">
                        <p className="text-gray-400">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Have more questions?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Contact Our Team
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section with Video Background
function FinalCTASection({ onApplyClick }: { onApplyClick: () => void }) {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {heroVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
        </video>
      )}
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* 3D Anamorphic Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge - Enhanced blur to blend into black background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Bottom Edge - Deeper for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          Ready to Join Miami's Most Exclusive
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Yacht Club?</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-xl text-gray-300 mb-10"
        >
          Start your luxury yachting journey today. Limited memberships available.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/book-tour'}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-2xl"
          >
            Book Your Private Tour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
          >
            Contact Us
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
              alt="Miami Beach Yacht Club" 
              className="w-48 mb-4"
            />
            <p className="text-gray-400 text-sm">
              Miami's premier yacht club offering exclusive access to luxury vessels and world-class maritime experiences.
            </p>
          </div>
          
          {/* Main Menu */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Main Menu</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-purple-400 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-purple-400 transition-colors">Plans & Pricing</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-purple-400 transition-colors">Events</Link></li>
              <li><Link href="/fleet" className="text-gray-400 hover:text-purple-400 transition-colors">Fleet</Link></li>
              <li><Link href="/book-tour" className="text-gray-400 hover:text-purple-400 transition-colors">Book a Private Tour</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/invest" className="text-gray-400 hover:text-purple-400 transition-colors">Invest</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <a href="tel:786-981-3875" className="text-gray-400 hover:text-purple-400 transition-colors">
                    786-981-3875
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                <a href="mailto:membership@mbyc.miami" className="text-gray-400 hover:text-purple-400 transition-colors">
                  membership@mbyc.miami
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="text-gray-400">
                  300 Alton Road, Suite 305b<br />
                  Miami Beach, Florida 33139<br />
                  United States
                </div>
              </div>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Opening Hours</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex gap-4">
                <span className="w-20">Mon - Fri:</span>
                <span>9am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sat:</span>
                <span>10am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sun:</span>
                <span>10am - 5pm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              ©2025 Miami Beach Yacht Club. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <FeaturesSection />
      <StatsSection />
      <FleetPreviewSection />
      <PackagesSection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <MarinersSection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <TestimonialsSection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <FAQSection />
      <FinalCTASection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <Footer />
      
      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen} 
          onClose={() => setIsApplicationModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
}