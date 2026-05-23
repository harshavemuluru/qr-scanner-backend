"use client";

import { useState } from "react";
import EntryForm from "@/components/EntryForm";
import ExcelUpload from "@/components/ExcelUpload";

type Tab = "individual" | "bulk";

export default function OnboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("individual");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboard VIP</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add new entries individually or import from a spreadsheet</p>
      </div>

      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {(["individual", "bulk"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {tab === "individual" ? "Individual" : "Bulk Upload"}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === "individual" ? <EntryForm /> : <ExcelUpload />}
      </div>
    </div>
  );
}
