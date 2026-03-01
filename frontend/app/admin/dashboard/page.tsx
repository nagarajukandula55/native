import AdminGuard from "@/components/AdminGuard";

export default function Dashboard() {
  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold">
          Admin Dashboard
        </h1>
      </div>
    </AdminGuard>
  );
}
