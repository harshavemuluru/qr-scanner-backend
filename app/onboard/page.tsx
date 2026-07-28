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
        <h1 className="font-serif text-2xl font-bold text-[#2B2420]">Onboard VIP</h1>
        <p className="text-[#5B4B3A] text-sm mt-1">Add new entries individually or import from a spreadsheet</p>
      </div>

      <div className="flex rounded-xl bg-[#F0DFC4]/50 p-1 gap-1">
        {(["individual", "bulk"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? "bg-white text-[#2B2420] shadow-sm"
                : "text-[#5B4B3A] hover:text-[#2B2420]"
            }`}
          >
            {tab === "individual" ? "Individual" : "Bulk Upload"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#F0DFC4] p-6">
        {activeTab === "individual" ? <EntryForm /> : <ExcelUpload />}
      </div>
    </div>
  );
}
