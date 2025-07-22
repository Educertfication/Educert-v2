import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useAppStore } from '../lib/store';
import { User, Building2, CheckCircle } from 'lucide-react';

type AccountType = 'student' | 'institution';

interface RegistrationForm {
  name: string;
  email: string;
  description?: string;
}

export default function Register() {
  const { addNotification } = useAppStore();
  const [accountType, setAccountType] = useState<AccountType>('student');
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    email: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    
    try {
      // Simulate registration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: `Your ${accountType} account has been created successfully!`
      });
      
      setIsSuccess(true);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: 'There was an error creating your account. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h2>
            <p className="text-gray-600 mb-6">
              Your {accountType} account has been created successfully. You can now access the platform.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Account</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join the blockchain-powered educational certificate platform. 
            Register as a student or institution to get started.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Choose Account Type</CardTitle>
              <CardDescription className="text-center">
                Select the type of account you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {/* Account Type Selection */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setAccountType('student')}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                      accountType === 'student'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        accountType === 'student' ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Student</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Enroll in courses, earn certificates, and build your educational credentials on the blockchain.
                    </p>
                  </button>

                  <button
                    onClick={() => setAccountType('institution')}
                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                      accountType === 'institution'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        accountType === 'institution' ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Institution</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Create courses, manage students, and issue verifiable blockchain certificates.
                    </p>
                  </button>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>

                {accountType === 'institution' && (
                  <div className="space-y-2">
                    <Label htmlFor="description">Institution Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your institution, courses offered, and credentials"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !formData.name || !formData.email}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Demo Mode: This is a demonstration of the registration flow.</p>
                <p>In production, this would connect to your wallet and create blockchain accounts.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 