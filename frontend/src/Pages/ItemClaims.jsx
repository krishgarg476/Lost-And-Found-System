import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { ChevronLeft, User, Phone, Home, Mail, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const ItemClaims = () => {
  const { found_item_id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [found_item_id]);
  
  const fetchData = async () => {
    try {
      const [claimsResponse, itemResponse] = await Promise.all([
        api.get(`/claims/item/${found_item_id}`),
        api.get(`/found-items/${found_item_id}`)
      ]);
      
      setClaims(claimsResponse.data.claims);
      if(claims)
      console.log("claims",claims);
      setItem(itemResponse.data.item);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error",
        description: "Failed to load claims or item details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openStatusDialog = (claim, status) => {
    setSelectedClaim(claim);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };
  
  const handleUpdateStatus = async () => {
    try {
      await api.put(`/claims/status/${selectedClaim.claim_id}`, { status: newStatus });
      
      toast({
        title: "Success",
        description: `Claim ${newStatus.toLowerCase()} successfully`,
        className: "bg-green-700 text-white border border-green-300"
      });
      
      // Refresh claims data
      fetchData();
      setIsStatusDialogOpen(false);
    } catch (err) {
      console.error("Error updating claim status:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update claim status",
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
    return <div className="flex justify-center items-center h-full">Loading claims...</div>;
  }
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center mr-4" 
          onClick={() => navigate(`/found-items/${found_item_id}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Item
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Claims for {item?.name}</h1>
          <p className="text-gray-500">Review and manage claims for this item</p>
        </div>
      </div>
      
      {claims.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No claims have been made for this item yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {claims.map((claim) => (
            <Card key={claim.claim_id} className={
              claim.status === 'Approved' ? 'border-green-500 dark:border-green-700' :
              claim.status === 'Rejected' ? 'border-red-500 dark:border-red-700' : ''
            }>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Claim #{claim.claim_id}</CardTitle>
                    {getStatusBadge(claim.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted on {format(new Date(claim.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    {/* <h3 className="text-base font-semibold mb-2">Claim Details</h3> */}
                    <div className="space-y-2">
                      {/* <div>
                        <span className="font-medium">Security Question:</span>
                        <p className="text-gray-600 dark:text-gray-300">{item?.security_question}</p>
                      </div> */}
                      {/* <div>
                        <span className="font-medium">Provided Answer:</span>
                        <p className="text-gray-600 dark:text-gray-300">{claim.security_answer_attempt}</p>
                      </div> */}
                      {claim.message && (
                        <div>
                          <span className="font-medium">Message:</span>
                          <p className="text-gray-600 dark:text-gray-300">{claim.message}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold mb-2">Claimant Information</h3>
                    <div className="space-y-2">
                      {claim.user && (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{claim.user.name || "Anonymous"}</span>
                          </div>
                          {claim.user.roll_number && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>Roll: {claim.user.roll_number}</span>
                            </div>
                          )}
                          {claim.user.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{claim.user.phone_number}</span>
                            </div>
                          )}
                          {claim.user.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{claim.user.email}</span>
                            </div>
                          )}
                          {claim.user.address && (
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span>{claim.user.address}</span>
                            </div>
                          )}
                        </>
                      )}
                      {!claim.user && (
                        <p className="text-gray-500">User information not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 pt-2">
                {claim.status === 'Pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => openStatusDialog(claim, 'Rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Claim
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                      onClick={() => openStatusDialog(claim, 'Approved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Claim
                    </Button>
                  </>
                )}
                {claim.status !== 'Pending' && (
                  <Button 
                    variant="outline"
                    onClick={() => openStatusDialog(claim, 'Pending')}
                  >
                    Reset to Pending
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === 'Approved' 
                ? 'Approve Claim' 
                : newStatus === 'Rejected' 
                  ? 'Reject Claim' 
                  : 'Reset Claim Status'}
            </DialogTitle>
            <DialogDescription>
              {newStatus === 'Approved' 
                ? 'Are you sure you want to approve this claim? This will mark the item as claimed.'
                : newStatus === 'Rejected' 
                  ? 'Are you sure you want to reject this claim?'
                  : 'Are you sure you want to reset this claim to pending?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant={newStatus === 'Approved' ? 'default' : newStatus === 'Rejected' ? 'destructive' : 'secondary'}
              onClick={handleUpdateStatus}
            >
              {newStatus === 'Approved' 
                ? 'Yes, Approve' 
                : newStatus === 'Rejected' 
                  ? 'Yes, Reject' 
                  : 'Yes, Reset to Pending'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemClaims;