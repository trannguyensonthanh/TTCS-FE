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
import Profile from './pages/ProfilePage';
import NotFound from './pages/NotFound';

// Import Event Pages
import EventsList from './pages/Events/EventsList';
import EventsNew from './pages/Events/EventsNew';
import EventsCancelRequests from './pages/Events/EventsCancelRequests';
import EventsApprove from './pages/Events/EventsApprove';
import EventParticipants from './pages/Events/EventParticipants';

// Import Facility Pages
// import RoomRequests from './pages/Facilities/RoomRequests';
import Rooms from './pages/Facilities/RoomsPage';
// import RoomChangeRequests from './pages/Facilities/RoomChangeRequests';

import RoomSchedule from './pages/Facilities/RoomSchedulePage';

// Import Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
// import DepartmentDashboard from './pages/Dashboard/DepartmentDashboard';
import EventsDashboard from './pages/Dashboard/EventsDashboard';
// import ClubsDashboard from './pages/Dashboard/ClubsDashboard';
// import UnionDashboard from './pages/Dashboard/UnionDashboard';
import FacilitiesDashboard from './pages/Dashboard/FacilitiesDashboard';

// Import User Management Pages
import Users from './pages/Users/UsersPage.tsx';

// Import Unit Management Pages
import Units from './pages/Units/OrganizationalUnitsPage.tsx';
import Departments from './pages/Units/Departments';
import Clubs from './pages/Units/Clubs';
import Union from './pages/Units/Union';
import Majors from './pages/Units/MajorsAndSpecializationsPage';
import Classes from './pages/Units/ClassesPage';
import BuildingsPage from './pages/Units/BuildingsPage'; // Ví dụ đường dẫn
import FloorTypesPage from './pages/Units/FloorTypesPage'; // Ví dụ đường dẫn
import BuildingFloorsPage from './pages/Units/BuildingFloorsPage'; // Ví dụ đường dẫn
// Import Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';
import EventsPublic from '@/pages/EventsPublic';
import EquipmentPage from '@/pages/Facilities/EquipmentPage';
import CreateRoomRequestPage from '@/pages/Facilities/CreateRoomRequestPage';
import ClientLayout from '@/components/ClientLayout';
import AboutPage from '@/pages/AboutPage';
import { Contact } from 'lucide-react';
import ContactPage from '@/pages/ContactPage';
import SupportPage from '@/pages/SupportPage';
import NotificationsPage from '@/pages/NotificationsPage';
import EventsEditPage from '@/pages/Events/EventsEditPage';
import RolesPage from '@/pages/Users/Roles/RolesPage.tsx';
import RoomRequestsListPage from '@/pages/Facilities/RoomRequestsListPage.tsx';
import ProcessRoomRequestPage from '@/pages/Facilities/ProcessRoomRequestPage.tsx';
import RoomChangeRequestsListPage from '@/pages/Facilities/RoomChangeRequestsListPage.tsx';
import CreateRoomChangeRequestPage from '@/pages/Facilities/CreateRoomChangeRequestPage.tsx';
import ProcessRoomChangeRequestPage from '@/pages/Facilities/ProcessRoomChangeRequestPage.tsx';
import EditRoomRequestPage from '@/pages/Facilities/EditRoomRequestPage.tsx';
import RoomsExplorerPage from '@/pages/Facilities/RoomsExplorerPage.tsx';
import RoomDetailPage from '@/pages/Facilities/RoomDetailPage.tsx';
import PublicRoomDetailPage from '@/pages/Facilities/PublicRoomDetailPage.tsx';
import UserDetailPage from '@/pages/Users/UserDetailPage.tsx';
import InviteToEventPage from '@/pages/Invitations/InviteToEventPage.tsx';
import MyInvitationsPage from '@/pages/MyInvitations/MyInvitationsPage.tsx';
import MyAttendedEventsPage from '@/pages/MyAttendedEvents/MyAttendedEventsPage.tsx';

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
              <Route
                path="/"
                element={
                  <ClientLayout>
                    <Index />
                  </ClientLayout>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route
                path="/forgot-password"
                element={
                  <ClientLayout>
                    <ForgotPassword />
                  </ClientLayout>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <ClientLayout>
                    <VerifyOTP />
                  </ClientLayout>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <ClientLayout>
                    <ResetPassword />
                  </ClientLayout>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ClientLayout>
                      <Profile />
                    </ClientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-attended-events" // Hoặc /history/events, /my-activity
                element={
                  <ProtectedRoute>
                    <ClientLayout>
                      <MyAttendedEventsPage />
                    </ClientLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ClientLayout>
                    <AboutPage />
                  </ClientLayout>
                }
              />
              <Route
                path="/rooms-explorer"
                element={
                  <ClientLayout>
                    <RoomsExplorerPage />
                  </ClientLayout>
                }
              />
              <Route
                path="/rooms-explorer/:roomId"
                element={
                  <ClientLayout>
                    <PublicRoomDetailPage />
                  </ClientLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <ClientLayout>
                    <ContactPage />
                  </ClientLayout>
                }
              />
              <Route
                path="/support"
                element={
                  <ClientLayout>
                    <SupportPage />
                  </ClientLayout>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ClientLayout>
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  </ClientLayout>
                }
              />

              <Route
                path="/my-invitations"
                element={
                  <ProtectedRoute>
                    <ClientLayout>
                      <MyInvitationsPage />
                    </ClientLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/events-public"
                element={
                  <ProtectedRoute>
                    <ClientLayout>
                      <EventsPublic />
                    </ClientLayout>
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
                path="/events/edit/:eventId"
                element={
                  <ProtectedRoute>
                    <EventsEditPage />
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
              <Route
                path="/manage-invitations/new"
                element={
                  <ProtectedRoute>
                    <InviteToEventPage />
                  </ProtectedRoute>
                }
              />
              {/* Facilities Routes */}
              <Route
                path="/facilities/room-requests"
                element={
                  <ProtectedRoute>
                    {/* <RoomRequests /> */}
                    <RoomRequestsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-requests/new"
                element={
                  <ProtectedRoute>
                    <CreateRoomRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-requests/edit/:ycMuonPhongID"
                element={
                  <ProtectedRoute>
                    <EditRoomRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-requests/process/:ycMuonPhongID"
                element={
                  <ProtectedRoute>
                    <ProcessRoomRequestPage />
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
                path="/facilities/rooms/:roomId"
                element={
                  <ProtectedRoute>
                    <RoomDetailPage />
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
                    {/* <RoomChangeRequests /> */}
                    <RoomChangeRequestsListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/facilities/room-change-requests/new"
                element={
                  <ProtectedRoute>
                    <CreateRoomChangeRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/room-change-requests/process/:ycDoiPhongID"
                element={
                  <ProtectedRoute>
                    <ProcessRoomChangeRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/equipment"
                element={
                  <ProtectedRoute>
                    <EquipmentPage />
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
              {/* <Route
                path="/dashboard/department"
                element={
                  <ProtectedRoute>
                    <DepartmentDashboard />
                  </ProtectedRoute>
                }
              /> */}
              <Route
                path="/dashboard/events"
                element={
                  <ProtectedRoute>
                    <EventsDashboard />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                path="/dashboard/clubs"
                element={
                  <ProtectedRoute>
                    <ClubsDashboard />
                  </ProtectedRoute>
                }
              /> */}
              {/* <Route
                path="/dashboard/union"
                element={
                  <ProtectedRoute>
                    <UnionDashboard />
                  </ProtectedRoute>
                }
              /> */}
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
                path="/users/:userId/detail"
                element={
                  <ProtectedRoute>
                    <UserDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/roles"
                element={
                  <ProtectedRoute>
                    <RolesPage />
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
