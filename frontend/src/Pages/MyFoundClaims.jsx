import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, Eye, Trash2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MyFoundClaims = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchClaims();
  }, []);
  
  const fetchClaims = async () => {
    try {
      const response = await api.get('/claims/user/my');
      console.log("claims",response.data.claims);
      setClaims(response.data.claims);
    } catch (err) {
      console.error("Error fetching claims:", err);
      toast({
        title: "Error",
        description: "Failed to load your claims",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewItem = (foundItemId) => {
    navigate(`/found-items/${foundItemId}`);
  };
  
  const confirmDelete = (claim) => {
    setSelectedClaim(claim);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteClaim = async () => {
    try {
      await api.delete(`/claims/${selectedClaim.claim_id}`);
      toast({
        title: "Success",
        description: "Claim deleted successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      fetchClaims();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting claim:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete claim",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading your claims...</div>;
  }
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate('/profile')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Profile
        </Button>
        <h1 className="text-2xl font-bold">My Claims</h1>
      </div>
      
      {claims.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">You haven't made any claims yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {claims.map((claim) => (
            <Card key={claim.claim_id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                  <CardTitle>{claim.foundItem?.name || "Unknown Item"}</CardTitle>
                  <div className="flex items-center mt-1">
                    {getStatusBadge(claim.status)}
                    <span className="text-sm text-gray-500 ml-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Claimed {format(new Date(claim.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Item Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {claim.foundItem?.description?.substring(0, 100) || "No description available"}
                      {claim.foundItem?.description?.length > 100 ? "..." : ""}
                    </p>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Found on {format(new Date(claim.foundItem?.found_date), 'MMMM d, yyyy')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Your Claim</h3>
                    <div className="text-sm">
                      <p><strong>Security Question:</strong> {claim.foundItem?.security_question}</p>
                      <p><strong>Your Answer:</strong> {claim.security_answer_attempt}</p>
                      {claim.message && (
                        <p className="mt-1">
                          <strong>Your Message:</strong> {claim.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => handleViewItem(claim.found_item_id)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View Item
                </Button>
                
                {claim.status === 'Pending' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => confirmDelete(claim)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Cancel Claim
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your claim for "{selectedClaim?.foundItem?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={handleDeleteClaim}>
              Yes, Cancel Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyFoundClaims;