"use client";

import { useEffect, useState } from "react";
import { getPaymentSettings, updatePaymentSettings } from "@/lib/an-sdk/payments";

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getPaymentSettings()
      .then(data => setSettings(data.settings))
      .catch(err => console.log(err));
  }, []);

  const update = async () => {
    try {
      await updatePaymentSettings(settings);
      alert("Saved");
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">Payment Settings</h1>

      {/* TOGGLES */}
      {["cod", "razorpay", "upi", "whatsapp"].map((key) => (
        <label key={key} className="flex justify-between">
          <span>{key.toUpperCase()}</span>
          <input
            type="checkbox"
            checked={settings[key]}
            onChange={(e) =>
              setSettings({ ...settings, [key]: e.target.checked })
            }
          />
        </label>
      ))}

      {/* UPI */}
      <input
        placeholder="UPI ID"
        value={settings.upiId}
        onChange={(e) =>
          setSettings({ ...settings, upiId: e.target.value })
        }
        className="border p-2 w-full"
      />

      {/* WHATSAPP */}
      <input
        placeholder="WhatsApp Number"
        value={settings.whatsappNumber}
        onChange={(e) =>
          setSettings({ ...settings, whatsappNumber: e.target.value })
        }
        className="border p-2 w-full"
      />

      <button
        onClick={update}
        className="bg-black text-white px-4 py-2"
      >
        Save
      </button>

    </div>
  );
}
