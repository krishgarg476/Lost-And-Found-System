import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, Eye, Trash2, Clock, Calendar, User, MapPin, Phone, School } from 'lucide-react';
import { format } from 'date-fns';

const MyReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      const response = await api.get('/report-lost-found/user/my');
      setReports(response.data.reports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast({
        title: "Error",
        description: "Failed to load your reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  console.log("my reports", reports);
  const handleViewItem = (lostItemId) => {
    navigate(`/lost-items/${lostItemId}`);
  };
  
  const confirmDelete = (report) => {
    setSelectedReport(report);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteReport = async () => {
    try {
      await api.delete(`/report-lost-found/${selectedReport.report_id}`);
      toast({
        title: "Success",
        description: "Report deleted successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      fetchReports();
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting report:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete report",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Returned':
        return <Badge className="bg-green-500">Returned</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading your reported items...</div>;
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
        <h1 className="text-2xl font-bold">My Reported Items</h1>
      </div>
      
      {reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">You haven't reported finding any lost items yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.report_id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                  <CardTitle>{report.lostItem?.name || "Unknown Item"}</CardTitle>
                  <div className="flex items-center mt-1">
                    {getStatusBadge(report.status)}
                    <span className="text-sm text-gray-500 ml-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Reported {format(new Date(report.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {report.message && (
                    <div className="mt-2 text-sm italic text-gray-600">
                      "{report.message}"
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Item Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {report.lostItem?.description?.substring(0, 100) || "No description available"}
                      {report.lostItem?.description?.length > 100 ? "..." : ""}
                    </p>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Lost on {format(new Date(report.lostItem?.lost_date), 'MMMM d, yyyy')}
                    </div>
                    {report.pickup_location && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        Pickup Location: {report.pickup_location}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Owner Information</h3>
                    <div className="text-sm">
                      <p className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <strong>Owner:</strong> {report.lostItem?.user?.name || "Anonymous"}
                      </p>
                      {report.lostItem?.user?.roll_number && (
                        <p className="mt-1 flex items-center">
                          <School className="h-3 w-3 mr-1" />
                          <strong>Roll Number:</strong> {report.lostItem?.user?.roll_number}
                        </p>
                      )}
                      {report.lostItem?.user?.phone_number && (
                        <p className="mt-1 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <strong>Contact:</strong> {report.lostItem?.user?.phone_number}
                        </p>
                      )}
                      {report.lostItem?.user?.hostel && (
                        <p className="mt-1">
                          <strong>Location:</strong> {report.lostItem?.user?.hostel}
                          {report.lostItem?.user?.room_number && `, Room ${report.lostItem?.user?.room_number}`}
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
                  onClick={() => handleViewItem(report.lost_item_id)}
                >
                  <Eye className="h-4 w-4 mr-1" /> View Lost Item
                </Button>
                
                {report.status === 'Pending' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex items-center"
                    onClick={() => confirmDelete(report)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Cancel Report
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
            <DialogTitle>Cancel Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your report for "{selectedReport?.lostItem?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Yes, Cancel Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyReports;