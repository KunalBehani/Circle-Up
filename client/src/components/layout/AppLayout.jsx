import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { LeftSidebar } from './LeftSidebar.jsx';
import { RightSidebar } from './RightSidebar.jsx';
import { MobileDrawer, MobileBottomBar } from './MobileNav.jsx';
import { CreateCommunityModal } from '../communities/CreateCommunityModal.jsx';
import { ToastContainer } from '../common/ToastContainer.jsx';

export const AppLayout = ({ showRightSidebar = true }) => {
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top sticky navbar */}
      <Navbar
        onOpenCreateCommunity={() => setCreateCommunityOpen(true)}
        onToggleMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main 3-column desktop layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          {/* Left Column */}
          <LeftSidebar
            onOpenCreateCommunity={() => setCreateCommunityOpen(true)}
          />

          {/* Central Column */}
          <main className="flex-1 min-w-0 pb-16 lg:pb-0">
            <Outlet />
          </main>

          {/* Right Column */}
          {showRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenCreateCommunity={() => setCreateCommunityOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomBar
        onOpenCreateCommunity={() => setCreateCommunityOpen(true)}
      />

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
