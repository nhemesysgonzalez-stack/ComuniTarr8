import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import Sidebar from './components/Sidebar';
import { ChatWidget } from './components/ChatWidget';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Forum from './pages/Forum';
import Patrols from './pages/Patrols';
import Emergency from './pages/Emergency';
import Challenges from './pages/Challenges';
import Banned from './pages/Banned';
import CommunityInfo from './pages/CommunityInfo';
import LocalBusinesses from './pages/LocalBusinesses';
import Clubs from './pages/Clubs';
import Workshops from './pages/Workshops';
import Assistant from './pages/Assistant';
import Advertise from './pages/Advertise';
import VitalNeeds from './pages/VitalNeeds';
import Dashboard from './pages/Dashboard';
import Polls from './pages/Polls';
import SupportCircles from './pages/SupportCircles';
import MicroVolunteering from './pages/MicroVolunteering';
import CommunityStories from './pages/CommunityStories';
import NeighborhoodCalendar from './pages/Calendar';
import Announcements from './pages/Announcements';
import Marketplace from './pages/Marketplace';
import { Services } from './pages/Services';
import MapView from './pages/MapView';
import Login from './pages/Login';
import NeighborhoodSelection from './pages/NeighborhoodSelection';
import Admin from './pages/Admin';
import Neighbors from './pages/Neighbors';
import Invite from './pages/Invite';
import Incidents from './pages/Incidents';
import BusinessDirectory from './pages/BusinessDirectory';
import { SOSButton } from './components/SOSButton';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { logActivity } from './services/activityLogger';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark text-primary font-black">Cargando ComuniTarr...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.user_metadata?.banned) {
    return <Navigate to="/banned" replace />;
  }

  if (!user.user_metadata?.neighborhood && location.pathname !== '/select-neighborhood') {
    return <Navigate to="/select-neighborhood" replace />;
  }

  return <>{children}</>;
};

import { FloatingCommunityWidget } from './components/FloatingCommunityWidget';
import DynamicThemeEffects from './components/DynamicThemeEffects';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    logActivity('page_view', { path: location.pathname });
  }, [location]);

  return (
    <div className="flex bg-background-light dark:bg-background-dark min-h-screen font-sans overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 pb-20 lg:pb-0 relative">
          {children}
        </main>
      </div>
      <ChatWidget />
      <FloatingCommunityWidget />
      <DynamicThemeEffects />
      <SOSButton />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/banned" element={<Banned />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/forum" element={<Forum />} />
                      <Route path="/calendar" element={<NeighborhoodCalendar />} />
                      <Route path="/market" element={<Marketplace />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/map" element={<MapView />} />
                      <Route path="/patrols" element={<Patrols />} />
                      <Route path="/emergency" element={<Emergency />} />
                      <Route path="/challenges" element={<Challenges />} />
                      <Route path="/community-info" element={<CommunityInfo />} />
                      <Route path="/local-businesses" element={<LocalBusinesses />} />
                      <Route path="/clubs" element={<Clubs />} />
                      <Route path="/workshops" element={<Workshops />} />
                      <Route path="/assistant" element={<Assistant />} />
                      <Route path="/advertise" element={<Advertise />} />
                      <Route path="/vital" element={<VitalNeeds />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/polls" element={<Polls />} />
                      <Route path="/support" element={<SupportCircles />} />
                      <Route path="/volunteering" element={<MicroVolunteering />} />
                      <Route path="/stories" element={<CommunityStories />} />
                      <Route path="/announcements" element={<Announcements />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/select-neighborhood" element={<NeighborhoodSelection />} />
                      <Route path="/neighbors" element={<Neighbors />} />
                      <Route path="/invite" element={<Invite />} />
                      <Route path="/incidents" element={<Incidents />} />
                      <Route path="/business-directory" element={<BusinessDirectory />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
