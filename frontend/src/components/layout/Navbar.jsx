import { Link, useLocation } from "react-router-dom"
import { Recycle, MessageSquare } from "lucide-react"
import { useState } from "react"
import Feedback from "../Feedback"

const Navbar = () => {
  const [showFeedback, setShowFeedback] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white border-b-2 border-gray-200 h-16 fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="flex items-center justify-between h-full px-8">
        <Link to="/" className="flex items-center space-x-3 text-gray-800 hover:text-gray-900 transition-colors group">
          <div className="p-2 bg-[#A8D5A2] rounded-lg group-hover:shadow-md transition-all">
            <Recycle className="h-6 w-6 text-gray-800" />
          </div>
          <span className="text-xl font-bold">Smart Waste Segregator</span>
        </Link>

        <nav className="flex items-center space-x-8">
          <Link
            to="/dashboard"
            className={`text-sm font-semibold transition-all ${
              isActive("/dashboard") || isActive("/")
                ? "text-gray-900 border-b-3 border-[#A8D5A2] pb-1"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/reports"
            className={`text-sm font-semibold transition-all ${
              isActive("/reports")
                ? "text-gray-900 border-b-3 border-[#A8D5A2] pb-1"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Reports
          </Link>
          <Link
            to="/rpi-health"
            className={`text-sm font-semibold transition-all ${
              isActive("/rpi-health")
                ? "text-gray-900 border-b-3 border-[#A8D5A2] pb-1"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            RPI Health
          </Link>
          <button
            onClick={() => setShowFeedback(true)}
            className="ml-4 px-4 py-2 bg-[#4CAF50] text-white text-sm font-semibold rounded-full hover:bg-[#43A047] transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Feedback</span>
          </button>
          {showFeedback && <Feedback onClose={() => setShowFeedback(false)} />}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
