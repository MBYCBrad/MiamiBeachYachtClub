import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Phone, MessageSquare, CheckCircle, AlertCircle, Timer, Users, Star, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ServiceExperienceModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ServiceExperienceModal({ booking, isOpen, onClose }: ServiceExperienceModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Beauty & Grooming': return '💄';
      case 'Culinary': return '🍽️';
      case 'Wellness & Spa': return '🧘';
      case 'Photography & Media': return '📸';
      case 'Entertainment': return '🎭';
      case 'Water Sports': return '🏄';
      case 'Concierge & Lifestyle': return '🏆';
      default: return '✨';
    }
  };

  const experienceSteps = [
    {
      id: 1,
      title: "Service Confirmed",
      description: "Your service has been confirmed and scheduled",
      icon: <CheckCircle className="w-5 h-5" />,
      status: "completed"
    },
    {
      id: 2,
      title: "Preparation Phase",
      description: "Get ready for your service experience",
      icon: <AlertCircle className="w-5 h-5" />,
      status: booking.status === 'pending' ? "current" : "completed"
    },
    {
      id: 3,
      title: "Service Experience",
      description: "Enjoy your premium service",
      icon: <Timer className="w-5 h-5" />,
      status: booking.status === 'in_progress' ? "current" : booking.status === 'completed' ? "completed" : "upcoming"
    },
    {
      id: 4,
      title: "Experience Complete",
      description: "Service completed - rate your experience",
      icon: <Star className="w-5 h-5" />,
      status: booking.status === 'completed' ? "current" : "upcoming"
    }
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Service Overview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-2xl">
              {getCategoryIcon(booking.service.category)}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{booking.service.name}</h3>
              <p className="text-gray-300 text-sm mb-3">{booking.service.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-purple-600 text-purple-400">
                  {booking.service.category}
                </Badge>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {booking.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-semibold text-white mb-4">Your Booking Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Service Date</p>
                <p className="text-white font-medium">{format(new Date(booking.scheduledDate), 'PPP')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Service Time</p>
                <p className="text-white font-medium">{format(new Date(booking.scheduledDate), 'h:mm a')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-white font-medium">{booking.service.duration} hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Service ID</p>
                <p className="text-white font-medium">#{booking.id}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Provider */}
      {booking.service.provider && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <h4 className="font-semibold text-white mb-4">Your Service Provider</h4>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{booking.service.provider.username.charAt(0)}</span>
              </div>
              <div>
                <h5 className="font-medium text-white">{booking.service.provider.username}</h5>
                <p className="text-sm text-gray-400">Professional Service Provider</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Provider
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/20"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-semibold text-white mb-4">Preparation Instructions</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">1</div>
              <div>
                <h5 className="font-medium text-white">Arrive 15 minutes early</h5>
                <p className="text-sm text-gray-400">Please arrive at the marina 15 minutes before your scheduled service time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">2</div>
              <div>
                <h5 className="font-medium text-white">Bring valid ID</h5>
                <p className="text-sm text-gray-400">You'll need to present a valid ID for security verification</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">3</div>
              <div>
                <h5 className="font-medium text-white">Dress appropriately</h5>
                <p className="text-sm text-gray-400">Wear comfortable clothing suitable for yacht activities</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-semibold text-white mb-4">Location & Meeting Point</h4>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-purple-400 mt-1" />
            <div>
              <p className="text-white font-medium">Miami Beach Marina</p>
              <p className="text-sm text-gray-400">Dock 12, Gate A - Marina Reception</p>
              <p className="text-sm text-gray-400 mt-2">Your service provider will meet you at the reception area</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <h4 className="font-semibold text-white mb-4">Service Experience Timeline</h4>
          <div className="space-y-4">
            {experienceSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-600' : 
                  step.status === 'current' ? 'bg-purple-600' : 
                  'bg-gray-600'
                }`}>
                  {step.icon}
                </div>
                <div>
                  <h5 className={`font-medium ${
                    step.status === 'current' ? 'text-purple-400' : 'text-white'
                  }`}>
                    {step.title}
                  </h5>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-600/50">
        <CardContent className="p-6">
          <h4 className="font-semibold text-white mb-2">Ready to Begin?</h4>
          <p className="text-sm text-gray-300 mb-4">
            Your service is confirmed and ready to start. Contact your provider if you need any assistance.
          </p>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Provider
            </Button>
            <Button
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      default: return renderStep1();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black border-gray-700 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Service Experience
          </DialogTitle>
        </DialogHeader>
        
        {/* Step Navigation */}
        <div className="flex-shrink-0 flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep === step
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {step}
            </button>
          ))}
        </div>

        {/* Step Titles */}
        <div className="flex-shrink-0 text-center mb-6">
          <h3 className="text-lg font-semibold text-white">
            {currentStep === 1 && "Service Overview"}
            {currentStep === 2 && "Preparation Guide"}
            {currentStep === 3 && "Experience Timeline"}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentStep()}
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex-shrink-0 flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Previous
          </Button>
          
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}