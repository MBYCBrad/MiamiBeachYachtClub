import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { ApplicationModal } from "@/components/application-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCreateTourRequest } from "@/hooks/use-tour-requests";
import { insertTourRequestSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Create a simplified form schema that matches our form needs
const tourFormSchema = z.object({
  fullName: z.string().min(1, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Please enter your phone number"),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().min(1, "Please select a preferred time"),
  groupSize: z.string().min(1, "Please select group size"),
  message: z.string().optional(),
});

type TourFormData = z.infer<typeof tourFormSchema>;

export default function BookTourPage() {
  const { toast } = useToast();
  const createTourRequest = useCreateTourRequest();
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  
  // Get hero video for the video footer
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });
  
  const form = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      preferredDate: "",
      preferredTime: "",
      groupSize: "",
      message: "",
    },
  });

  const onSubmit = async (data: TourFormData) => {
    try {
      // Convert form data to match the database schema
      const tourRequestData = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        preferredDate: data.preferredDate, // Keep as string to match database
        preferredTime: data.preferredTime,
        groupSize: data.groupSize, // Keep as string to match database
        message: data.message || null,
      };

      await createTourRequest.mutateAsync(tourRequestData);
      
      toast({
        title: "Tour Request Submitted!",
        description: "We'll contact you within 24 hours to confirm your private tour.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit tour request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Book a Private Tour" 
        subtitle="Experience Miami Beach Yacht Club firsthand"
      />

      {/* Tour Info Section */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">60 Minutes</h3>
              <p className="text-gray-400">Comprehensive tour of our facilities and fleet</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Miami Beach Marina</h3>
              <p className="text-gray-400">Tour our exclusive dock facilities</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Personal Guide</h3>
              <p className="text-gray-400">Led by our membership specialists</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Flexible Scheduling</h3>
              <p className="text-gray-400">Available 7 days a week</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tour Form Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Request Your Private Tour</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="John Doe"
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                          />
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
                        <FormLabel className="text-white">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="john@example.com"
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="+1 (305) 555-0123"
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Group Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select group size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="1">Just me</SelectItem>
                            <SelectItem value="2">2 people</SelectItem>
                            <SelectItem value="3-4">3-4 people</SelectItem>
                            <SelectItem value="5+">5+ people</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Preferred Date</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date"
                            className="bg-black/50 border-white/20 text-white"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="morning">Morning (9:00 AM - 12:00 PM)</SelectItem>
                            <SelectItem value="afternoon">Afternoon (12:00 PM - 4:00 PM)</SelectItem>
                            <SelectItem value="evening">Evening (4:00 PM - 8:00 PM)</SelectItem>
                            <SelectItem value="flexible">Flexible</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Interests Selection */}
                <div className="space-y-4">
                  <FormLabel className="text-white text-lg">What interests you most? (Select all that apply)</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      "Yacht Features",
                      "Charter Options", 
                      "Membership Packages",
                      "Fleet Overview",
                      "Pricing Information",
                      "Amenities & Services",
                      "Investment Opportunities",
                      "Event Hosting"
                    ].map((interest) => (
                      <FormField
                        key={interest}
                        control={form.control}
                        name="interests"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={interest}
                              checked={field.value?.includes(interest) || false}
                              onChange={(e) => {
                                const currentInterests = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...currentInterests, interest]);
                                } else {
                                  field.onChange(currentInterests.filter((i: string) => i !== interest));
                                }
                              }}
                              className="w-4 h-4 text-purple-600 bg-black/50 border-white/20 rounded focus:ring-purple-500"
                            />
                            <label htmlFor={interest} className="text-white text-sm cursor-pointer">
                              {interest}
                            </label>
                          </div>
                        )}
                      />
                    ))}
                  </div>
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
                          placeholder="Tell us about your interest in MBYC membership..."
                          className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Submit Tour Request
                </Button>
              </form>
            </Form>
          </motion.div>

          {/* Contact Info with Video Background */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            {/* Video Footer Cover within Contact Section */}
            <div className="relative h-[40vh] min-h-[300px] overflow-hidden rounded-2xl">
              {/* Video Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src="/api/media/video/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
              </video>
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/70" />
              
              {/* Enhanced gradient blur from black at top - stronger blend */}
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-transparent" />
              
              {/* Additional top blur for seamless blend */}
              <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
              
              {/* 3D Anamorphic Edges */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top Edge - Deeper for mobile */}
                <div className="absolute top-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-b from-black/40 to-transparent" />
                
                {/* Bottom Edge - Deeper for mobile */}
                <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Left Edge - Narrower */}
                <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
                
                {/* Right Edge - Narrower */}
                <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
              </div>

              {/* CTA Content Overlay */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Ready to Start Your Journey?
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Join Miami Beach Yacht Club today and experience luxury yachting like never before.
                  </p>
                  <button 
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Apply for Membership
                  </button>
                </div>
              </div>

              {/* Footer Content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full text-white">
                  {/* Logo Section */}
                  <div className="flex flex-col items-start">
                    <img 
                      src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
                      alt="Miami Beach Yacht Club"
                      className="h-12 w-auto mb-3"
                    />
                    <p className="text-gray-300 text-sm">
                      Where luxury meets the ocean
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                      <li><a href="/fleet" className="text-gray-300 hover:text-white transition-colors text-sm">Our Fleet</a></li>
                      <li><a href="/events" className="text-gray-300 hover:text-white transition-colors text-sm">Events</a></li>
                      <li><a href="/services" className="text-gray-300 hover:text-white transition-colors text-sm">Membership</a></li>
                    </ul>
                  </div>

                  {/* Company */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Company</h3>
                    <ul className="space-y-2">
                      <li><a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">About Us</a></li>
                      <li><a href="/invest" className="text-gray-300 hover:text-white transition-colors text-sm">Investors</a></li>
                      <li><a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">Careers</a></li>
                    </ul>
                  </div>

                  {/* Contact & Hours */}
                  <div>
                    <h3 className="text-white font-semibold mb-4">Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <a href="tel:+17869813875" className="text-gray-300 hover:text-white transition-colors text-sm">
                          786-981-3875
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-purple-400 mt-0.5" />
                        <a href="mailto:membership@mbyc.miami" className="text-gray-300 hover:text-white transition-colors text-sm">
                          membership@mbyc.miami
                        </a>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-gray-300 text-sm">
                          300 Alton Road, Suite 305b
                        </span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-white font-semibold mb-2 text-sm">Opening Hours</h4>
                      <div className="space-y-1 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Mon - Fri:</span>
                          <span>9am - 6pm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sat:</span>
                          <span>10am - 6pm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sun:</span>
                          <span>10am - 5pm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen} 
          onClose={() => setIsApplicationModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
}