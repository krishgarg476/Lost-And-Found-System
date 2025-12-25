import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ClaimForm = ({ foundItem, isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    security_answer_attempt: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        found_item_id: foundItem.found_item_id,
        security_answer_attempt: formData.security_answer_attempt,
        message: formData.message
      };

      await api.post('/claims/create', payload);
      
      toast({
        title: "Success",
        description: "Your claim has been submitted successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      
      setFormData({
        security_answer_attempt: '',
        message: ''
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error submitting claim:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit claim",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim This Item</DialogTitle>
          <DialogDescription>
            Please answer the security question to claim this item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            {/* <div className="space-y-2">
              <Label>Security Question</Label>
              <p className="text-sm font-medium">{foundItem?.security_question || "No security question available"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="security_answer_attempt">Your Answer</Label>
              <Input
                id="security_answer_attempt"
                name="security_answer_attempt"
                value={formData.security_answer_attempt}
                onChange={handleInputChange}
                placeholder="Enter your answer"
                required
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="message">Claim Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Any additional details about your lost item"
                rows={3}
              />
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Claim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimForm;