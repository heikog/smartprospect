import { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "Smart Prospect | Dashboard",
};

export default function DashboardPage() {
  return <Dashboard />;
}
