import Link from "next/link";
import { GoldRatesDisplay } from "@/components/gold-rates-display";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">GoldLink</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Secure Gold Lending Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with trusted jewelers. Get instant loans against your gold
            with transparent rates and flexible payment options.
          </p>
        </div>

        {/* Live Gold Rates */}
        <div className="max-w-4xl mx-auto mb-16">
          <GoldRatesDisplay />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Secure & Transparent</h3>
            <p className="text-gray-600">
              All transactions are secure with real-time tracking and receipts.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Flexible Payments</h3>
            <p className="text-gray-600">
              Pay monthly interest with easy online payment options.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Trusted Partners</h3>
            <p className="text-gray-600">
              Connect with verified jewelers in your area.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

