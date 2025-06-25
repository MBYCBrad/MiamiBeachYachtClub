import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function LogoutPage() {
  const [, setLocation] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      setLocation('/auth');
    }
  };

  const handleCancel = () => {
    // Redirect back based on user role
    if (user?.role === 'Admin') {
      setLocation('/admin');
    } else if (user?.role?.startsWith('Staff')) {
      setLocation('/staff-portal');
    } else if (user?.role === 'Yacht Owner') {
      setLocation('/yacht-owner');
    } else if (user?.role === 'Service Provider') {
      setLocation('/service-provider');
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Sign Out
          </CardTitle>
          <p className="text-gray-400 mt-2">
            Are you sure you want to sign out of your account?
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Session Info */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-gray-400 text-sm">
                  {user?.role} {user?.role === 'Member' && user?.membershipTier && `• ${user.membershipTier}`}
                </p>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Your session will be securely terminated</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>All cached data will be cleared</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Account security maintained</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}