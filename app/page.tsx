import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GoldRatesDisplay } from "@/components/gold-rates-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 relative overflow-hidden">
      {/* Decorative gold elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(to right, rgba(184,134,11,0.2) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(184,134,11,0.2) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      
      <nav className="relative container mx-auto px-4 py-6 flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-lg mx-4 mt-4 shadow-lg">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
          GoldLink
        </h1>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Register</Button>
          </Link>
        </div>
      </nav>

      <main className="relative container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 bg-clip-text text-transparent">
            Welcome to GoldLink
          </h2>
          <p className="text-xl text-amber-900/80 mb-8 font-medium">
            Connect with jewelers and manage your gold assets seamlessly
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-3xl font-semibold mb-6 text-center text-amber-800">Live Gold Rates</h3>
          <GoldRatesDisplay />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>For Customers</CardTitle>
              <CardDescription>Apply with your gold items</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Apply with gold item details</li>
                <li>✓ Track application status</li>
                <li>✓ Manage settlements</li>
                <li>✓ Pay monthly interest</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>For Owners</CardTitle>
              <CardDescription>Manage customer applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Review applications</li>
                <li>✓ Approve or reject requests</li>
                <li>✓ Set interest rates</li>
                <li>✓ Track settlements</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>Built with security in mind</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Secure payments via Razorpay</li>
                <li>✓ Real-time gold rates</li>
                <li>✓ Complete audit trail</li>
                <li>✓ Role-based access</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

