import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HandMetal, 
  Package, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  User, 
  Phone, 
  Home, 
  Award 
} from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import ClaimForm from './ClaimForm';
import FoundClaimForm from './FoundClaimForm';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/store/authSlice';

const ItemDetailsPage = () => {
  const { toast } = useToast();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [ isReportLostFoundFormOpen, setIsReportLostFoundFormOpen]=useState(false);
  const dispatch=useDispatch();
  const {user} = useSelector(state => state.auth);
  // Determine if we're viewing a lost or found item based on the URL
  const isFoundItem = window.location.pathname.includes('/found-items/');
  const apiEndpoint = isFoundItem ? `/found-items/${id}` : `/lost-items/${id}`;
  const returnUrl = isFoundItem ? '/found-items' : '/lost-items';
  const itemType = isFoundItem ? 'found' : 'lost';
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(apiEndpoint);
        setItem(response.data.item);
      } catch (error) {
        console.error(`Error fetching ${itemType} item details:`, error);
        setError(error.response?.data?.message || "An unexpected error occurred");
        toast({
          title: `Failed to load ${itemType} item details`,
          description: error.response?.data?.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log(item)
      }
    };
    
    fetchItemDetails();
  }, [apiEndpoint, id, itemType, toast]);
  
  const handleClaimClick = () => {
    if (isFoundItem) {
      setIsClaimFormOpen(true);
    } else{
      // Navigate to a different page or show different dialog for lost items
      setIsReportLostFoundFormOpen(true);
    }
  };

  const handleClaimSuccess = () => {
    toast({
      title: "Claim Submitted",
      description: "Your claim has been submitted successfully!",
      className: "bg-green-700 text-white border border-green-300"
    });
    // Optionally refresh item data after claim
    // fetchItemDetails();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading item details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg inline-block">
            <Package className="mx-auto h-12 w-12 text-red-600 dark:text-red-300" />
          </div>
          <h3 className="mt-4 text-lg font-medium">Item Not Found</h3>
          <p className="mt-2 text-muted-foreground">{error || "The requested item could not be found"}</p>
          <Link to={returnUrl}>
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to {isFoundItem ? 'Found' : 'Lost'} Items
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4 py-8 mx-auto max-w-4xl">
      <div className="mb-6">
      <Link to={returnUrl} className="block sm:inline-block">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {isFoundItem ? 'Found' : 'Lost'} Items
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Item Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                <CardTitle className="text-xl sm:text-2xl">{item.name}</CardTitle>
                  <CardDescription className="text-base">
                    {isFoundItem ? 'Found on' : 'Lost on'} {formatDate(isFoundItem ? item.found_date : item.lost_date)}
                  </CardDescription>
                </div>
                <div className={`p-2 rounded ${isFoundItem ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                  {isFoundItem ? (
                    <HandMetal className="h-6 w-6 text-green-600 dark:text-green-300" />
                  ) : (
                    <Package className="h-6 w-6 text-red-600 dark:text-red-300" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Item Photos Gallery */}
              {item.photos && item.photos.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Photos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.photos.map((photo, index) => (
                      <div key={index} className="h-40 sm:h-48 overflow-hidden rounded-md border">
                        <img 
                          src={photo} 
                          alt={`${item.name} - Photo ${index + 1}`} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Item Description */}
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              
              {/* Item Details List */}
              <div className="space-y-2">
                <h3 className="font-medium">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isFoundItem ? 'Found Date' : 'Lost Date'}: {formatDate(isFoundItem ? item.found_date : item.lost_date)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isFoundItem ? 'Found Location' : 'Lost Location'}: {isFoundItem ? item.found_location : item.lost_location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Category: {item.category_name || 'Uncategorized'}
                    </span>
                  </div>
                  {item.status && (
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Status: {item.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Posted By</CardTitle>
              <CardDescription>Contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.user && (
                <>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                    <User className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{item.user.name}</span>
                  </div>
                  {item.user.roll_number && (
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <Award className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{item.user.roll_number}</span>
                    </div>
                  )}
                  {item.user.phone_number && (
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{item.user.phone_number}</span>
                    </div>
                  )}
                  {(item.user.hostel || item.user.room_number) && (
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                      <Home className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>
                        {item.user.hostel}{item.user.room_number ? ` - Room ${item.user.room_number}` : ''}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              {item.user && item.user.phone_number && (
                <Button className="w-full" variant="secondary" 
                onClick={() => {
                  const phoneNumber = `91${item.user.phone_number}`; // prepend country code
                  window.open(`https://wa.me/${phoneNumber}`, '_blank');
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className="mr-2">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                    <path d="M9.5 15.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
                  </svg>
                  WhatsApp
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            {user && user.id !== item.posted_by ? (<CardContent className="space-y-2">
              <Button onClick={handleClaimClick} className="w-full">
                {isFoundItem ? 'I Lost This Item' : 'I Found This Item'}
              </Button>
            </CardContent>) : (
              <CardContent className="space-y-2">
              <Button onClick={() => navigate(`${!isFoundItem ? `/item-found-claims/${item.lost_item_id}`
                          : `/item-claims/${item.found_item_id}`}`)} className="w-full">
                {isFoundItem ? 'See Claims' : 'See Reports'}
              </Button>
            </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Claim Form Dialog */}
      {isFoundItem && (
        <ClaimForm 
          foundItem={item}
          isOpen={isClaimFormOpen}
          onClose={() => setIsClaimFormOpen(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
      {!isFoundItem && (
        <FoundClaimForm
          lostItem={item}
          isOpen={isReportLostFoundFormOpen}
          onClose={()=>setIsReportLostFoundFormOpen(false)}
          onSuccess={handleClaimSuccess}
          />
      )}
    </div>
  );
};

export default ItemDetailsPage;