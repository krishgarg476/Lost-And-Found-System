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

const LostItemReports = () => {
  const { lost_item_id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  useEffect(() => {
    fetchData();
  }, [lost_item_id]);
  
  const fetchData = async () => {
    try {
      const [reportsResponse, itemResponse] = await Promise.all([
        api.get(`/report-lost-found/item/${lost_item_id}`),
        api.get(`/lost-items/${lost_item_id}`)
      ]);
      
      // Updated to match the backend structure
      setReports(reportsResponse.data.reports);
      setItem(itemResponse.data.item);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error",
        description: "Failed to load reports or item details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openStatusDialog = (report, status) => {
    setSelectedClaim(report);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };
  
  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/report-lost-found/status/${selectedClaim.report_id}`, { status: newStatus });
      
      toast({
        title: "Success",
        description: `Claim ${newStatus.toLowerCase()} successfully`,
        className: "bg-green-700 text-white border border-green-300"
      });
      
      // Refresh reports data
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
      case 'Returned':
        return <Badge className="bg-green-500">Returned</Badge>;
      case 'Pending':
        return <Badge className="bg-red-500">Pending</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading reports...</div>;
  }
  
  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center mr-4" 
          onClick={() => navigate(`/lost-items/${lost_item_id}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Item
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Reports for {item?.name}</h1>
          <p className="text-gray-500">Review and manage reports for this item</p>
        </div>
      </div>
      
      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No reports have been made for this item yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.report_id} className={
              report.status === 'Returned' ? 'border-green-500 dark:border-green-700' :
              report.status === 'Pending' ? 'border-red-500 dark:border-red-700' : ''
            }>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Report #{report.report_id}</CardTitle>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Submitted on {format(new Date(report.created_at), 'MMMM d, yyyy')}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    {report.message && (
                      <div>
                        <span className="font-medium">Message:</span>
                        <p className="text-gray-600 dark:text-gray-300">{report.message}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-base font-semibold mb-2">Reporter Information</h3>
                    <div className="space-y-2">
                      {report.lost_item?.user && (
                        <>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{report.lost_item.user.name || "Anonymous"}</span>
                          </div>
                          {report.lost_item.user.roll_number && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>Roll: {report.lost_item.user.roll_number}</span>
                            </div>
                          )}
                          {report.lost_item.user.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{report.lost_item.user.phone_number}</span>
                            </div>
                          )}
                          {report.lost_item.user.hostel && (
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span>Hostel: {report.lost_item.user.hostel}</span>
                            </div>
                          )}
                          {report.lost_item.user.room_number && (
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-gray-500" />
                              <span>Room: {report.lost_item.user.room_number}</span>
                            </div>
                          )}
                        </>
                      )}
                      {!report.lost_item?.user && (
                        <p className="text-gray-500">User information not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2 pt-2">
                {report.status === 'Pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() => openStatusDialog(report, 'Pending')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Lost
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600"
                      onClick={() => openStatusDialog(report, 'Returned')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Returned
                    </Button>
                  </>
                )}
                {report.status !== 'Pending' && (
                  <Button 
                    variant="outline"
                    onClick={() => openStatusDialog(report, 'Pending')}
                  >
                    Mark as Lost
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
              {newStatus === 'Returned' 
                ? 'Approve Report' 
                : 'Mark as Lost' }
            </DialogTitle>
            <DialogDescription>
              {newStatus === 'Returned' 
                ? 'Are you sure you want to approve this report? This will mark the item as found.'
                : newStatus === 'Pending' 
                  ? 'Are you sure you want to Mark as Lost?'
                  : 'Are you sure you want to Mark as lost to pending?'}
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
              variant={newStatus === 'Returned' ? 'default' : newStatus === 'Pending' ? 'destructive' : 'secondary'}
              onClick={handleUpdateStatus}
            >
              {newStatus === 'Returned' 
                ? 'Yes' 
                : newStatus === 'Pending' 
                  ? 'Yes' 
                  : 'Yes, Mark as Lost'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostItemReports;