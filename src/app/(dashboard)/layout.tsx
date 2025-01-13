import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <div className="hidden lg:w-1/4 lg:block bg-red-400">
        <Sidebar />
      </div>

      <main className="bg-blue-400 w-full lg:w-3/4">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
