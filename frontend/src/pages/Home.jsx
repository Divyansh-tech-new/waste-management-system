import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Layout from "../components/layout/Layout"
import BinCard from "../components/BinCard"
import FeedbackForm from "../components/FeedbackForm"
import { 
  MoreHorizontal, 
  AlertCircle, 
  Calendar, 
  Zap, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Home as HomeIcon, 
  Info, 
  Users, 
  HelpCircle,
  BarChart2,
  Leaf 
} from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Main Home Component
function HomePage() {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [bins, setBins] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const feedbackResponse = await axios.get("https://waste-management-system-1-uyth.onrender.com/api/feedback")
      if (feedbackResponse.data.success) {
        setFeedback(feedbackResponse.data.data.feedback ? feedbackResponse.data.data.feedback.slice(0, 3) : [])
      }

      const binsResponse = await axios.get("https://waste-management-system-1-uyth.onrender.com/api/bins")
      if (binsResponse.data.success) {
        setBins(
          binsResponse.data.data.map((bin) => ({
            ...bin,
            type: bin.category || bin.type,
            fillLevel: bin.fillLevel || 0,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const forYouCards = [
    { 
      title: "Recent Alerts", 
      subtitle: "Worker", 
      icon: AlertCircle, 
      color: "bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7]",
      image: "https://images.unsplash.com/photo-1581092918484-8313e36c9fe6?w=400&h=300&fit=crop"
    },
    { 
      title: "Collection Schedule", 
      subtitle: "Feedback", 
      icon: Calendar, 
      color: "bg-gradient-to-br from-[#B2DFDB] to-[#80CBC4]",
      image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&h=300&fit=crop"
    },
    { 
      title: "How It Works", 
      subtitle: "Our Process", 
      icon: Zap, 
      color: "bg-gradient-to-br from-[#DCEDC8] to-[#C5E1A5]",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop"
    },
  ]

  const chartData = {
    labels: ["Biodegradable", "Non-Biodegradable", "Metal", "Others"],
    datasets: [
      {
        label: "Fill Level (%)",
        data: [65, 59, 80, 81],
        backgroundColor: "rgba(168, 213, 162, 0.6)",
        borderColor: "rgba(168, 213, 162, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Waste Segregation Overview",
      },
    },
  }

  // Scroll to section function
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Back to top button
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 400) {
      setShowScroll(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  return (
    <Layout>
      {/* Floating Feedback Button - Always Visible */}
      <div 
        className="fixed right-6 bottom-6 z-50 flex flex-col items-center gap-3"
        style={{ zIndex: 9999 }}
      >
        {/* Main Feedback Button */}
        <button 
          onClick={() => scrollToSection('feedback-section')}
          className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          style={{
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
          }}
        >
          <MessageSquare size={20} className="flex-shrink-0" />
          <span className="whitespace-nowrap">Give Feedback</span>
        </button>

        {/* Back to Top Button - Only shows when scrolled down */}
        {showScroll && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-all"
            title="Back to top"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Welcome Header */}
        <div id="home" className="flex flex-col md:flex-row items-start md:items-center justify-between pt-6 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Smart Waste!</h1>
            <p className="text-gray-600 mt-1">Monitor and manage your waste segregation system</p>
          </div>
          <Button 
            onClick={() => scrollToSection('feedback-section')}
            className="hidden md:flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md"
          >
            <MessageSquare size={18} />
            <span>Share Your Feedback</span>
          </Button>
        </div>

        {/* About Section */}
        <div id="about" className="py-12 bg-gradient-to-br from-[#F9FAFB] to-[#ECFDF5] rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">About Smart Waste Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-600 mb-4 text-lg">
                Our smart waste management system helps communities and businesses efficiently manage their waste
                through real-time monitoring, data analytics, and automated collection scheduling.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  '🌱 Real-time fill level monitoring',
                  '♻️ Smart sorting recommendations',
                  '📊 Data-driven waste reduction insights',
                  '🚛 Optimized collection routes',
                  '🌍 Environmental impact tracking'
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md">
                Learn More
              </Button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop" 
                alt="Waste management"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart Monitoring',
                description: 'Real-time tracking of bin fill levels and conditions',
                icon: <Zap className="w-8 h-8 text-green-500" />,
                color: 'bg-green-50'
              },
              {
                title: 'Data Analytics',
                description: 'Detailed reports and insights on waste generation patterns',
                icon: <BarChart2 className="w-8 h-8 text-blue-500" />,
                color: 'bg-blue-50'
              },
              {
                title: 'Eco-Friendly',
                description: 'Reduce your carbon footprint with optimized waste collection',
                icon: <Leaf className="w-8 h-8 text-emerald-500" />,
                color: 'bg-emerald-50'
              }
            ].map((feature, index) => (
              <div key={index} className={`${feature.color} p-6 rounded-2xl transition-all hover:shadow-lg`}>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Bin Status */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Current Bin Status</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading bins...</div>
          ) : bins.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bins.map((bin, index) => (
                <BinCard key={bin._id} bin={bin} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No bins available</div>
          )}
        </Card>

        {/* Chart Section */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Waste Overview</h2>
          <Bar data={chartData} options={chartOptions} />
        </Card>

        {/* For You Section */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">For You</h2>
            <Button variant="ghost" className="text-[#A8D5A2] hover:text-[#98C592] hover:bg-gray-50 font-semibold">
              View Details →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forYouCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <div
                  key={index}
                  className={`relative ${card.color} rounded-2xl overflow-hidden transition-all hover:shadow-xl cursor-pointer min-h-48`}
                >
                  {/* Background Image with Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{
                      backgroundImage: `url(${card.image})`,
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-3">
                    <IconComponent className="w-10 h-10 text-gray-800 drop-shadow-sm" />
                    <span className="text-sm text-gray-700 font-semibold">{card.title}</span>
                    <h3 className="text-xl font-bold text-gray-900 drop-shadow-sm">{card.subtitle}</h3>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Community Section */}
        <div id="community" className="py-12 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-2xl p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Our Community</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Be part of the movement towards sustainable waste management. Share your ideas, get involved, and help us make a difference.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md flex items-center gap-2">
                <Users size={18} /> Join Community
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-md flex items-center gap-2">
                <HelpCircle size={18} /> Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* User Feedback */}
        <Card id="feedback-section" className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">We'd Love Your Feedback</h2>
              <p className="text-gray-600 mt-1">Help us improve by sharing your thoughts</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="border-[#A8D5A2] text-[#A8D5A2] hover:bg-[#F0F9EF]"
                onClick={() => {
                  const form = document.getElementById('feedback-form');
                  if (form) form.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <MessageSquare size={16} className="mr-2" /> Write Feedback
              </Button>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">User Feedback</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading feedback...</div>
          ) : feedback.length > 0 ? (
            <ul className="space-y-3">
              {feedback.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#A8D5A2] flex items-center justify-center font-bold text-gray-800">
                      {item.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.email}</h4>
                      <p className="text-sm text-gray-600">{item.subject}</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">No feedback yet</div>
          )}
        </Card>

        {/* Submit Your Feedback Section */}
        <div id="feedback-section" className="scroll-mt-20">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">💬 Share Your Feedback</h2>
            <p className="text-gray-600">Help us improve! Submit your feedback below (no login required)</p>
          </div>
          <div id="feedback-form" className="mt-8">
            <FeedbackForm />
          </div>
        </div>
      </div>

      {/* Floating Feedback Button */}
      <button
        onClick={() => document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' })}
        className="fixed bottom-8 right-8 bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center gap-2"
      >
        💬 Feedback
      </button>
    </Layout>
  )
}

export default HomePage
