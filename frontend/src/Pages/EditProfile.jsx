import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User, Phone, Home, KeyRound, Mail } from 'lucide-react';
import api from '@/services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone_number: '',
    hostel: '',
    room_number: '',
    profile_pic: ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Password reset states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get('/user/me');
        
        if (response && response.data) {
          setUser(response.data.user);
          console.log(user)
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle profile picture change
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  // Handle profile picture update
  const handleUpdateProfilePic = async () => {
    if (!profileImage) {
      setError("Please select an image to upload");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('profile_pic', profileImage);
      
      const response = await api.patch('/user/update-profile-pic', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response && response.data) {
        setUser({ ...user, profile_pic: response.data.profile_pic });
        setSuccess("Profile picture updated successfully");
        setProfileImage(null);
      }
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError("Failed to update profile picture. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle phone number update
  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    
    if (!user.phone_number) {
      setError("Please enter a phone number");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.patch('/user/update-phone', {
        phone_number: user.phone_number
      });
      
      if (response && response.data) {
        setSuccess("Phone number updated successfully");
      }
    } catch (err) {
      console.error("Error updating phone number:", err);
      setError("Failed to update phone number. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hostel and room update
  const handleUpdateHostelRoom = async (e) => {
    e.preventDefault();
    
    if (!user.hostel || !user.room_number) {
      setError("Please enter both hostel and room number");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.patch('/user/update-hostel-room', {
        hostel: user.hostel,
        room_number: user.room_number
      });
      
      if (response && response.data) {
        setSuccess("Hostel and room information updated successfully");
      }
    } catch (err) {
      console.error("Error updating hostel and room:", err);
      setError("Failed to update hostel and room information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle send OTP for password reset
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.post('/user/forgot-password', {
        email: email
      });
      
      if (response && response.data) {
        setSuccess("OTP sent to your email address");
        setOtpSent(true);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Please check your email and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email || !otp || !newPassword || !confirmPassword) {
      setError("Please fill all the required fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await api.post('/user/reset-password', {
        email: email,
        otp: otp,
        newPassword: newPassword
      });
      
      if (response && response.data) {
        setSuccess("Password reset successful");
        setPasswordResetSuccess(true);
        setOtpSent(false);
        
        // Reset form fields
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password. Please check your OTP and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  
  // Render a loading state if user data is being fetched
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">Update your personal information and account settings.</p>
      </div>
      
      {success && (
        <Alert className="bg-green-50 border-green-300">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert className="bg-red-50 border-red-300">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile Info</TabsTrigger>
          <TabsTrigger value="contact">Contact & Location</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Info Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center sm:flex-row sm:space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profile_pic} alt={user.name} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-4 sm:mt-0 flex-1">
                  <Label htmlFor="profile-pic" className="block mb-2">Upload new image</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="profile-pic" 
                      type="file" 
                      accept="image/*"
                      onChange={handleProfilePicChange}
                    />
                    <Button 
                      onClick={handleUpdateProfilePic}
                      disabled={!profileImage || isSubmitting}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: Square image, 500x500 pixels or larger
                  </p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="name" className="block mb-2">Full Name</Label>
                <Input 
                  id="name" 
                  value={user.name || ''}
                  disabled 
                  readOnly
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact administrator to change your name
                </p>
              </div>
              
              <div>
                <Label htmlFor="email" className="block mb-2">Email Address</Label>
                <Input 
                  id="email" 
                  value={user.email || ''}
                  disabled 
                  readOnly
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Email cannot be changed once registered
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact & Location Tab */}
        <TabsContent value="contact" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update your phone number</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePhone} className="space-y-4">
                  <div>
                    <Label htmlFor="phone" className="block mb-2">Phone Number</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="phone" 
                        type="tel"
                        value={user.phone_number || ''}
                        onChange={(e) => setUser({...user, phone_number: e.target.value})}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Update Phone
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Hostel Information</CardTitle>
                <CardDescription>Update your hostel and room details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateHostelRoom} className="space-y-4">
                  <div>
                    <Label htmlFor="hostel" className="block mb-2">Hostel</Label>
                    <Input 
                      id="room" 
                      type="text"
                      value={user.hostel || ''}
                      onChange={(e) => setUser({...user, hostel: e.target.value})}
                      placeholder="Enter your hostel"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="room" className="block mb-2">Room Number</Label>
                    <Input 
                      id="room" 
                      type="text"
                      value={user.room_number || ''}
                      onChange={(e) => setUser({...user, room_number: e.target.value})}
                      placeholder="Enter your room number"
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Update Hostel & Room
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Reset</CardTitle>
              <CardDescription>Reset your account password</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordResetSuccess ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-300">
                    <AlertDescription className="text-green-700">
                      Password has been reset successfully. You can now log in with your new password.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => {
                      setPasswordResetSuccess(false);
                      setEmail('');
                    }}
                  >
                    Reset Another Password
                  </Button>
                </div>
              ) : otpSent ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="otp" className="block mb-2">OTP Code</Label>
                    <Input 
                      id="otp" 
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the OTP sent to your email"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="new-password" className="block mb-2">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-password" className="block mb-2">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setOtpSent(false)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="block mb-2">Email Address</Label>
                    <Input 
                      id="reset-email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset OTP
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
        >
          Back to Profile
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;