import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, PackageOpen, Filter, HandMetal } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import useCategory from '@/hooks/use-category';

const FoundItems = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [foundItems, setFoundItems] = useState([]);
  // const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch all found items on component mount
  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        const response = await api.get('/found-items');
        // Updated to match the actual API response structure
        const items = response.data.items || [];
        setFoundItems(items);
        console.log("found_items",foundItems);
        // Extract unique categories from category_id, filter out undefined/null values
        // const uniqueCategories = [...new Set(items
        //   .map(item => item.category_id)
        //   .filter(category => category !== undefined && category !== null)
        // )];
        // setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching found items:', error);
        toast({
          title: "Failed to load found items",
          description: error.response?.data?.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFoundItems();
  }, [toast]);
  const categories=useCategory();
  const cats = Array.isArray(categories) ? categories : [];
  // Filter items based on search query and category
  const filteredItems = foundItems.filter(item => {
    const matchesSearch = item.name && item.description && (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesCategory = categoryFilter === 'all' || 
      (item.category_id && item.category_id.toString() === categoryFilter);
    
    return matchesSearch && matchesCategory;
  });
  console.log("filtered items",filteredItems);
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Found Items</h1>
          <p className="text-muted-foreground">Browse items that have been found</p>
        </div>
        <Link to="/create-listing">
          <Button>
            <HandMetal className="mr-2 h-4 w-4" />
            Report Found Item
          </Button>
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search found items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(({category_id,category_name}) => (
              <SelectItem key={category_id} value={String(category_id)}>
                {category_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading found items...</p>
        </div>
      )}
      
      {/* Items Grid */}
      {!loading && filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.found_item_id || item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>
                      {formatDate(item.found_date)} • {item.found_location}
                    </CardDescription>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded">
                    <PackageOpen className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm line-clamp-3">{item.description}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                    Category: {item.category_name || 'Unknown'}
                  </span>
                </div>
              </CardContent>
              {item.photos && item.photos.length > 0 && (
                <div className="px-6 pb-2">
                  <div className="h-32 overflow-hidden rounded-md">
                    <img 
                      src={item.photos[0]} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
              <CardFooter className="pt-3">
                {item.status==="Resolved"?(<Button variant="outline" className="bg-green-700 text-white font-bold w-full">Resolved</Button>):(
                <Link to={`/found-items/${item.found_item_id || item.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>)}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12">
          <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default FoundItems;