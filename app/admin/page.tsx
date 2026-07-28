import AdminSearch from "@/components/AdminSearch";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Search by name or phone number to view, edit, or delete a registration
        </p>
      </div>
      <AdminSearch />
    </div>
  );
}
