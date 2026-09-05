import Link from "next/link";
import { LandingHero } from "@/components/landing-hero";

const STEPS = [
  { icon: "🧑‍🌾", title: "Farmer lists produce", text: "The farmer picks the nearest White Store — suggested automatically — and lists what they're bringing." },
  { icon: "⚖️", title: "Weighed, graded, paid", text: "Store staff weigh the produce, assign a quality grade, and pay the farmer on the spot." },
  { icon: "🏷️", title: "QR-coded batch", text: "Every accepted lot becomes a unique batch with a QR code carrying its quality and tracking details." },
  { icon: "🏢", title: "Buyers browse & order", text: "Bulk buyers filter and rank batches by price, grade, quantity and distance — and order directly." },
  { icon: "🚚", title: "Delivered & verified", text: "Logistics delivers; the buyer scans the QR to verify origin and quality before confirming receipt." },
];

const ROLES = [
  { icon: "🧑‍🌾", name: "Farmer", text: "List produce, get paid immediately at the counter, and declare next season's crops." },
  { icon: "🏪", name: "White Store", text: "Manager dashboard for sales, purchases, inventory, farmer records and cash in/out." },
  { icon: "🧑‍💼", name: "Store Employee", text: "Register farmers, weigh and grade produce, pay farmers, create QR batches, manage orders." },
  { icon: "🏢", name: "Bulk Buyer", text: "Browse scored batches, filter by quality and distance, order directly, verify by QR." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHero />

      <div className="relative z-10 bg-white">
      {/* How it works */}
      <section className="bg-off-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-text-primary">
            One complete transaction, end to end
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-light text-xs font-bold text-green-dark">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-text-primary">Built for every stakeholder</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <div key={role.name} className="rounded-2xl border border-hairline p-5">
              <span className="text-3xl">{role.icon}</span>
              <h3 className="mt-3 font-semibold text-text-primary">{role.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{role.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-primary py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-white">
            Aggregation turns 20 kg into a market position.
          </h2>
          <p className="mt-3 text-white/80">
            Farmer A has 20 kg, Farmer B has 30 kg, Farmer C has 50 kg. Alone, invisible to bulk
            buyers. Together at a White Store: 100 kg of graded, QR-verified, sellable supply.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-green-primary transition hover:bg-green-light"
          >
            Get started with Agri Setu
          </Link>
        </div>
      </section>

      <footer className="border-t border-hairline py-6 text-center text-xs text-text-muted">
        Agri Setu — Smart India Hackathon prototype
      </footer>
      </div>
    </div>
  );
}
