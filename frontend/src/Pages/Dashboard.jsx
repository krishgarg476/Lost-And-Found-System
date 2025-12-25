import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, PackageOpen, Users, TrendingUp, Search } from 'lucide-react';
import api from '@/services/api';

const Dashboard = () => {
  // State for dashboard statistics
  const [dashboardCounts, setDashboardCounts] = useState({
    lost_items: 0,
    found_items: 0,
    users: 0,
  });
  
  // State for recent items
  const [recentLostItems, setRecentLostItems] = useState([]);
  const [recentFoundItems, setRecentFoundItems] = useState([]);
  
  // Loading states
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isLostItemsLoading, setIsLostItemsLoading] = useState(true);
  const [isFoundItemsLoading, setIsFoundItemsLoading] = useState(true);
  
  // Error states
  const [statsError, setStatsError] = useState(null);
  const [lostItemsError, setLostItemsError] = useState(null);
  const [foundItemsError, setFoundItemsError] = useState(null);
  const [query , setQuery] = useState("");
  // Fetch dashboard counts
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      try {
        setIsStatsLoading(true);
        setStatsError(null);
        
        const response = await api.get("/user/getDashboardCounts");
        
        if (response && response.data) {
          console.log("Dashboard Counts:", response.data);
          setDashboardCounts(response.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
        setStatsError("Failed to load dashboard statistics");
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);
  
  // Fetch lost items
  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        setIsLostItemsLoading(true);
        setLostItemsError(null);
        
        const response = await api.get(`/lost-items/?page=1&query=${query}`);
        
        if (response && response.data) {
          console.log("Lost Items:", response.data);
          
          // The API returns { success: true, message: string, items: array }
          const items = response.data.items || [];
          
          if (Array.isArray(items)) {
            // Sort by date (newest first) and take the first 2 items
            const sortedItems = [...items]
              .filter(item => item && (item.lost_date || item.date)) // Make sure items have a date
              .sort((a, b) => {
                // Use lost_date from the API or fallback to date
                const dateA = new Date(b.lost_date || b.date);
                const dateB = new Date(a.lost_date || a.date);
                return dateA - dateB;
              })
              .slice(0, 2);
            
            setRecentLostItems(sortedItems);
          } else {
            console.error("Items property is not an array:", items);
            setRecentLostItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching lost items:", error);
        setLostItemsError("Failed to load lost items");
      } finally {
        setIsLostItemsLoading(false);
      }
    };

    fetchLostItems();
  }, [query]);
  
  // Fetch found items
  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        setIsFoundItemsLoading(true);
        setFoundItemsError(null);
        
        const response = await api.get("/found-items/");
        
        if (response && response.data) {
          console.log("Found Items:", response.data);
          
          // The API likely returns { items: array } or { success: true, message: string, items: array }
          const items = response.data.items || [];
          
          if (Array.isArray(items)) {
            // Sort by date (newest first) and take the first 2 items
            const sortedItems = [...items]
              .filter(item => item && (item.found_date || item.date)) // Make sure items have a date
              .sort((a, b) => {
                // Use found_date from the API or fallback to date
                const dateA = new Date(b.found_date || b.date);
                const dateB = new Date(a.found_date || a.date);
                return dateA - dateB;
              })
              .slice(0, 2);
            
            setRecentFoundItems(sortedItems);
          } else {
            console.error("Items property is not an array:", items);
            setRecentFoundItems([]);
          }
        }
      } catch (error) {
        console.error("Error fetching found items:", error);
        setFoundItemsError("Failed to load found items");
      } finally {
        setIsFoundItemsLoading(false);
      }
    };

    fetchFoundItems();
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to FindIt. Your central hub for lost and found items.</p>
        </div>
        <Link to="/create-listing">
          <Button>Create New Listing</Button>
        </Link>
      </div>
      
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lost Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : isStatsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardCounts.lost_items || 0}</div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Found Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : isStatsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardCounts.found_items || 0}</div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsError ? (
              <p className="text-sm text-red-500">Error loading data</p>
            ) : isStatsLoading ? (
              <div className="text-2xl font-bold">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardCounts.users || 0}</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Search Box */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for lost or found items..."
              className="w-full rounded-md border border-input pl-8 pr-4 py-2 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Listings Tabs */}
      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lost">Recent Lost Items</TabsTrigger>
          <TabsTrigger value="found">Recent Found Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lost" className="mt-6">
          {lostItemsError ? (
            <div className="text-center py-8 text-red-500">{lostItemsError}</div>
          ) : isLostItemsLoading ? (
            <div className="text-center py-8">Loading recent lost items...</div>
          ) : recentLostItems.length === 0 ? (
            <div className="text-center py-8">No lost items found</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentLostItems.map(item => (
                <Card key={item.lost_item_id || item.id}>
                  <CardHeader>
                    <CardTitle>{item.name || item.title}</CardTitle>
                    <CardDescription>
                      Lost on {new Date(item.lost_date || item.date).toLocaleDateString()} • {item.lost_location || item.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                        {item.category_name || item.category}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/lost-items/${item.lost_item_id || item.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <Link to="/lost-items">
              <Button variant="link">View All Lost Items</Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="found" className="mt-6">
          {foundItemsError ? (
            <div className="text-center py-8 text-red-500">{foundItemsError}</div>
          ) : isFoundItemsLoading ? (
            <div className="text-center py-8">Loading recent found items...</div>
          ) : recentFoundItems.length === 0 ? (
            <div className="text-center py-8">No found items found</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentFoundItems.map(item => (
                <Card key={item.found_item_id || item.id}>
                  <CardHeader>
                    <CardTitle>{item.name || item.title}</CardTitle>
                    <CardDescription>
                      Found on {new Date(item.found_date || item.date).toLocaleDateString()} • {item.found_location || item.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                        {item.category_name || item.category}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/found-items/${item.found_item_id || item.id}`}>
                      <Button variant="outline">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <Link to="/found-items">
              <Button variant="link">View All Found Items</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;