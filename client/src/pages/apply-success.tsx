import { motion } from "framer-motion";
import { CheckCircle, Home, Calendar, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function ApplySuccess() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl text-white mb-2">Application Submitted Successfully!</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Welcome to Miami Beach Yacht Club
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-gray-300">
                  Thank you for your membership application. Our team will review your submission and contact you within 48 hours.
                </p>
                <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-600/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">What happens next?</h3>
                  <ul className="text-sm text-gray-300 space-y-2 text-left">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      Application review by our membership committee (24-48 hours)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      Background and financial verification process
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      Personal interview with membership director (if approved)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      Welcome package and yacht orientation
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Questions?</h4>
                  <p className="text-sm text-gray-400">Call us at</p>
                  <p className="text-sm text-purple-400">786-981-3875</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Schedule Tour</h4>
                  <p className="text-sm text-gray-400">Book a private</p>
                  <p className="text-sm text-purple-400">yacht tour</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">Learn More</h4>
                  <p className="text-sm text-gray-400">Explore our</p>
                  <p className="text-sm text-purple-400">club features</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                <Link href="/book-tour" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Private Tour
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}