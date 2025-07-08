import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MapPin, Clock, Users, Ticket, Download, Star, PlayCircle, Eye, FileText, QrCode } from "lucide-react";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import mbycLogoWhite from '@/assets/mbyc-logo-white.png';
import type { MediaAsset, Event } from '@shared/schema';

interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  ticketCount: number;
  totalPrice: string;
  registrationDate: string;
  specialRequests?: string;
  confirmationCode?: string;
  status: string;
  createdAt: string;
  guestDetails: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    location: string;
    imageUrl?: string;
    ticketPrice: string;
    capacity: number;
    category: string;
  };
}

interface MyEventsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MyEvents({ currentView, setCurrentView }: MyEventsProps) {
  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const { data: eventRegistrations, isLoading, error } = useQuery({
    queryKey: ["/api/event-registrations"],
  });

  // Fetch all events to get event details
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events']
  });

  // Safe data handling with extensive error checking
  const registrations = Array.isArray(eventRegistrations) ? eventRegistrations as EventRegistration[] : [];

  // Helper function to get event details by ID
  const getEventById = (eventId: number) => {
    return events.find(event => event.id === eventId);
  };

  // Debug logging
  console.log("Event registrations data:", eventRegistrations);
  console.log("Processed registrations:", registrations);
  console.log("Events data:", events);

  // Generate unique confirmation code (fallback if not in database)
  const generateConfirmationCode = (registrationId: number, eventId: number) => {
    const prefix = "MBYC";
    const timestamp = Date.now().toString().slice(-6);
    const regId = registrationId.toString().padStart(3, '0');
    const evId = eventId.toString().padStart(2, '0');
    return `${prefix}-${evId}${regId}-${timestamp}`;
  };

  // Get confirmation code from database or generate fallback
  const getConfirmationCode = (registration: EventRegistration) => {
    return registration.confirmationCode || generateConfirmationCode(registration.id, registration.eventId);
  };

  // Generate QR code data URL
  const generateQRCode = (data: string) => {
    // Simple QR code generation using a library-free approach
    // For production, you'd use a proper QR code library
    const qrData = encodeURIComponent(data);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
  };

  // Add state to prevent multiple clicks
  const [downloadingTickets, setDownloadingTickets] = useState<Set<number>>(new Set());

  // Apple-style PDF ticket generation with QR code
  const downloadTicket = async (registration: EventRegistration, event: Event | undefined) => {
    if (!event) {
      console.error('No event data available for ticket download');
      return;
    }
    
    // Prevent multiple downloads at the same time
    if (downloadingTickets.has(registration.id)) {
      console.log('Download already in progress for registration:', registration.id);
      return;
    }
    
    // Mark as downloading
    setDownloadingTickets(prev => new Set(prev).add(registration.id));
    
    try {
      console.log('Starting Apple-style ticket download for:', event.title);
      const confirmationCode = getConfirmationCode(registration);
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Apple-style colors
      const purple = [147, 51, 234]; // purple-600
      const blue = [79, 70, 229]; // indigo-600
      const black = [0, 0, 0];
      const darkGray = [55, 65, 81]; // gray-700
      const mediumGray = [107, 114, 128]; // gray-500
      const lightGray = [156, 163, 175]; // gray-400
      const white = [255, 255, 255];
      
      // Create smooth gradient header (purple to blue) - no lines
      const headerHeight = 80;
      const gradientSteps = 50;
      const stepHeight = headerHeight / gradientSteps;
      
      for (let i = 0; i < gradientSteps; i++) {
        const ratio = i / gradientSteps;
        const r = Math.round(purple[0] + (blue[0] - purple[0]) * ratio);
        const g = Math.round(purple[1] + (blue[1] - purple[1]) * ratio);
        const b = Math.round(purple[2] + (blue[2] - purple[2]) * ratio);
        
        doc.setFillColor(r, g, b);
        doc.rect(0, i * stepHeight, 210, stepHeight, 'F');
      }
      
      // Try to load and add logo with Promise
      console.log('Loading MBYC logo...');
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log('Logo load timeout');
            resolve(); // Don't reject, just continue without logo
          }, 2000);
          
          img.onload = () => {
            clearTimeout(timeout);
            try {
              console.log('Adding logo to PDF');
              doc.addImage(img, 'PNG', 85, 15, 40, 20);
              resolve();
            } catch (error) {
              console.error('Error adding logo:', error);
              resolve(); // Continue without logo
            }
          };
          
          img.onerror = () => {
            clearTimeout(timeout);
            console.error('Logo failed to load');
            resolve(); // Continue without logo
          };
          
          img.src = mbycLogoWhite;
        });
      } catch (logoError) {
        console.error('Logo loading error:', logoError);
        // Continue without logo
      }
      
      // Always add header text (whether logo loaded or not)
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('MIAMI BEACH YACHT CLUB', 105, 35, { align: 'center' });
      doc.setFontSize(18);
      doc.setFont('helvetica', 'normal');
      doc.text('Event Ticket', 105, 60, { align: 'center' });
      
      // Main content
      const contentStartY = 100;
      const leftMargin = 30;
      const sectionSpacing = 40;
      let currentY = contentStartY;
      
      // Event Details Section
      doc.setTextColor(black[0], black[1], black[2]);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Event Details', leftMargin, currentY);
      currentY += 20;
      
      // Event name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(event.title, leftMargin, currentY);
      currentY += 20;
      
      // Date and time info - Apple style
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      const dateText = event.startTime ? format(new Date(event.startTime), 'MMMM dd, yyyy') : 'TBA';
      doc.text(dateText, leftMargin, currentY);
      currentY += 12;
      
      const timeText = event.startTime ? format(new Date(event.startTime), 'h:mm a') : 'TBA';
      const endTimeText = event.endTime ? ` - ${format(new Date(event.endTime), 'h:mm a')}` : '';
      doc.text(timeText + endTimeText, leftMargin, currentY);
      currentY += 12;
      
      doc.text(event.location, leftMargin, currentY);
      currentY += sectionSpacing;
      
      // Registration Details Section
      doc.setTextColor(black[0], black[1], black[2]);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Registration Details', leftMargin, currentY);
      currentY += 20;
      
      // Registration info - clean Apple style
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      
      doc.text(`${registration.ticketCount} Ticket${registration.ticketCount > 1 ? 's' : ''}`, leftMargin, currentY);
      currentY += 12;
      
      doc.text(`Total: $${registration.totalPrice}`, leftMargin, currentY);
      currentY += 12;
      
      doc.text(`ID: ${registration.id}`, leftMargin, currentY);
      currentY += 20;
      
      // Confirmation code - prominent purple styling
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(purple[0], purple[1], purple[2]);
      doc.text(confirmationCode, leftMargin, currentY);
      currentY += 30;
      
      // Try to add QR code
      try {
        const qrCodeUrl = generateQRCode(confirmationCode);
        console.log('Loading QR code...');
        
        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.log('QR code load timeout');
            resolve();
          }, 2000);
          
          qrImg.onload = () => {
            clearTimeout(timeout);
            try {
              console.log('Adding QR code to PDF');
              doc.addImage(qrImg, 'PNG', 140, contentStartY + 40, 50, 50);
              doc.setFontSize(12);
              doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
              doc.setFont('helvetica', 'normal');
              doc.text('Scan for verification', 165, contentStartY + 100, { align: 'center' });
            } catch (error) {
              console.error('Error adding QR code:', error);
            }
            resolve();
          };
          
          qrImg.onerror = () => {
            clearTimeout(timeout);
            console.error('QR code failed to load');
            resolve();
          };
          
          qrImg.src = qrCodeUrl;
        });
      } catch (qrError) {
        console.error('QR code error:', qrError);
        // Continue without QR code
      }
      
      // Footer
      doc.setFontSize(11);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.text('Please present this ticket at the event entrance', leftMargin, 260);
      doc.text('We look forward to seeing you at the event!', leftMargin, 275);
      doc.text('- MBYC Team', leftMargin, 290);
      
      // Save PDF
      console.log('Saving Apple-style PDF...');
      doc.save(`MBYC_Event_Ticket_${event.title.replace(/\s+/g, '_')}_${registration.id}.pdf`);
      console.log('Apple-style PDF saved successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Show alert to user
      alert('Error generating PDF. Please try again.');
    } finally {
      // Always clear downloading state
      setDownloadingTickets(prev => {
        const newSet = new Set(prev);
        newSet.delete(registration.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Events</h2>
            <p className="text-gray-400">{error.message || 'Unable to load event registrations'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          {heroVideo?.url && (
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={heroVideo.url} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
          {/* Enhanced bottom blur transition */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent backdrop-blur-sm" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <PlayCircle className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-80" />
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Events
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Track your event registrations and upcoming experiences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards - positioned below video */}
      <div className="relative -mt-16 z-30 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="container mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-xl font-bold text-purple-400">{registrations.length}</div>
              <div className="text-xs text-gray-300">Events</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-500/20">
              <div className="text-xl font-bold text-purple-400">
                {registrations.reduce((sum, reg) => sum + (reg.ticketCount || 0), 0)}
              </div>
              <div className="text-xs text-gray-300">Tickets</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 text-center border border-purple-500/20 col-span-2 md:col-span-1">
              <div className="text-xl font-bold text-purple-400">
                ${registrations.reduce((sum, reg) => sum + parseFloat(reg.totalPrice || '0'), 0).toFixed(0)}
              </div>
              <div className="text-xs text-gray-300">Total Spent</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 pb-24 relative z-10">
        {registrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Ticket className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-300">No Events Registered</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't registered for any events yet. Explore our upcoming events and join exciting experiences!
            </p>
            <Button
              onClick={() => setCurrentView('explore')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Browse Events
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">

            {/* Event Registration Cards */}
            <div className="space-y-6">
              {registrations.map((registration, index) => {
                // Safety check for registration data
                if (!registration || !registration.id) {
                  console.warn("Invalid registration data:", registration);
                  return null;
                }
                
                const event = getEventById(registration.eventId);
                return (
                  <motion.div
                    key={registration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                  <Card className="bg-gray-900/50 border-gray-700 hover:border-purple-600/50 transition-all duration-300 rounded-lg overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row h-full">
                        {/* Event Image */}
                        <div className="lg:w-1/3">
                          <img
                            src={event?.imageUrl || '/api/media/pexels-mali-42092_1750537277229.jpg'}
                            alt={event?.title || 'Event'}
                            className="w-full h-48 lg:h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none"
                          />
                        </div>

                        {/* Event Details */}
                        <div className="lg:w-2/3 p-6">
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-2">
                                    {event?.title || 'Event'}
                                  </h3>
                                  <Badge 
                                    variant="outline" 
                                    className="border-purple-600 text-purple-400 mb-3"
                                  >
                                    Event
                                  </Badge>
                                </div>
                                <Badge 
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                >
                                  Registered
                                </Badge>
                              </div>

                              <p className="text-gray-300 mb-4 line-clamp-2">
                                {event?.description || 'Event details not available'}
                              </p>

                              {/* Event Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {(() => {
                                      try {
                                        if (event?.startTime) {
                                          const date = new Date(event.startTime);
                                          return isNaN(date.getTime()) ? 'TBA' : format(date, 'MMM dd, yyyy');
                                        }
                                        return 'TBA';
                                      } catch (error) {
                                        return 'TBA';
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {(() => {
                                      try {
                                        if (event?.startTime) {
                                          const date = new Date(event.startTime);
                                          return isNaN(date.getTime()) ? 'TBA' : format(date, 'h:mm a');
                                        }
                                        return 'TBA';
                                      } catch (error) {
                                        return 'TBA';
                                      }
                                    })()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <MapPin className="w-4 h-4" />
                                  <span>{event?.location || 'Location TBA'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                  <Ticket className="w-4 h-4" />
                                  <span>{registration.ticketCount || 1} {(registration.ticketCount || 1) === 1 ? 'Ticket' : 'Tickets'}</span>
                                </div>
                              </div>

                              {/* Registration Details */}
                              <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                <h4 className="font-semibold text-white mb-2">Registration Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-400">Tickets: </span>
                                    <span className="text-white">{registration.ticketCount || 1}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Total Price: </span>
                                    <span className="text-white">${registration.totalPrice || '0.00'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Status: </span>
                                    <span className="text-white capitalize">{registration.status || 'Pending'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Registered: </span>
                                    <span className="text-white">
                                      {(() => {
                                        try {
                                          if (registration.createdAt) {
                                            const date = new Date(registration.createdAt);
                                            return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
                                          }
                                          return 'N/A';
                                        } catch (error) {
                                          return 'N/A';
                                        }
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                {registration.specialRequests && (
                                  <div className="mt-2">
                                    <span className="text-gray-400">Special Requests: </span>
                                    <span className="text-white">{registration.specialRequests}</span>
                                  </div>
                                )}
                              </div>

                              {/* Pricing */}
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                  ${registration.event?.ticketPrice || '0'} x {registration.ticketCount || 1} tickets
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                  ${registration.totalPrice || '0'}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex lg:flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                onClick={() => downloadTicket(registration, event)}
                                disabled={downloadingTickets.has(registration.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadingTickets.has(registration.id) ? 'Downloading...' : 'Download Ticket'}
                              </Button>
                              
                              {/* View Ticket Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Ticket
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black border-gray-700 max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-white text-2xl">Event Ticket</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {/* Ticket Header */}
                                    <div className="text-center border-b border-gray-700 pb-4">
                                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                        MIAMI BEACH YACHT CLUB
                                      </h2>
                                      <p className="text-gray-400 mt-2">Event Ticket</p>
                                    </div>
                                    
                                    {/* Ticket Content */}
                                    <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm text-gray-400">Event</label>
                                          <p className="text-white font-semibold">{event?.title}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Date</label>
                                          <p className="text-white font-semibold">
                                            {event?.startTime ? format(new Date(event.startTime), 'MMMM dd, yyyy') : 'TBA'}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Time</label>
                                          <p className="text-white font-semibold">
                                            {event?.startTime ? format(new Date(event.startTime), 'h:mm a') : 'TBA'}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Location</label>
                                          <p className="text-white font-semibold">{event?.location}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Tickets</label>
                                          <p className="text-white font-semibold">{registration.ticketCount}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm text-gray-400">Total Price</label>
                                          <p className="text-white font-semibold">${registration.totalPrice}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="border-t border-gray-700 pt-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="grid grid-cols-1 gap-2">
                                              <div>
                                                <label className="text-sm text-gray-400">Registration ID</label>
                                                <p className="text-white font-mono">{registration.id}</p>
                                              </div>
                                              <div>
                                                <label className="text-sm text-gray-400">Confirmation Code</label>
                                                <p className="text-white font-mono text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                  {getConfirmationCode(registration)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-center gap-2">
                                            <img 
                                              src={generateQRCode(getConfirmationCode(registration))}
                                              alt="QR Code" 
                                              className="w-20 h-20 border border-gray-600 rounded"
                                            />
                                            <span className="text-xs text-gray-400">Scan at entrance</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2 pt-4">
                                      <Button
                                        onClick={() => downloadTicket(registration, event)}
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                        disabled={downloadingTickets.has(registration.id)}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        {downloadingTickets.has(registration.id) ? 'Downloading...' : 'Download Ticket'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* View Event Dialog */}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Event
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-white text-2xl">Event Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    {/* Event Image */}
                                    {event?.imageUrl && (
                                      <div className="w-full h-64 rounded-lg overflow-hidden">
                                        <img
                                          src={event.imageUrl}
                                          alt={event.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Event Info */}
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="text-3xl font-bold text-white mb-2">{event?.title}</h3>
                                        <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                          Event
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-gray-300 text-lg">{event?.description}</p>
                                      
                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-purple-400" />
                                            <div>
                                              <p className="text-sm text-gray-400">Date</p>
                                              <p className="text-white font-semibold">
                                                {event?.startTime ? format(new Date(event.startTime), 'MMMM dd, yyyy') : 'TBA'}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-purple-400" />
                                            <div>
                                              <p className="text-sm text-gray-400">Time</p>
                                              <p className="text-white font-semibold">
                                                {event?.startTime ? format(new Date(event.startTime), 'h:mm a') : 'TBA'}
                                                {event?.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                          <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-purple-400" />
                                            <div>
                                              <p className="text-sm text-gray-400">Location</p>
                                              <p className="text-white font-semibold">{event?.location}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-purple-400" />
                                            <div>
                                              <p className="text-sm text-gray-400">Capacity</p>
                                              <p className="text-white font-semibold">{event?.capacity} guests</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="bg-gray-800/50 rounded-lg p-4">
                                        <h4 className="font-semibold text-white mb-2">Your Registration</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <span className="text-gray-400">Tickets: </span>
                                            <span className="text-white">{registration.ticketCount}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">Total Paid: </span>
                                            <span className="text-white">${registration.totalPrice}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">Registration ID: </span>
                                            <span className="text-white font-mono">{registration.id}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">Status: </span>
                                            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                                              {registration.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}