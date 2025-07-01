import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/navigation';
import { VideoHeader } from '@/components/video-header';
import { VideoCTA } from '@/components/video-cta';
import { VideoFooter } from '@/components/video-footer';
import { Footer } from '@/components/footer';
import { ApplicationModal } from '@/components/application-modal';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Anchor } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Contact info
const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    content: '786-981-3875',
    subtext: '24/7 Concierge Service',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'membership@mbyc.miami',
    subtext: 'Response within 2 hours',
  },
  {
    icon: MapPin,
    title: 'Address',
    content: '300 Alton Road, Suite 305b',
    subtext: 'Miami Beach, Florida 33139',
  },
  {
    icon: Clock,
    title: 'Hours',
    content: 'Mon-Fri: 9am-6pm',
    subtext: 'Sat: 10am-6pm, Sun: 10am-5pm',
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: 'Message Sent!',
      description: 'We\'ll get back to you within 2 hours.',
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Video Header */}
      <VideoHeader 
        title="Get in Touch"
        subtitle="Have questions about membership or want to schedule a visit? Our team is here to help you discover the MBYC experience."
      />

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                <p className="text-white font-medium">{info.content}</p>
                <p className="text-gray-400 text-sm">{info.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Send us a Message</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500"
                            placeholder="John Doe"
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
                        <FormLabel className="text-white">Phone (Optional)</FormLabel>
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
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Subject</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/50 border-white/20 text-white">
                              <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20">
                            <SelectItem value="membership">Membership Inquiry</SelectItem>
                            <SelectItem value="booking">Booking Support</SelectItem>
                            <SelectItem value="tour">Schedule a Tour</SelectItem>
                            <SelectItem value="corporate">Corporate Partnership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 min-h-[120px]"
                            placeholder="Tell us how we can help..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>
              </Form>
            </motion.div>

            {/* Map/Image Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex flex-col justify-center"
            >
              <MessageSquare className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Premium Concierge Service
              </h3>
              <p className="text-gray-400 mb-6">
                Our dedicated concierge team is available 24/7 to assist with all your 
                yachting needs. From booking assistance to special requests, we're here 
                to ensure your MBYC experience exceeds expectations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Immediate response for urgent matters</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Multilingual support available</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">Dedicated account managers for Platinum members</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA onApplyClick={() => setIsApplicationModalOpen(true)} />
      
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