import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, Settings, LogOut } from 'lucide-react';
import { logout } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import PersonalItemsCard from '@/components/reusables/PersonalItemsCard.jsx';

const Profile = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, userItems, loading, error } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await api.post("/user/logout", null, { withCredentials: true });
  
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
        className: "bg-green-700 text-white border border-green-300"
      });
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      toast({
        title: "Logout failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };

  // Handle loading state
  if (loading) {
    return <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto flex justify-center items-center h-64">
        <p className="text-lg">Loading profile data...</p>
      </div>
    </div>;
  }

  // Handle error state or no user data
  if (error || !user) {
    return <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col justify-center items-center h-64">
        <p className="text-lg text-red-500">Unable to load profile data</p>
        <Button className="mt-4" onClick={() => dispatch(fetchProfile())}>
          Retry
        </Button>
        <Button variant="outline" className="mt-2" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    </div>;
  }
  
  // Make sure userItems exists with default empty arrays
  const safeUserItems = {
    lost: userItems?.lost || [],
    found: userItems?.found || []
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={user.profile_pic || '/api/placeholder/80/80'} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Link to="/edit-profile">
                  <Button variant="outline" size="sm" className="flex items-center">
                      <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div><span className="text-gray-500">Email:</span> <span className="ml-2">{user.email}</span></div>
                  <div><span className="text-gray-500">Phone:</span> <span className="ml-2">{user.phone || 'Not provided'}</span></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                <div className="space-y-2">
                  <div><span className="text-gray-500">Member Since:</span> <span className="ml-2">{new Date(user.joinDate || Date.now()).toLocaleDateString()}</span></div>
                  <div><span className="text-gray-500">Items Posted:</span> <span className="ml-2">{safeUserItems.lost.length + safeUserItems.found.length}</span></div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleLogout} variant="ghost" className="text-red-500 hover:text-red-700 flex items-center">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">Lost Items <Badge variant="secondary" className="ml-2">{safeUserItems.lost.length}</Badge></TabsTrigger>
            <TabsTrigger value="found">Found Items <Badge variant="secondary" className="ml-2">{safeUserItems.found.length}</Badge></TabsTrigger>
          </TabsList>

          <TabsContent value="lost">
            {safeUserItems.lost.length === 0 ? (
              <div className="text-center py-8 text-gray-500">You haven't posted any lost items yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {safeUserItems.lost.map(item => (
                  <PersonalItemsCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found">
            {safeUserItems.found.length === 0 ? (
              <div className="text-center py-8 text-gray-500">You haven't posted any found items yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {safeUserItems.found.map(item => (
                  <PersonalItemsCard key={item.id} item={item} type="found" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;