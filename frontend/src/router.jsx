import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './Layout/MainLayout';
import Dashboard from './Pages/Dashboard';
import LostItems from './Pages/LostItems';
import FoundItems from './Pages/FoundItems';
import ItemDetails from './Pages/ItemDetails';
import Profile from './Pages/Profile';
import CreateListing from './Pages/CreateListing';
import Register from './Pages/Auth/Register';
import Login from './Pages/Auth/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './Layout/AuthLayout';
import VerifyEmail from './Pages/Auth/Otp';
import PersonalItemDetails from './Pages/PersonalItemDetails';
import EditProfile from './Pages/EditProfile';
import ClaimForm from './Pages/ClaimForm';
import ItemClaims from './Pages/ItemClaims';
import { Item } from '@radix-ui/react-radio-group';
import MyClaims from './Pages/MyClaims';
import LostItemReports from './Pages/LostItemReports';
import MyReports from './Pages/MyReports';
import ForgotPassword from './Pages/Auth/ForgotPassword';
export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthLayout>
        <Login />
      </AuthLayout>
    )
  },
  {
    path: '/register',
    element: (
      <AuthLayout>
        <Register />
      </AuthLayout>
    )
  },
  {
    path: '/verify-email',
    element: (
      <AuthLayout>
        <VerifyEmail />
      </AuthLayout>
    )
  },
  {
    path: '/forgot-password',
    element: (
      <AuthLayout>
        <ForgotPassword />
      </AuthLayout>
    )
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: '/lost-items',
        element: (
          <ProtectedRoute>
            <LostItems />
          </ProtectedRoute>
        )
      },
      {
        path: '/found-items',
        element: (
          <ProtectedRoute>
            <FoundItems />
          </ProtectedRoute>
        )
      },
      {
        path: '/found-items/:id',
        element: (
          <ProtectedRoute>
            <ItemDetails />
          </ProtectedRoute>
        )
      },
      {
        path: '/lost-items/:id',
        element: (
          <ProtectedRoute>
            <ItemDetails />
          </ProtectedRoute>
        )
      },
      {
        path: '/my-found-items/:id',
        element: (
          <ProtectedRoute>
            <PersonalItemDetails />
          </ProtectedRoute>
        )
      },
      {
        path: '/my-lost-items/:id',
        element: (
          <ProtectedRoute>
            <PersonalItemDetails />
          </ProtectedRoute>
        )
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )
      },
      {
        path: '/create-listing',
        element: (
          <ProtectedRoute>
            <CreateListing />
          </ProtectedRoute>
        )
      },
      {
        path : "/edit-profile",
        element : (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        )
      },
      {
        path:"/claims-form",
        element:(
          <ProtectedRoute>
            <ClaimForm />
          </ProtectedRoute>
        )
      },
      {
        path:"/item-claims/:found_item_id",
        element:(
          <ProtectedRoute>
            <ItemClaims />
          </ProtectedRoute>
        )
      },
      {
        path:"/item-found-claims/:lost_item_id",
        element:(
          <ProtectedRoute>
            <LostItemReports />
          </ProtectedRoute>
        )
      },
      {
        path:"/my-claims",
        element:(
          <ProtectedRoute>
          <MyClaims />
          </ProtectedRoute>
        )
      },
      {
        path:"/my-reports",
        element:(
          <ProtectedRoute>
          <MyReports />
          </ProtectedRoute>
        )
      }
    ]
  }
]);
