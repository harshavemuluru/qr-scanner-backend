import AdminSearch from "@/components/AdminSearch";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#2B2420]">Admin</h1>
        <p className="text-[#5B4B3A] text-sm mt-1">
          Search by name or phone number to view, edit, or delete a registration
        </p>
      </div>
      <AdminSearch />
    </div>
  );
}
