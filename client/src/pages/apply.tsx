import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, User, Package, CreditCard, Users, CheckCircle, Ship, Sparkles, Crown, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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
    features: ["Unlimited access", "24/7 concierge", "Ultra-luxury amenities"],
    color: "from-purple-600 to-indigo-600"
  }
];

const steps = [
  { id: 1, title: "Personal Information", icon: User },
  { id: 2, title: "Membership Package", icon: Package },
  { id: 3, title: "Financial Information", icon: CreditCard },
  { id: 4, title: "References & Final", icon: Users }
];

interface ApplicationData {
  // Step 1
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  occupation: string;
  employer: string;
  
  // Step 2
  membershipTier: string;
  preferredLocation: string;
  expectedUsageFrequency: string;
  primaryUseCase: string;
  groupSize: string;
  
  // Step 3
  annualIncome: string;
  netWorth: string;
  liquidAssets: string;
  creditScore: string;
  bankName: string;
  hasBoatingExperience: boolean;
  boatingExperienceYears: number;
  boatingLicenseNumber: string;
  
  // Step 4
  referenceSource: string;
  referralName: string;
  preferredStartDate: string;
  specialRequests: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  agreeToTerms: boolean;
  agreeToBackground: boolean;
  marketingOptIn: boolean;
}

export default function Apply() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<ApplicationData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    occupation: "",
    employer: "",
    membershipTier: "",
    preferredLocation: "Miami Beach",
    expectedUsageFrequency: "",
    primaryUseCase: "",
    groupSize: "",
    annualIncome: "",
    netWorth: "",
    liquidAssets: "",
    creditScore: "",
    bankName: "",
    hasBoatingExperience: false,
    boatingExperienceYears: 0,
    boatingLicenseNumber: "",
    referenceSource: "",
    referralName: "",
    preferredStartDate: "",
    specialRequests: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    agreeToTerms: false,
    agreeToBackground: false,
    marketingOptIn: false
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationData) => {
      return await apiRequest("/api/applications", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted Successfully",
        description: "We'll review your application and contact you within 48 hours.",
      });
      setLocation("/apply/success");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && 
               formData.dateOfBirth && formData.address && formData.city && formData.state && 
               formData.zipCode && formData.country && formData.occupation;
      case 2:
        return formData.membershipTier && formData.preferredLocation && formData.expectedUsageFrequency && 
               formData.primaryUseCase && formData.groupSize;
      case 3:
        return formData.annualIncome && formData.netWorth && formData.liquidAssets && 
               formData.creditScore && formData.bankName;
      case 4:
        return formData.referenceSource && formData.preferredStartDate && formData.emergencyContactName && 
               formData.emergencyContactPhone && formData.emergencyContactRelation && 
               formData.agreeToTerms && formData.agreeToBackground;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Membership Application</h1>
          <p className="text-xl text-purple-100">Join Miami Beach Yacht Club - Where luxury meets the sea</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-600 text-white' 
                  : 'border-gray-600 text-gray-400'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                  Step {step.id}
                </p>
                <p className={`text-xs ${currentStep >= step.id ? 'text-purple-200' : 'text-gray-500'}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-2xl text-white">
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {currentStep === 1 && "Please provide your personal information"}
                  {currentStep === 2 && "Select your membership package and preferences"}
                  {currentStep === 3 && "Financial qualification information"}
                  {currentStep === 4 && "References and final details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="occupation">Occupation *</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => updateFormData('occupation', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => updateFormData('address', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => updateFormData('zipCode', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employer">Employer</Label>
                      <Input
                        id="employer"
                        value={formData.employer}
                        onChange={(e) => updateFormData('employer', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Membership Package */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">Select Your Membership Tier *</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {membershipTiers.map((tier) => (
                          <div
                            key={tier.name}
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.membershipTier === tier.name
                                ? 'border-purple-600 bg-purple-600/20'
                                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                            }`}
                            onClick={() => updateFormData('membershipTier', tier.name)}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center text-white`}>
                                {tier.icon}
                              </div>
                              <Badge className={`bg-gradient-to-r ${tier.color} text-white`}>
                                {tier.price}
                              </Badge>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                            <p className="text-purple-200 mb-3">{tier.yachtSize}</p>
                            <ul className="text-sm text-gray-300 space-y-1">
                              {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="w-4 h-4 text-purple-400 mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="expectedUsageFrequency">Expected Usage Frequency *</Label>
                        <Select value={formData.expectedUsageFrequency} onValueChange={(value) => updateFormData('expectedUsageFrequency', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="occasionally">Occasionally</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="primaryUseCase">Primary Use Case *</Label>
                        <Select value={formData.primaryUseCase} onValueChange={(value) => updateFormData('primaryUseCase', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select use case" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leisure">Leisure & Recreation</SelectItem>
                            <SelectItem value="entertaining">Business Entertaining</SelectItem>
                            <SelectItem value="family">Family Time</SelectItem>
                            <SelectItem value="fishing">Fishing</SelectItem>
                            <SelectItem value="events">Special Events</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="groupSize">Typical Group Size *</Label>
                        <Select value={formData.groupSize} onValueChange={(value) => updateFormData('groupSize', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select group size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2-4">2-4 people</SelectItem>
                            <SelectItem value="5-8">5-8 people</SelectItem>
                            <SelectItem value="9-12">9-12 people</SelectItem>
                            <SelectItem value="12+">12+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Financial Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="annualIncome">Annual Income Range *</Label>
                        <Select value={formData.annualIncome} onValueChange={(value) => updateFormData('annualIncome', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select income range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="250k-500k">$250K - $500K</SelectItem>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                            <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                            <SelectItem value="5m+">$5M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="netWorth">Net Worth Range *</Label>
                        <Select value={formData.netWorth} onValueChange={(value) => updateFormData('netWorth', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select net worth range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                            <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                            <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                            <SelectItem value="10m-25m">$10M - $25M</SelectItem>
                            <SelectItem value="25m+">$25M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="liquidAssets">Liquid Assets Range *</Label>
                        <Select value={formData.liquidAssets} onValueChange={(value) => updateFormData('liquidAssets', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select liquid assets range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                            <SelectItem value="1m-2m">$1M - $2M</SelectItem>
                            <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                            <SelectItem value="5m+">$5M+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="creditScore">Credit Score Range *</Label>
                        <Select value={formData.creditScore} onValueChange={(value) => updateFormData('creditScore', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select credit score range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="700-750">700 - 750</SelectItem>
                            <SelectItem value="750-800">750 - 800</SelectItem>
                            <SelectItem value="800+">800+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bankName">Primary Bank *</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => updateFormData('bankName', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4">Boating Experience</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="hasBoatingExperience"
                            checked={formData.hasBoatingExperience}
                            onCheckedChange={(checked) => updateFormData('hasBoatingExperience', checked)}
                          />
                          <Label htmlFor="hasBoatingExperience">I have boating experience</Label>
                        </div>
                        {formData.hasBoatingExperience && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="boatingExperienceYears">Years of Experience</Label>
                              <Input
                                id="boatingExperienceYears"
                                type="number"
                                value={formData.boatingExperienceYears}
                                onChange={(e) => updateFormData('boatingExperienceYears', parseInt(e.target.value) || 0)}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <div>
                              <Label htmlFor="boatingLicenseNumber">Boating License Number</Label>
                              <Input
                                id="boatingLicenseNumber"
                                value={formData.boatingLicenseNumber}
                                onChange={(e) => updateFormData('boatingLicenseNumber', e.target.value)}
                                className="bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: References & Final */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="referenceSource">How did you hear about us? *</Label>
                        <Select value={formData.referenceSource} onValueChange={(value) => updateFormData('referenceSource', value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member-referral">Member Referral</SelectItem>
                            <SelectItem value="online-search">Online Search</SelectItem>
                            <SelectItem value="social-media">Social Media</SelectItem>
                            <SelectItem value="broker">Yacht Broker</SelectItem>
                            <SelectItem value="marina">Marina</SelectItem>
                            <SelectItem value="event">Event/Show</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="referralName">Referral Name (if applicable)</Label>
                        <Input
                          id="referralName"
                          value={formData.referralName}
                          onChange={(e) => updateFormData('referralName', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredStartDate">Preferred Start Date *</Label>
                        <Input
                          id="preferredStartDate"
                          type="date"
                          value={formData.preferredStartDate}
                          onChange={(e) => updateFormData('preferredStartDate', e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="specialRequests">Special Requests or Comments</Label>
                      <Textarea
                        id="specialRequests"
                        value={formData.specialRequests}
                        onChange={(e) => updateFormData('specialRequests', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                        rows={4}
                      />
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="emergencyContactName">Full Name *</Label>
                          <Input
                            id="emergencyContactName"
                            value={formData.emergencyContactName}
                            onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
                          <Input
                            id="emergencyContactPhone"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyContactRelation">Relationship *</Label>
                          <Input
                            id="emergencyContactRelation"
                            value={formData.emergencyContactRelation}
                            onChange={(e) => updateFormData('emergencyContactRelation', e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4">Terms & Agreements</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                          />
                          <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the Terms of Service and Membership Agreement *
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="agreeToBackground"
                            checked={formData.agreeToBackground}
                            onCheckedChange={(checked) => updateFormData('agreeToBackground', checked)}
                          />
                          <Label htmlFor="agreeToBackground" className="text-sm">
                            I authorize Miami Beach Yacht Club to conduct a background and credit check *
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="marketingOptIn"
                            checked={formData.marketingOptIn}
                            onCheckedChange={(checked) => updateFormData('marketingOptIn', checked)}
                          />
                          <Label htmlFor="marketingOptIn" className="text-sm">
                            I would like to receive marketing communications and updates
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || submitMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}