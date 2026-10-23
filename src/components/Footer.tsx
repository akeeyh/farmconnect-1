import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🌾</span>
              <span className="text-xl font-bold text-white">FarmConnect</span>
            </div>
            <p className="text-sm text-gray-400">
              From Farm to Buyer, Smarter and Direct. Connecting farmers with consumers, retailers, and institutions.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/marketplace" className="hover:text-white transition">Marketplace</Link></li>
              <li><Link href="/farmers" className="hover:text-white transition">Find Farmers</Link></li>
              <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">For Farmers</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-white transition">Sell on FarmConnect</Link></li>
              <li><Link href="/farmer/dashboard" className="hover:text-white transition">Farmer Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="/" className="hover:text-white transition">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
