"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { NavigateFn, Page } from "./types";
import Sidebar from "./chrome/Sidebar";
import TopBar from "./chrome/TopBar";

function PageFallback() {
  return <div className="p-8 text-sm text-slate-400">Loading…</div>;
}

const Dashboard = dynamic(() => import("./pages/Dashboard"), { loading: PageFallback });
const AvailableTrips = dynamic(() => import("./pages/AvailableTrips"), { loading: PageFallback });
const TripDetails = dynamic(() => import("./pages/TripDetails"), { loading: PageFallback });
const ActiveDelivery = dynamic(() => import("./pages/ActiveDelivery"), { loading: PageFallback });
const DeliveryCompletion = dynamic(() => import("./pages/DeliveryCompletion"), { loading: PageFallback });
const MyTrips = dynamic(() => import("./pages/MyTrips"), { loading: PageFallback });
const Earnings = dynamic(() => import("./pages/Earnings"), { loading: PageFallback });
const TripHistory = dynamic(() => import("./pages/TripHistory"), { loading: PageFallback });
const Vehicles = dynamic(() => import("./pages/Vehicles"), { loading: PageFallback });
const Profile = dynamic(() => import("./pages/Profile"), { loading: PageFallback });
const Notifications = dynamic(() => import("./pages/Notifications"), { loading: PageFallback });

const pageTitles: Record<Page, string> = {
  dashboard: "Dashboard",
  "available-trips": "Available Trips",
  "trip-details": "Trip Details",
  "active-delivery": "Active Delivery",
  "delivery-completion": "Complete Delivery",
  "my-trips": "My Trips",
  earnings: "Earnings",
  "trip-history": "Trip History",
  vehicles: "Vehicles",
  profile: "Profile",
  notifications: "Notifications",
};

export function LogisticsApp() {
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate: NavigateFn = (p, params) => {
    setPage(p);
    if (params?.tripId) setSelectedTripId(params.tripId);
    setNotificationsOpen(false);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard navigate={navigate} />;
      case "available-trips":
        return <AvailableTrips navigate={navigate} />;
      case "trip-details":
        return <TripDetails navigate={navigate} tripId={selectedTripId} />;
      case "active-delivery":
        return <ActiveDelivery navigate={navigate} tripId={selectedTripId} />;
      case "delivery-completion":
        return <DeliveryCompletion navigate={navigate} tripId={selectedTripId} />;
      case "my-trips":
        return <MyTrips navigate={navigate} />;
      case "earnings":
        return <Earnings navigate={navigate} />;
      case "trip-history":
        return <TripHistory navigate={navigate} />;
      case "vehicles":
        return <Vehicles navigate={navigate} />;
      case "profile":
        return <Profile navigate={navigate} />;
      case "notifications":
        return <Notifications navigate={navigate} />;
      default:
        return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <div className="logistics-shell h-dvh flex overflow-hidden bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        currentPage={page}
        navigate={navigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={pageTitles[page]}
          currentPage={page}
          navigate={navigate}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  );
}
