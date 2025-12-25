import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, X, ChevronLeft, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useCategory from '@/hooks/use-category';
import { format } from 'date-fns';

const PersonalItemDetails = () => {
  const { id } = useParams(); // type will be 'lost' or 'found'
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if this is a lost or found item based on the URL path
  const type = location.pathname.includes('/my-lost-items/') ? 'lost' : 'found';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const categories = useCategory();

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };
  const convertToInputDateFormat = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return ""; // fallback if invalid
    return date.toISOString().split("T")[0];
  };
  
  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    location: '',
    date: ''
  });
  
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        let response;
        if (type === 'lost') {
          response = await api.get(`/lost-items/${id}`);
          setItem(response.data.item);
        } else {
          response = await api.get(`/found-items/${id}`);
          setItem(response.data.item);
        }
        console.log("Items details fetched", response.data?.item);
        
        // Initialize form data ONLY after we have the item
        const fetchedItem = response.data.item;
        if (fetchedItem) {
          setFormData({
            name: fetchedItem.name,
            description: fetchedItem.description,
            category_id: fetchedItem.category_id,
            location: type === 'lost' ? fetchedItem.lost_location : fetchedItem.found_location,
            date: type === 'lost' ? convertToInputDateFormat(fetchedItem.lost_date) : convertToInputDateFormat(fetchedItem.found_date)
          });
          console.log("formDta",formData);
        }
      } catch (err) {
        console.error("Error fetching item details:", err);
        toast({
          title: "Error",
          description: "Failed to load item details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, type, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category_id: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  const handleUpdateDetails = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
      };
      
      if (type === 'lost') {
        payload.lost_location = formData.location;
        payload.lost_date = formData.date;
        await api.put(`/lost-items/update/${id}`, payload);
      } else {
        payload.found_location = formData.location;
        payload.found_date = formData.date;
        await api.put(`/found-items/update/${id}`, payload);
      }
      
      toast({
        title: "Success",
        description: "Item details updated successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      
      // Refresh item data
      if (type === 'lost') {
        const response = await api.get(`/lost-items/${id}`);
        setItem(response.data.item);
      } else {
        const response = await api.get(`/found-items/${id}`);
        setItem(response.data.item);
      }
      
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating item details:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update item details",
        variant: "destructive"
      });
    }
  };

  const handleUpdateImages = async () => {
    try {
      if (selectedImages.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one image",
          variant: "destructive"
        });
        return;
      }
      
      const formData = new FormData();
      selectedImages.forEach(file => {
        formData.append('photos', file);
      });
      
      if (type === 'lost') {
        await api.put(`/lost-items/update-images/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.put(`/found-items/update-images/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      toast({
        title: "Success",
        description: "Item images updated successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      
      // Refresh item data
      if (type === 'lost') {
        const response = await api.get(`/lost-items/${id}`);
        setItem(response.data.item);
      } else {
        const response = await api.get(`/found-items/${id}`);
        setItem(response.data.item);
      }
      
      setIsImageDialogOpen(false);
      setSelectedImages([]);
      setImagePreviewUrls([]);
    } catch (err) {
      console.error("Error updating item images:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update item images",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (type === 'lost') {
        await api.delete(`/lost-items/${id}`);
      } else {
        await api.delete(`/found-items/${id}`);
      }
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
        className: "bg-green-700 text-white border border-green-300"
      });
      
      navigate('/profile');
    } catch (err) {
      console.error("Error deleting item:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete item",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading item details...</div>;
  }

  if (!item) {
    return <div className="text-center mt-8">Item not found</div>;
  }

  return (
    <div className="container mx-auto py-4 px-4 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{item.name}</CardTitle>
            <Badge className={type === 'lost' ? 'bg-red-500' : 'bg-green-500'}>
              {type === 'lost' ? 'Lost' : 'Found'}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" /> Edit Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Item Details</DialogTitle>
                  <DialogDescription>
                    Update the details for your {type} item.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select 
                      value={formData.category_id?.toString()} 
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.category_id} value={category.category_id.toString()}>
                            {category.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleInputChange}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Input 
                      id="date" 
                      name="date" 
                      type="date" 
                      value={formData.date} 
                      onChange={handleInputChange}
                      className="col-span-3" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleUpdateDetails}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" /> Update Images
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Update Item Images</DialogTitle>
                  <DialogDescription>
                    Upload new images for your {type} item. This will replace all existing images.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="images">Images</Label>
                    <Input 
                      id="images" 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                  </div>
                  {imagePreviewUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={url} 
                            alt={`Preview ${index}`} 
                            className="w-full h-24 object-cover rounded-md" 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleUpdateImages}>Update Images</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete this item.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Images</h3>
                {item.photos && item.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {item.photos.map((photo, index) => (
                      <img 
                        key={index} 
                        src={photo} 
                        alt={`${item.name} ${index+1}`} 
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images available</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Category:</span>
                    <span>{item.category_name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">{type === 'lost' ? 'Lost Date:' : 'Found Date:'}</span>
                    <span>{new Date(type === 'lost' ? item.lost_date : item.found_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">{type === 'lost' ? 'Lost Location:' : 'Found Location:'}</span>
                    <span>{type === 'lost' ? item.lost_location : item.found_location}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Posted On:</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Status:</span>
                    <span>{item.status || 'Active'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Name:</span>
                    <span>{item.user.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">Phone:</span>
                    <span>{item.user.phone_number}</span>
                  </div>
                  {item.user_phone && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Phone:</span>
                      <span>{item.user_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PersonalItemDetails;