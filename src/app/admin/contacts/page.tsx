"use client";

import Inbox from "@/components/admin/Inbox";

export default function AdminContacts() {
  return (
    <Inbox
      endpoint="/api/contacts"
      title="Contact Requests"
      subtitle="Messages submitted through the contact form."
      icon="📥"
      statuses={["new", "read", "replied"]}
      nameKey="fullName"
      emailKey="email"
      summaryKey="service"
      bodyKey="message"
      detailFields={[
        { key: "fullName", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "company", label: "Company" },
        { key: "service", label: "Service Required" },
        { key: "budget", label: "Budget" },
      ]}
      statusColors={{
        new: "bg-amber-500/15 text-amber-500",
        read: "bg-sky-500/15 text-sky-500",
        replied: "bg-emerald-500/15 text-emerald-500",
      }}
    />
  );
}
