import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import useCategory from '@/hooks/use-category';


const hashAnswer = (answer) => {
  // This is a placeholder - in a real app you'd use a proper hashing mechanism
  // or handle this entirely on the backend
  return answer; 
};

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'lost',
    date: null,
    location: '',
    pickupLocation: '',
    photos: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]);

  const categories = useCategory();
  const cats = Array.isArray(categories) ? categories : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (e) => {
    // Store the date string directly in YYYY-MM-DD format
    const dateString = e.target.value;
    console.log("Raw date input value:", dateString);
    setFormData((prev) => ({ ...prev, date: dateString }));
    console.log("Raw date input value2:", formData.date);
    if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
  };
  

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast({
        title: 'Too many files',
        description: 'You can upload maximum 3 photos',
        variant: 'destructive',
      });
      return;
    }
    setFormData((prev) => ({ ...prev, photos: files }));
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setPhotoPreview([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.photos.length === 0) newErrors.photos = 'At least one photo is required';
    
    // Additional validations for found items
    if (formData.status === 'found') {
      if (!formData.pickupLocation.trim()) 
        newErrors.pickupLocation = 'Pickup location is required for found items';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    const formDataToSend = new FormData();
    console.log("formdate",formData.date);
    // Use `name` instead of `title` to match backend expectations
    formDataToSend.append('name', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category_id', formData.category);
    
    // Use the date string directly - it's already in YYYY-MM-DD format from the date input
    if (formData.status === 'found') {
      formDataToSend.append('found_date', formData.date);
      formDataToSend.append('found_location', formData.location);
      formDataToSend.append('pickup_location', formData.pickupLocation);
    } else {
      // Fields specific to lost items - exact field names expected by backend
      formDataToSend.append('lost_date', formData.date);
      formDataToSend.append('lost_location', formData.location);
    }
    
    // Append photos with the field name expected by multer middleware
    formData.photos.forEach((photo) => {
      formDataToSend.append('photos', photo);
    });

    try {
      // Keep original API endpoints
      console.log("sending form data", formDataToSend);
      const endpoint = formData.status === 'lost' ? '/lost-items/report' : '/found-items/report';
      const response = await api.post(endpoint, formDataToSend);
      
      toast({
        title: 'Success!',
        description: `Your ${formData.status} item has been reported.`,
      });
      navigate("/")
      // navigate(formData.status === 'lost' ? '/lost' : '/found');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'Failed to create listing',
        description: error.response?.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Listing</CardTitle>
          <CardDescription>
            Provide details about the item you {formData.status === 'lost' ? 'lost' : 'found'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Type of Listing</Label>
              <RadioGroup
                id="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost Item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found Item</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder={`What is the item that you ${formData.status}`}
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description including color, brand, identifying features, etc."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger
                    className={errors.category ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map(({ category_id, category_name }) => (
                      <SelectItem
                        key={category_id}
                        value={String(category_id)}
                      >
                        {category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">
                  {formData.status === 'lost'
                    ? 'When did you lose it?'
                    : 'When did you find it?'}
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date || ''}
                  onChange={handleDateChange}
                  className={errors.date ? 'border-red-500' : ''}
                />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                {formData.status === 'lost' ? 'Where did you lose it?' : 'Where did you find it?'}
              </Label>
              <Input
                id="location"
                name="location"
                placeholder={formData.status === 'lost' ? 'Lost location' : 'Found location'}
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'border-red-500' : ''}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {formData.status === 'found' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Input
                    id="pickupLocation"
                    name="pickupLocation"
                    placeholder="Where can someone collect this item?"
                    value={formData.pickupLocation}
                    onChange={handleInputChange}
                    className={errors.pickupLocation ? 'border-red-500' : ''}
                  />
                  {errors.pickupLocation && (
                    <p className="text-sm text-red-500">{errors.pickupLocation}</p>
                  )}
                </div>

                {/* <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="securityQA">Security Question</Label>
                    <Input
                      id="securityQA"
                      name="securityQA"
                      placeholder="e.g. What color was it?"
                      value={formData.securityQA}
                      onChange={handleInputChange}
                      className={errors.securityQA ? 'border-red-500' : ''}
                    />
                    {errors.securityQA && (
                      <p className="text-sm text-red-500">{errors.securityQA}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="securityQAAnswer">Answer</Label>
                    <Input
                      id="securityQAAnswer"
                      name="securityQAAnswer"
                      value={formData.securityQAAnswer}
                      onChange={handleInputChange}
                      className={errors.securityQAAnswer ? 'border-red-500' : ''}
                    />
                    {errors.securityQAAnswer && (
                      <p className="text-sm text-red-500">{errors.securityQAAnswer}</p>
                    )}
                  </div>
                </div> */}
              </>
            )}

            <div className="space-y-4">
              <Label>Upload Images (Max 3)</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                {photoPreview.length > 0 ? (
                  <div className="w-full">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {photoPreview.map((preview, idx) => (
                        <img
                          key={idx}
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoPreview([]);
                        setFormData((prev) => ({ ...prev, photos: [] }));
                      }}
                      className="mt-2"
                    >
                      Remove Images
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 10MB (max 3 files)
                    </p>
                  </div>
                )}
              </div>
              {errors.photos && (
                <p className="text-sm text-red-500">{errors.photos}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Create Listing'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateListing;