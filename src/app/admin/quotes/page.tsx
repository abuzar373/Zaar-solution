"use client";

import Inbox from "@/components/admin/Inbox";

export default function AdminQuotes() {
  return (
    <Inbox
      endpoint="/api/quotes"
      title="Quote Requests"
      subtitle="Project quote requests submitted through the website."
      icon="🧾"
      statuses={["pending", "reviewed", "accepted", "declined"]}
      nameKey="name"
      emailKey="email"
      summaryKey="projectType"
      bodyKey="description"
      detailFields={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "business", label: "Business" },
        { key: "projectType", label: "Project Type" },
        { key: "budget", label: "Budget" },
        { key: "deadline", label: "Deadline" },
      ]}
      statusColors={{
        pending: "bg-amber-500/15 text-amber-500",
        reviewed: "bg-sky-500/15 text-sky-500",
        accepted: "bg-emerald-500/15 text-emerald-500",
        declined: "bg-rose-500/15 text-rose-500",
      }}
    />
  );
}
