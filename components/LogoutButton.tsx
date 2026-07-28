"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="px-2 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#5B4B3A] hover:text-red-600 hover:bg-red-50 transition shrink-0 whitespace-nowrap"
    >
      Logout
    </button>
  );
}
