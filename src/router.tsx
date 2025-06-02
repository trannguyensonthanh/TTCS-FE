import { QueryClient } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RoleProvider } from '@/context/RoleContext';
import { motion, AnimatePresence } from 'framer-motion';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Import Event Pages
import EventsList from './pages/Events/EventsList';
import EventsNew from './pages/Events/EventsNew';
import EventsCancelRequests from './pages/Events/EventsCancelRequests';
import EventsApprove from './pages/Events/EventsApprove';
import EventParticipants from './pages/Events/EventParticipants';

// Import Facility Pages
import RoomRequests from './pages/Facilities/RoomRequests';
import Rooms from './pages/Facilities/RoomsPage';
import RoomChangeRequests from './pages/Facilities/RoomChangeRequests';
import Equipment from './pages/Facilities/Equipment';
import RoomSchedule from './pages/Facilities/RoomSchedule';

// Import Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import DepartmentDashboard from './pages/Dashboard/DepartmentDashboard';
import EventsDashboard from './pages/Dashboard/EventsDashboard';
import ClubsDashboard from './pages/Dashboard/ClubsDashboard';
import UnionDashboard from './pages/Dashboard/UnionDashboard';
import FacilitiesDashboard from './pages/Dashboard/FacilitiesDashboard';

// Import User Management Pages
import Users from './pages/Users/Users';
import Students from './pages/Users/Students';
import Lecturers from './pages/Users/Lecturers';
import Roles from './pages/Users/Roles';

// Import Unit Management Pages
import Units from './pages/Units/Units';
import Departments from './pages/Units/Departments';
import Clubs from './pages/Units/Clubs';
import Union from './pages/Units/Union';
import Majors from './pages/Units/Majors';
import Classes from './pages/Units/Classes';
import BuildingsPage from './pages/Units/BuildingsPage'; // Ví dụ đường dẫn
import FloorTypesPage from './pages/Units/FloorTypesPage'; // Ví dụ đường dẫn
import BuildingFloorsPage from './pages/Units/BuildingFloorsPage'; // Ví dụ đường dẫn
// Import Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import EventsPublic from '@/pages/EventsPublic';

const queryClient = new QueryClient();

const AppRouter = () => {
  // Page transition wrapper
  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/events-public"
                element={
                  <ProtectedRoute>
                    <EventsPublic />
                  </ProtectedRoute>
                }
              />

              {/* Events Routes */}
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/new"
                element={
                  <ProtectedRoute>
                    <EventsNew />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/cancel-requests"
                element={
                  <ProtectedRoute>
                    <EventsCancelRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/approve"
                element={
                  <ProtectedRoute>
                    <EventsApprove />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:eventId/participants"
                element={
                  <ProtectedRoute>
                    <EventParticipants />
                  </ProtectedRoute>
                }
              />

              {/* Facilities Routes */}
              <Route
                path="/facilities/room-requests"
                element={
                  <ProtectedRoute>
                    <RoomRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/rooms"
                element={
                  <ProtectedRoute>
                    <Rooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-schedule"
                element={
                  <ProtectedRoute>
                    <RoomSchedule />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-change-requests"
                element={
                  <ProtectedRoute>
                    <RoomChangeRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/equipment"
                element={
                  <ProtectedRoute>
                    <Equipment />
                  </ProtectedRoute>
                }
              />

              {/* Quản lý Tòa Nhà */}
              <Route
                path="/units/buildings"
                element={
                  <ProtectedRoute>
                    <BuildingsPage />
                  </ProtectedRoute>
                }
              />
              {/* Quản lý Loại Tầng */}
              <Route
                path="/units/floor-types"
                element={
                  <ProtectedRoute>
                    <FloorTypesPage />
                  </ProtectedRoute>
                }
              />
              {/* Quản lý Tầng của một Tòa Nhà cụ thể */}
              <Route
                path="/units/buildings/:toaNhaId/floors"
                element={
                  <ProtectedRoute>
                    <BuildingFloorsPage />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/department"
                element={
                  <ProtectedRoute>
                    <DepartmentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/events"
                element={
                  <ProtectedRoute>
                    <EventsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/clubs"
                element={
                  <ProtectedRoute>
                    <ClubsDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/union"
                element={
                  <ProtectedRoute>
                    <UnionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/facilities"
                element={
                  <ProtectedRoute>
                    <FacilitiesDashboard />
                  </ProtectedRoute>
                }
              />

              {/* User Management Routes */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/students"
                element={
                  <ProtectedRoute>
                    <Students />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/lecturers"
                element={
                  <ProtectedRoute>
                    <Lecturers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/roles"
                element={
                  <ProtectedRoute>
                    <Roles />
                  </ProtectedRoute>
                }
              />

              {/* Units Management Routes */}
              <Route
                path="/units"
                element={
                  <ProtectedRoute>
                    <Units />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/departments"
                element={
                  <ProtectedRoute>
                    <Departments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/clubs"
                element={
                  <ProtectedRoute>
                    <Clubs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/union"
                element={
                  <ProtectedRoute>
                    <Union />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/majors"
                element={
                  <ProtectedRoute>
                    <Majors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/units/classes"
                element={
                  <ProtectedRoute>
                    <Classes />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
