import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/navigation';
import { Calendar, Clock, Users, MapPin, Check, ChevronRight, Sparkles, Anchor, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const tourFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTime: z.string().min(1, 'Please select a preferred time'),
  groupSize: z.string().min(1, 'Please select group size'),
  interests: z.string().optional(),
  specialRequests: z.string().optional(),
});

type TourFormData = z.infer<typeof tourFormSchema>;

// Animated background effect
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/20" />
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 30 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Tour benefits section
function TourBenefits() {
  const benefits = [
    {
      icon: Anchor,
      title: 'Fleet Walkthrough',
      description: 'Experience our entire collection of luxury yachts'
    },
    {
      icon: Users,
      title: 'Meet the Crew',
      description: 'Get introduced to our professional captains and staff'
    },
    {
      icon: MapPin,
      title: 'Marina Tour',
      description: 'Explore our exclusive Miami Beach marina facilities'
    },
    {
      icon: Sparkles,
      title: 'Membership Benefits',
      description: 'Learn about exclusive perks and experiences'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {benefits.map((benefit, index) => (
        <motion.div
          key={benefit.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
        >
          <benefit.icon className="w-12 h-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
          <p className="text-gray-400">{benefit.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function BookTourPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<TourFormData>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      groupSize: '',
      interests: '',
      specialRequests: '',
    },
  });

  const onSubmit = async (data: TourFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Tour Request Submitted!',
      description: 'We\'ll contact you within 24 hours to confirm your private tour.',
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Book a Private Tour
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the luxury of Miami Beach Yacht Club firsthand. Schedule your exclusive 
              tour and discover a world of maritime excellence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tour Benefits */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            What's Included in Your Tour
          </motion.h2>
          <TourBenefits />
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="relative py-16 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Schedule Your Exclusive Tour
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                            placeholder="John"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                            placeholder="Doe"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid md:grid-cols-2 gap-6">
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
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                            placeholder="john@example.com"
                          />
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
                        <FormLabel className="text-white">Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tour Details */}
                <div className="grid md:grid-cols-3 gap-6">
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
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                            <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                            <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                            <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                            <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                            <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select size" />
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

                {/* Interests */}
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">What interests you most? (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                          placeholder="Tell us about your yachting interests, preferred yacht sizes, or specific experiences you're looking for..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Special Requests */}
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Special Requests (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                          placeholder="Any special accommodations or specific questions you'd like addressed during your tour..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Schedule Tour
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </Form>

            {/* Contact Info */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-center text-gray-400 mb-6">
                Prefer to speak with someone directly?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+13055551234"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +1 (305) 555-1234
                </a>
                <a
                  href="mailto:tours@mbyc.com"
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  tours@mbyc.com
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}