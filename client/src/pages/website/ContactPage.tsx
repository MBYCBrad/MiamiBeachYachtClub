import React, { useState } from 'react';
import { motion } from 'framer-motion';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a server
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white mb-6">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Experience the luxury of Miami Beach Yacht Club
            </p>
          </motion.div>

          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-black to-black" />
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                repeatType: 'reverse' 
              }}
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 50%)',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-thin text-white mb-8">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="+1 (305) 555-0123"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="">Select a subject</option>
                        <option value="membership">Membership Inquiry</option>
                        <option value="booking">Booking Question</option>
                        <option value="events">Event Information</option>
                        <option value="corporate">Corporate Services</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-3"
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-4xl font-thin text-white mb-8">Visit Our Marina</h2>
                  <p className="text-gray-400 mb-8">
                    Experience the ultimate in luxury yachting at our state-of-the-art marina facility in the heart of Miami Beach.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-6 bg-gray-950 border border-gray-800 rounded-xl"
                  >
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Marina Location</h3>
                      <p className="text-gray-400">
                        Miami Beach Marina<br />
                        300 Alton Road<br />
                        Miami Beach, FL 33139
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-6 bg-gray-950 border border-gray-800 rounded-xl"
                  >
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Phone</h3>
                      <p className="text-gray-400">
                        Main: +1 (305) 555-1234<br />
                        Concierge: +1 (305) 555-5678
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-6 bg-gray-950 border border-gray-800 rounded-xl"
                  >
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Email</h3>
                      <p className="text-gray-400">
                        Info: info@miamibeachyachtclub.com<br />
                        Members: members@miamibeachyachtclub.com
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-6 bg-gray-950 border border-gray-800 rounded-xl"
                  >
                    <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">Marina Hours</h3>
                      <p className="text-gray-400">
                        Monday - Friday: 8:00 AM - 8:00 PM<br />
                        Saturday - Sunday: 7:00 AM - 9:00 PM<br />
                        24/7 Concierge Service for Members
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 px-4 bg-gradient-to-t from-gray-950 to-black">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-5xl font-thin text-white mb-6">
                Find Us at Miami Beach Marina
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Your gateway to luxury yachting experiences
              </p>
              
              {/* Map Placeholder */}
              <div className="relative h-96 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-400">Interactive map coming soon</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </WebsiteLayout>
  );
}