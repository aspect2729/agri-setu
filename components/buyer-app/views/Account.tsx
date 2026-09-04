"use client";

import { useState } from "react"
import type { AppNav } from "../nav"
import { useBuyerData } from "../data-context"
import { signOut } from "@/lib/actions"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{ width: 40, height: 22 }}
      className={`relative rounded-full transition-colors shrink-0 ${checked ? "bg-forest-mid" : "bg-border-dark"}`}
    >
      <div
        style={{ width: 18, height: 18, top: 2, left: checked ? 20 : 2 }}
        className="absolute rounded-full bg-white shadow-sm transition-all"
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 md:p-6">
      <h3 className="font-serif text-base md:text-lg font-medium text-forest mb-4 md:mb-5">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, type = "text", mono }: { label: string; value: string; type?: string; mono?: boolean }) {
  const [val, setVal] = useState(value)
  const [editing, setEditing] = useState(false)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-sage mb-0.5">{label}</p>
        {editing ? (
          <input
            autoFocus type={type} value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={() => setEditing(false)}
            className={`text-sm text-forest bg-ivory border border-forest-mid rounded-lg px-2 py-1 outline-none w-full md:w-64 ${mono ? "font-mono" : ""}`}
          />
        ) : (
          <p className={`text-sm font-medium text-forest truncate ${mono ? "font-mono" : ""}`}>{val}</p>
        )}
      </div>
      <button onClick={() => setEditing(!editing)} className="text-xs text-forest-mid hover:text-forest shrink-0">
        {editing ? "Save" : "Edit"}
      </button>
    </div>
  )
}

const ALL_CROPS = ["Tomatoes", "Potatoes", "Onions", "Carrots", "Green Chillies", "Cabbage", "Brinjal", "Cauliflower"]

const SECTIONS = [
  { id: "profile", label: "Business Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "locations", label: "Locations" },
  { id: "notifications", label: "Notifications" },
] as const

type SectionId = typeof SECTIONS[number]["id"]

export default function Account({ navigate }: AppNav) {
  const { buyerName, buyerVillage, buyerPhone, orders, listings } = useBuyerData()
  const mark = buyerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
  const [activeSection, setActiveSection] = useState<SectionId>("profile")
  const [preferredCrops, setPreferredCrops] = useState(["Tomatoes", "Potatoes", "Onions", "Carrots"])
  const [preferredGrade, setPreferredGrade] = useState("A")
  const [preferredRegions, setPreferredRegions] = useState(["Karnataka"])
  const [notifOrders, setNotifOrders] = useState(true)
  const [notifMatches, setNotifMatches] = useState(true)
  const [notifClearance, setNotifClearance] = useState(false)
  const [notifDelivery, setNotifDelivery] = useState(true)

  const toggleCrop = (c: string) =>
    setPreferredCrops((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="mb-5 md:mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-forest">Account</h1>
        <p className="text-sage mt-1 text-sm">Business profile and procurement preferences.</p>
      </div>

      {/* Mobile: horizontal tab scroll. Desktop: sidebar + content */}
      <div className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-6">
        {/* Mobile tabs */}
        <div className="md:hidden overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 bg-ivory-dark rounded-xl p-1 w-fit min-w-full">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeSection === s.id ? "bg-white text-forest shadow-sm" : "text-sage"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden md:block md:col-span-1">
          <div className="bg-white rounded-xl border border-border p-2 sticky top-24">
            <div className="flex items-center gap-3 p-3 mb-2">
              <div className="w-11 h-11 bg-forest-mid rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0">{mark}</div>
              <div className="min-w-0">
                <p className="font-semibold text-forest text-sm leading-none">{buyerName}</p>
                <p className="text-xs text-sage mt-0.5">Bulk Buyer</p>
              </div>
            </div>
            <div className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeSection === s.id ? "bg-forest-mid text-white font-medium" : "text-sage hover:text-forest hover:bg-ivory"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <form action={signOut}>
                <button type="submit" className="w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error-light transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-4">
          {activeSection === "profile" && (
            <>
              <Section title="Business Information">
                <Field label="Business Name" value={buyerName} />
                <Field label="Business Type" value="Bulk Buyer" />
                <Field label="GST Number" value="—" mono />
                <Field label="Contact Person" value={buyerName} />
                <Field label="Phone" value={buyerPhone ?? "—"} type="tel" mono />
                <Field label="Email" value="—" type="email" />
              </Section>

              <Section title="Business Address">
                <Field label="City" value={buyerVillage ?? "—"} />
                <Field label="Region" value={buyerVillage ?? "—"} />
                <Field label="Address" value={buyerVillage ?? "—"} />
                <Field label="PIN Code" value="—" mono />
              </Section>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total orders", value: String(orders.length) },
                  { label: "Total spent", value: `₹${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}` },
                  { label: "Listings", value: String(listings.length) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-border rounded-xl p-3.5 text-center">
                    <p className="font-mono text-xl font-semibold text-forest">{value}</p>
                    <p className="text-xs text-sage mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "preferences" && (
            <>
              <Section title="Preferred Crops">
                <p className="text-xs text-sage mb-3">Select crops you frequently purchase.</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CROPS.map((crop) => (
                    <button
                      key={crop}
                      onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        preferredCrops.includes(crop)
                          ? "bg-forest-mid text-white border-forest-mid"
                          : "border-border text-sage hover:border-forest-mid hover:text-forest"
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Quality Preference">
                <div className="flex gap-3">
                  {["A", "B", "C"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setPreferredGrade(g)}
                      className={`flex-1 py-4 text-center border rounded-xl transition-all ${
                        preferredGrade === g ? "bg-forest-mid text-white border-forest-mid" : "border-border text-sage hover:border-forest-mid"
                      }`}
                    >
                      <p className="text-xl font-semibold">Grade {g}</p>
                      <p className="text-[11px] mt-0.5 opacity-70">{g === "A" ? "Premium" : g === "B" ? "Standard" : "Economy"}</p>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Preferred Sourcing Regions">
                <div className="flex flex-wrap gap-2">
                  {["Karnataka", "Andhra Pradesh", "Tamil Nadu", "Maharashtra", "Telangana"].map((region) => (
                    <button
                      key={region}
                      onClick={() => setPreferredRegions((p) =>
                        p.includes(region) ? p.filter((r) => r !== region) : [...p, region]
                      )}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                        preferredRegions.includes(region)
                          ? "bg-sage-pale text-forest-mid border-sage-light"
                          : "border-border text-sage hover:border-forest-mid hover:text-forest"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Typical Order Size">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-sage mb-1.5 block">Min per order (kg)</label>
                    <input defaultValue="500" type="number" className="w-full px-3 py-2.5 bg-ivory border border-border rounded-xl text-sm font-mono text-forest outline-none focus:border-forest-mid" />
                  </div>
                  <div>
                    <label className="text-xs text-sage mb-1.5 block">Max per order (kg)</label>
                    <input defaultValue="5000" type="number" className="w-full px-3 py-2.5 bg-ivory border border-border rounded-xl text-sm font-mono text-forest outline-none focus:border-forest-mid" />
                  </div>
                </div>
                <button className="mt-4 px-5 py-2.5 bg-forest-mid text-white text-sm font-medium rounded-xl hover:bg-forest-light transition-colors">
                  Save Preferences
                </button>
              </Section>
            </>
          )}

          {activeSection === "locations" && (
            <Section title="Delivery Locations">
              <p className="text-xs text-sage mb-4">Manage your delivery destinations.</p>
              <div className="space-y-3 mb-4">
                {[
                  { name: "Primary delivery", address: buyerVillage ?? "Add a delivery location", primary: true },
                ].map((loc, i) => (
                  <div key={i} className="border border-border rounded-xl p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-forest text-sm">{loc.name}</p>
                        {loc.primary && (
                          <span className="text-[10px] font-medium bg-sage-pale text-forest-mid px-2 py-0.5 rounded-full">Primary</span>
                        )}
                      </div>
                      <p className="text-xs text-sage leading-relaxed">{loc.address}</p>
                    </div>
                    <button className="text-xs text-forest-mid hover:text-forest shrink-0">Edit</button>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 border-2 border-dashed border-border rounded-xl text-sm text-sage hover:text-forest hover:border-forest-mid transition-colors flex items-center justify-center gap-1.5">
                <span className="text-lg leading-none">+</span> Add location
              </button>
            </Section>
          )}

          {activeSection === "notifications" && (
            <Section title="Notification Preferences">
              <div className="space-y-4">
                {[
                  { label: "Order updates", desc: "Status changes, dispatch and delivery alerts", value: notifOrders, setter: setNotifOrders },
                  { label: "New matches", desc: "When produce matching your requirements is available", value: notifMatches, setter: setNotifMatches },
                  { label: "Clearance deals", desc: "Surplus produce at reduced prices", value: notifClearance, setter: setNotifClearance },
                  { label: "Delivery reminders", desc: "Upcoming delivery confirmations", value: notifDelivery, setter: setNotifDelivery },
                ].map(({ label, desc, value, setter }) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-forest">{label}</p>
                      <p className="text-xs text-sage mt-0.5 leading-snug">{desc}</p>
                    </div>
                    <Toggle checked={value} onChange={setter} />
                  </div>
                ))}
              </div>
              <button className="mt-5 px-5 py-2.5 bg-forest-mid text-white text-sm font-medium rounded-xl hover:bg-forest-light transition-colors">
                Save settings
              </button>
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
