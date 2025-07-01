import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, ArrowLeft, CheckCircle } from "lucide-react";
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

const eventPartnerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  company: z.string().min(2, "Company name is required"),
  businessType: z.string().min(1, "Please select business type"),
  experience: z.string().min(1, "Please select experience level"),
  eventTypes: z.array(z.string()).min(1, "Please select at least one event type"),
  capacity: z.string().min(1, "Please select event capacity"),
  coverage: z.string().min(2, "Service coverage area is required"),
  budget: z.string().min(1, "Please select typical event budget range"),
  portfolio: z.string().optional(),
  message: z.string().optional(),
});

type EventPartnerFormData = z.infer<typeof eventPartnerSchema>;

const eventTypes = [
  { id: "corporate_events", label: "Corporate Events & Conferences" },
  { id: "luxury_parties", label: "Luxury Private Parties" },
  { id: "weddings_celebrations", label: "Weddings & Celebrations" },
  { id: "charity_galas", label: "Charity Galas & Fundraisers" },
  { id: "product_launches", label: "Product Launches & Brand Events" },
  { id: "networking_events", label: "Networking & Business Events" },
  { id: "cultural_events", label: "Cultural & Arts Events" },
  { id: "sports_events", label: "Sports & Recreation Events" },
];

export default function EventPartnerPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // Fetch hero video for background
  const { data: heroVideo } = useQuery({
    queryKey: ["/api/media/hero/active"],
  });

  const form = useForm<EventPartnerFormData>({
    resolver: zodResolver(eventPartnerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      businessType: "",
      experience: "",
      eventTypes: [],
      capacity: "",
      coverage: "",
      budget: "",
      portfolio: "",
      message: "",
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: EventPartnerFormData) => {
      const applicationData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        applicationType: "event_provider",
        details: {
          businessType: data.businessType,
          experience: data.experience,
          eventTypes: data.eventTypes,
          capacity: data.capacity,
          coverage: data.coverage,
          budget: data.budget,
          portfolio: data.portfolio,
        },
        message: data.message || null,
      };

      return apiRequest("POST", "/api/applications", applicationData);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest in becoming an event provider partner. We'll review your application and contact you soon.",
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

  const onSubmit = (data: EventPartnerFormData) => {
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
              Thank you for your interest in becoming an event provider partner. Our team will review your application and contact you within 48 hours.
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
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Event Provider Application</h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Create unforgettable experiences for Miami Beach Yacht Club's exclusive members
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
                            <SelectItem value="event_planning">Event Planning Agency</SelectItem>
                            <SelectItem value="catering_company">Catering Company</SelectItem>
                            <SelectItem value="entertainment_agency">Entertainment Agency</SelectItem>
                            <SelectItem value="venue_management">Venue Management</SelectItem>
                            <SelectItem value="production_company">Production Company</SelectItem>
                            <SelectItem value="independent_planner">Independent Event Planner</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                            <SelectItem value="new_to_luxury">New to Luxury Events</SelectItem>
                            <SelectItem value="1_3_years">1-3 Years Luxury Experience</SelectItem>
                            <SelectItem value="3_5_years">3-5 Years Luxury Experience</SelectItem>
                            <SelectItem value="5_plus_years">5+ Years Luxury Experience</SelectItem>
                            <SelectItem value="established_luxury">Established Luxury Event Provider</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Event Capacity *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select capacity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="small_events">Small Events (10-50 guests)</SelectItem>
                            <SelectItem value="medium_events">Medium Events (50-150 guests)</SelectItem>
                            <SelectItem value="large_events">Large Events (150-500 guests)</SelectItem>
                            <SelectItem value="mega_events">Mega Events (500+ guests)</SelectItem>
                            <SelectItem value="all_sizes">All Event Sizes</SelectItem>
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
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Typical Event Budget Range *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-gray-700 text-white">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            <SelectItem value="10k_25k">$10,000 - $25,000</SelectItem>
                            <SelectItem value="25k_50k">$25,000 - $50,000</SelectItem>
                            <SelectItem value="50k_100k">$50,000 - $100,000</SelectItem>
                            <SelectItem value="100k_250k">$100,000 - $250,000</SelectItem>
                            <SelectItem value="250k_plus">$250,000+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="eventTypes"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-white">Event Types * (Select all that apply)</FormLabel>
                      <div className="grid md:grid-cols-2 gap-3">
                        {eventTypes.map((type) => (
                          <FormField
                            key={type.id}
                            control={form.control}
                            name="eventTypes"
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
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Portfolio/Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourportfolio.com" className="bg-black/50 border-gray-700 text-white" />
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
                          placeholder="Tell us more about your event planning experience, specialties, or any unique services you offer..."
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
                    {submitApplication.isPending ? "Submitting..." : "Submit Event Provider Application"}
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