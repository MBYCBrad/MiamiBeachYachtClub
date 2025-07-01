import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Ship, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const yachtPartnerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().optional(),
  yachtName: z.string().min(2, "Yacht name is required"),
  yachtType: z.string().min(1, "Please select yacht type"),
  yachtLength: z.string().min(1, "Yacht length is required"),
  yachtYear: z.string().min(4, "Yacht year is required"),
  homePort: z.string().min(2, "Home port is required"),
  experience: z.string().min(1, "Please select your experience level"),
  partnershipType: z.string().min(1, "Please select partnership type"),
  expectedRevenue: z.string().min(1, "Please select expected revenue range"),
  message: z.string().optional(),
});

type YachtPartnerFormData = z.infer<typeof yachtPartnerSchema>;

export default function YachtPartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Fetch hero video for background
  const { data: heroVideo } = useQuery({
    queryKey: ["/api/media/hero/active"],
  });

  const form = useForm<YachtPartnerFormData>({
    resolver: zodResolver(yachtPartnerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      yachtName: "",
      yachtType: "",
      yachtLength: "",
      yachtYear: "",
      homePort: "",
      experience: "",
      partnershipType: "",
      expectedRevenue: "",
      message: "",
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: YachtPartnerFormData) => {
      const applicationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        applicationType: "yacht_partner",
        details: {
          yachtName: data.yachtName,
          yachtType: data.yachtType,
          yachtLength: data.yachtLength,
          yachtYear: data.yachtYear,
          homePort: data.homePort,
          experience: data.experience,
          partnershipType: data.partnershipType,
          expectedRevenue: data.expectedRevenue,
        },
        message: data.message || null,
      };

      return apiRequest("POST", "/api/applications", applicationData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest in becoming a yacht partner. We'll review your application and contact you soon.",
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

  const onSubmit = (data: YachtPartnerFormData) => {
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
              Thank you for your interest in becoming a yacht partner. Our team will review your application and contact you within 48 hours.
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
            <source src={`/api/media/video/${heroVideo.url}`} type="video/mp4" />
          </video>
        )}
        
        {/* Gradient overlay with blur effect at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 backdrop-blur-sm bg-black/30 z-10" />
        
        <div className="relative z-20 h-full flex flex-col justify-center">
          <div className="max-w-4xl mx-auto px-6">
            <Link href="/partner">
              <Button variant="ghost" className="text-white hover:text-purple-400 mb-6">
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
                  <Ship className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Yacht Partner Application</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Join our exclusive fleet program and transform your yacht into a revenue-generating asset
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
                        <FormLabel className="text-white">Company (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yachtName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Yacht Name *</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yachtType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Yacht Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select yacht type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="motor_yacht">Motor Yacht</SelectItem>
                            <SelectItem value="sailing_yacht">Sailing Yacht</SelectItem>
                            <SelectItem value="catamaran">Catamaran</SelectItem>
                            <SelectItem value="sport_fishing">Sport Fishing</SelectItem>
                            <SelectItem value="mega_yacht">Mega Yacht</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yachtLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Yacht Length (feet) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 45" className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yachtYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Year Built *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2018" className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homePort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Home Port *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Miami, FL" className="bg-black/50 border-gray-700 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Charter Experience *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="new_to_charter">New to Charter</SelectItem>
                            <SelectItem value="1_2_years">1-2 Years</SelectItem>
                            <SelectItem value="3_5_years">3-5 Years</SelectItem>
                            <SelectItem value="5_plus_years">5+ Years</SelectItem>
                            <SelectItem value="professional_operator">Professional Charter Operator</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partnershipType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Partnership Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select partnership type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="full_management">Full Management (MBYC handles everything)</SelectItem>
                            <SelectItem value="partial_management">Partial Management (Shared responsibilities)</SelectItem>
                            <SelectItem value="listing_only">Listing Only (Owner managed)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Expected Monthly Revenue *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select revenue range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="5k_10k">$5,000 - $10,000</SelectItem>
                            <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100k_plus">$100,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Tell us more about your yacht, your goals, or any specific requirements..."
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
                    {submitApplication.isPending ? "Submitting..." : "Submit Yacht Partner Application"}
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