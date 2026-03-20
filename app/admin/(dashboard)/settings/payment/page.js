"use client";

import { useEffect, useState } from "react";

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch("/api/payment/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings));
  }, []);

  const updateSettings = async (newSettings) => {
    const res = await fetch("/api/admin/payment-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });

    const data = await res.json();
    setSettings(data.settings);
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Payment Settings</h1>

      {["cod", "whatsapp", "razorpay"].map((key) => (
        <div key={key} className="flex justify-between">
          <span>{key.toUpperCase()}</span>

          <input
            type="checkbox"
            checked={settings[key]}
            onChange={() =>
              updateSettings({
                ...settings,
                [key]: !settings[key],
              })
            }
          />
        </div>
      ))}

      <input
        placeholder="WhatsApp Number"
        value={settings.whatsappNumber}
        onChange={(e) =>
          updateSettings({
            ...settings,
            whatsappNumber: e.target.value,
          })
        }
        className="border p-2 w-full"
      />
    </div>
  );
}
