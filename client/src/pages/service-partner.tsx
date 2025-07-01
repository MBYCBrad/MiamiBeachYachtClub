import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wrench, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

const servicePartnerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().min(2, "Company name is required"),
  businessType: z.string().min(1, "Please select business type"),
  experience: z.string().min(1, "Please select experience level"),
  serviceCategories: z.array(z.string()).min(1, "Please select at least one service category"),
  deliveryTypes: z.array(z.string()).min(1, "Please select at least one delivery type"),
  coverage: z.string().min(2, "Service coverage area is required"),
  capacity: z.string().min(1, "Please select service capacity"),
  certifications: z.string().optional(),
  message: z.string().optional(),
});

type ServicePartnerFormData = z.infer<typeof servicePartnerSchema>;

const serviceCategories = [
  { id: "beauty_grooming", label: "Beauty & Grooming Services" },
  { id: "culinary", label: "Culinary Services" },
  { id: "wellness_spa", label: "Wellness & Spa Services" },
  { id: "photography_media", label: "Photography & Media Services" },
  { id: "entertainment", label: "Entertainment Services" },
  { id: "water_sports", label: "Water Sports Equipment & Instruction" },
  { id: "concierge_lifestyle", label: "Concierge & Lifestyle Services" },
];

const deliveryTypes = [
  { id: "yacht_addon", label: "Yacht Add-on Service (onboard delivery)" },
  { id: "marina_service", label: "Marina Service (members come to you)" },
  { id: "come_to_you", label: "Come To You (travel to member location)" },
  { id: "external_location", label: "External Location (dedicated venue)" },
];

export default function ServicePartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Fetch hero video for background
  const { data: heroVideo } = useQuery({
    queryKey: ["/api/media/hero/active"],
  });

  const form = useForm<ServicePartnerFormData>({
    resolver: zodResolver(servicePartnerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      businessType: "",
      experience: "",
      serviceCategories: [],
      deliveryTypes: [],
      coverage: "",
      capacity: "",
      certifications: "",
      message: "",
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: ServicePartnerFormData) => {
      const applicationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        applicationType: "service_provider",
        details: {
          businessType: data.businessType,
          experience: data.experience,
          serviceCategories: data.serviceCategories,
          deliveryTypes: data.deliveryTypes,
          coverage: data.coverage,
          capacity: data.capacity,
          certifications: data.certifications,
        },
        message: data.message || null,
      };

      return apiRequest("POST", "/api/applications", applicationData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest in becoming a service provider partner. We'll review your application and contact you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServicePartnerFormData) => {
    submitApplication.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Application Submitted!</h1>
            <p className="text-gray-300 mb-8">
              Thank you for your interest in becoming a service provider partner. Our team will review your application and contact you within 48 hours.
            </p>
            <Link href="/partner">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                Back to Partner Page
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Video Header with Blur Effect */}
      <div className="relative h-[60vh] overflow-hidden bg-black">
        {heroVideo?.url && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}
        
        {/* Enhanced gradient overlay matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/90 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        
        <div className="relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-4xl mx-auto px-6 pt-20">
            <Link href="/partner">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Partner Options
              </Button>
            </Link>
            
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Wrench className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Service Provider Application</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Join our premium service network and serve Miami Beach Yacht Club's exclusive members
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-20">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone Number *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Company Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Business Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="individual">Individual Practitioner</SelectItem>
                            <SelectItem value="small_business">Small Business (1-10 employees)</SelectItem>
                            <SelectItem value="medium_business">Medium Business (11-50 employees)</SelectItem>
                            <SelectItem value="large_business">Large Business (50+ employees)</SelectItem>
                            <SelectItem value="franchise">Franchise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Experience Level *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="new_to_luxury">New to Luxury Market</SelectItem>
                            <SelectItem value="1_3_years">1-3 Years Luxury Experience</SelectItem>
                            <SelectItem value="3_5_years">3-5 Years Luxury Experience</SelectItem>
                            <SelectItem value="5_plus_years">5+ Years Luxury Experience</SelectItem>
                            <SelectItem value="established_luxury">Established Luxury Provider</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Service Coverage Area *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Miami-Dade County, South Florida" className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Service Capacity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="1_5_clients">1-5 clients per month</SelectItem>
                            <SelectItem value="5_15_clients">5-15 clients per month</SelectItem>
                            <SelectItem value="15_30_clients">15-30 clients per month</SelectItem>
                            <SelectItem value="30_plus_clients">30+ clients per month</SelectItem>
                            <SelectItem value="unlimited">Unlimited capacity</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="serviceCategories"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">Service Categories * (Select all that apply)</FormLabel>
                      <div className="grid md:grid-cols-2 gap-3">
                        {serviceCategories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="serviceCategories"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={category.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== category.id
                                              )
                                            )
                                      }}
                                      className="border-gray-600 data-[state=checked]:bg-purple-600"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm text-gray-300 font-normal">
                                    {category.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">Service Delivery Types * (Select all that apply)</FormLabel>
                      <div className="space-y-3">
                        {deliveryTypes.map((type) => (
                          <FormField
                            key={type.id}
                            control={form.control}
                            name="deliveryTypes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={type.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(type.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, type.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== type.id
                                              )
                                            )
                                      }}
                                      className="border-gray-600 data-[state=checked]:bg-purple-600"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm text-gray-300 font-normal">
                                    {type.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Certifications & Licenses (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="List any relevant certifications, licenses, or professional credentials..."
                          className="bg-black/50 border-gray-700 text-white min-h-[80px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Tell us more about your services, specialties, or any specific requirements..."
                          className="bg-black/50 border-gray-700 text-white min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitApplication.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3"
                  >
                    {submitApplication.isPending ? "Submitting..." : "Submit Service Provider Application"}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}