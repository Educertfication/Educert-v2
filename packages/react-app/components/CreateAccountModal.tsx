import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  UserPlus, 
  Clock, 
  Building2, 
  Sparkles,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export interface CreateAccountFormData {
  name: string;
  duration: number;
}

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAccountFormData) => Promise<void>;
  isLoading?: boolean;
}

const durationOptions = [
  { value: 30, label: '30 days', description: 'Short-term course' },
  { value: 90, label: '90 days', description: 'Standard course' },
  { value: 180, label: '180 days', description: 'Long-term course' },
  { value: 365, label: '365 days', description: 'Year-long program' },
];

export default function CreateAccountModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: CreateAccountModalProps) {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    name: '',
    duration: 90,
  });
  const [errors, setErrors] = useState<{ [K in keyof CreateAccountFormData]?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { [K in keyof CreateAccountFormData]?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setFormData({ name: '', duration: 90 });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof CreateAccountFormData, value: string | number) => {
    if (field === 'duration') {
      setFormData(prev => ({ ...prev, duration: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value as string }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Create New Account</DialogTitle>
              <DialogDescription>
                Set up a new institutional account for course management
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center space-x-2">
              <Building2 className="w-4 h-4" />
              <span>Institution Name</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter institution name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center space-x-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Duration Selection */}
          <div className="space-y-3">
            <Label className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Course Duration</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {durationOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.duration === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('duration', option.value)}
                >
                  {formData.duration === option.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.description}</div>
                  </div>
                </div>
              ))}
            </div>
            {errors.duration && (
              <div className="flex items-center space-x-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.duration}</span>
              </div>
            )}
          </div>

          {/* Features Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>Account Features</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Course Creation</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Student Management</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Certificate Issuance</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>Revenue Tracking</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 