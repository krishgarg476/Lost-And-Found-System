import React, { useState } from 'react';
import api from '@/services/api'; // Assuming you have an API service set up

const ForgotPassword= () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

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

  const handleBackToLogin = () => {
    // Redirect to login page
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {passwordResetSuccess ? "Password Reset Successful" : "Forgot Password"}
          </h2>
        </div>

        {/* Display error messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Display success messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {!passwordResetSuccess ? (
          <>
            {!otpSent ? (
              // Step 1: Email form
              <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
                <div>
                  <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: OTP and new password form
              <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    OTP
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Back to Email Form
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          // Success message and back to login button
          <div className="mt-8 space-y-6">
            <p className="text-center text-gray-600">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <button
              onClick={handleBackToLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Back to login link */}
        {!passwordResetSuccess && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Remember your password? Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;