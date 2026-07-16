import EntryForm from "@/components/EntryForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Fill in your details to get your QR entry pass
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <EntryForm />
      </div>
    </div>
  );
}
