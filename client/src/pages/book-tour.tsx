import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
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

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Prefer to Schedule by Phone?</h3>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <a href="tel:+17869813875" className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors">
                <Phone className="w-5 h-5" />
                <span className="text-lg">786-981-3875</span>
              </a>
              <a href="mailto:membership@mbyc.miami" className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="text-lg">membership@mbyc.miami</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}