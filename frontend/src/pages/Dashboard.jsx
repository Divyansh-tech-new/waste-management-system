"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Layout from "../components/layout/Layout"
import BinCard from "../components/BinCard"
import DashboardChart from "../components/DashboardChart"
import { AlertCircle, CheckCircle, MessageCircle, Wrench, Thermometer, RefreshCw } from "lucide-react"

const Dashboard = () => {
  const [bins, setBins] = useState([])
  const [camera, setCamera] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cameraFeed, setCameraFeed] = useState(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [rpiHealth, setRpiHealth] = useState(null)
  const [rpiLoading, setRpiLoading] = useState(false)
  const [rpiLogs, setRpiLogs] = useState([])
  const [feedback, setFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState(null)

  const fetchCameraFeed = async () => {
    try {
      setCameraLoading(true)
      const response = await axios.get("http://localhost:5000/api/camera-feed/latest")
      if (response.data.success) {
        setCameraFeed(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching camera feed:", error)
      // Don't set error state for camera feed, just log it
    } finally {
      setCameraLoading(false)
    }
  }

  const fetchRpiHealth = async () => {
    try {
      setRpiLoading(true)
      const [latestResponse, logsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/rpi-health/latest"),
        axios.get("http://localhost:5000/api/rpi-health?limit=50")
      ])
      
      console.log("🔍 RPI Health API Response:", logsResponse.data)
      console.log("📊 First 5 logs:", logsResponse.data?.data?.slice(0, 5))
      
      // Backend returns { success: true, data: {...} }
      if (latestResponse.data && latestResponse.data.success && latestResponse.data.data) {
        setRpiHealth(latestResponse.data.data)
        console.log("✅ Latest Health:", latestResponse.data.data)
      }
      
      // Backend returns { success: true, data: [...] }
      if (logsResponse.data && logsResponse.data.success && Array.isArray(logsResponse.data.data)) {
        setRpiLogs(logsResponse.data.data)
        console.log("✅ Logs count:", logsResponse.data.data.length)
      }
    } catch (error) {
      console.error("Error fetching RPI health:", error)
    } finally {
      setRpiLoading(false)
    }
  }

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true)
      const response = await axios.get("http://localhost:5000/api/feedback")
      if (response.data && response.data.data && Array.isArray(response.data.data.feedback)) {
        setFeedback(response.data.data.feedback)
      } else if (Array.isArray(response.data)) {
        setFeedback(response.data)
      } else {
        setFeedback([])
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
      setFeedbackError(error.message)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getTemperatureColor = (temp) => {
    if (temp < 60) return 'text-green-600'
    if (temp < 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const binsResponse = await axios.get("http://localhost:5000/api/bins")
        const binsData = binsResponse.data.data || []

        setBins(
          binsData.map((bin) => ({
            ...bin,
            type: bin.category || bin.type,
            fillLevel: bin.fillLevel || 0,
          })),
        )
        setError(null)
      } catch (error) {
        console.error("Error fetching bins:", error)
        setError("Failed to load dashboard data. Please check if the backend is running.")
        // Set default data on error
        setBins([
          { _id: "1", type: "Dry Waste", fillLevel: 75, category: "Dry Waste" },
          { _id: "2", type: "Wet Waste", fillLevel: 50, category: "Wet Waste" },
          { _id: "3", type: "Plastic Waste", fillLevel: 30, category: "Plastic Waste" },
          { _id: "4", type: "Metal Waste", fillLevel: 20, category: "Metal Waste" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    fetchCameraFeed()
    fetchRpiHealth()
    fetchFeedback()
    
    // Auto-refresh camera feed every 30 seconds
    const cameraInterval = setInterval(fetchCameraFeed, 30000)
    // Auto-refresh RPI health every 30 seconds
    const rpiInterval = setInterval(fetchRpiHealth, 30000)
    // Auto-refresh feedback every 60 seconds
    const feedbackInterval = setInterval(fetchFeedback, 60000)

    const cameraFeedUrl =
      localStorage.getItem("cameraFeedUrl") ||
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0NDQ0NDQyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjI0IiBmaWxsPSIjODg4ODg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TGl2ZSBDYW1lcmEgRmVlZDwvdGV4dD48L3N2Zz4="
    setCamera({
      image: cameraFeedUrl,
      detected: "Plastic Bottle",
    })

    setAlerts([
      { id: "alert-1", message: "Anomaly detected in Zone 3: Overfilled Plastic Bin", type: "warning" },
      { id: "alert-2", message: "Scheduled maintenance due for Bin A01", type: "info" },
    ])
    
    return () => {
      clearInterval(cameraInterval)
      clearInterval(rpiInterval)
      clearInterval(feedbackInterval)
    }
  }, [])

  // Prepare recent feedback data
  const recentFeedback = feedback.slice(0, 2).map((item, index) => ({
    id: item._id || index,
    title: item.subject || 'No Subject',
    subtitle: item.message || '',
    email: item.email || 'Anonymous',
    date: item.createdAt ? getTimeAgo(item.createdAt) : 'Recently',
    avatar: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][index % 4]
  }))

  // Separate alerts into anomalies and maintenance
  const anomalyAlerts = alerts.filter(alert => alert.type === 'warning')
  const maintenanceLogs = alerts.filter(alert => alert.type === 'info')

  return (
    <Layout>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">{error}</div>
        )}

        {/* Live Bin Status and Camera Feed Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Bins Overview + RPI Health */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Bin Status */}
            <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Bins Overview</h2>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A8D5A2] mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading bins...</p>
                </div>
              ) : bins.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {bins.map((bin) => (
                    <BinCard key={bin.id} bin={bin} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No bins found</div>
              )}
            </Card>

            {/* RPI Health Monitor */}
            <Card className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <Thermometer className="text-[#A8D5A2]" size={20} />
                  <span>RPI Health Monitor</span>
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchRpiHealth()} 
                  disabled={rpiLoading}
                  className="flex items-center space-x-1 h-7 text-xs border-[#A8D5A2] text-[#A8D5A2] hover:bg-[#A8D5A2] hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${rpiLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
              
              {rpiLoading && !rpiHealth ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A8D5A2]"></div>
                </div>
              ) : rpiHealth && rpiHealth.temperature !== undefined ? (
                <div className="space-y-3">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#A8D5A2] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-800 mb-0.5 font-medium">Temperature</p>
                      <p className="text-lg font-bold text-gray-800">
                        {rpiHealth.temperature.toFixed(1)}°C
                      </p>
                    </div>
                    <div className="bg-[#A8D5A2] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-800 mb-0.5 font-medium">CPU Freq</p>
                      <p className="text-lg font-bold text-gray-800">
                        {rpiHealth.cpuFrequency?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-[#A8D5A2] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-800 mb-0.5 font-medium">Fan State</p>
                      <p className="text-lg font-bold text-gray-800">
                        {rpiHealth.fanState || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-[#A8D5A2] p-3 rounded-xl">
                      <p className="text-[10px] text-gray-800 mb-0.5 font-medium">Status</p>
                      <p className="text-sm font-bold text-gray-800">
                        {rpiHealth.throttleStatus === '0x0' ? 'Normal' : 'Throttled'}
                      </p>
                    </div>
                  </div>

                  {/* Recent Logs Table */}
                  {rpiLogs.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#A8D5A2] bg-opacity-30 border-b-2 border-[#A8D5A2]">
                          <tr>
                            <th className="py-1 px-2 text-[10px] font-semibold text-gray-800">Time</th>
                            <th className="py-1 px-2 text-[10px] font-semibold text-gray-800">Temp</th>
                            <th className="py-1 px-2 text-[10px] font-semibold text-gray-800">CPU</th>
                            <th className="py-1 px-2 text-[10px] font-semibold text-gray-800">Fan</th>
                            <th className="py-1 px-2 text-[10px] font-semibold text-gray-800">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rpiLogs.slice(0, 3).map((log, index) => (
                            <tr key={index} className="border-b border-[#A8D5A2] border-opacity-30 hover:bg-[#A8D5A2] hover:bg-opacity-10 transition-colors">
                              <td className="py-0.5 px-2 text-[10px] text-gray-600">
                                {log.timestamp ? getTimeAgo(log.timestamp) : 'N/A'}
                              </td>
                              <td className={`py-0.5 px-2 text-[10px] font-bold ${log.temperature ? getTemperatureColor(log.temperature) : 'text-gray-600'}`}>
                                {log.temperature ? `${log.temperature.toFixed(1)}°C` : 'N/A'}
                              </td>
                              <td className="py-0.5 px-2 text-[10px] font-semibold text-gray-700">
                                {log.cpuFrequency ? `${log.cpuFrequency.toFixed(2)}` : 'N/A'}
                              </td>
                              <td className="py-0.5 px-2 text-[10px] text-gray-700">
                                {log.fanState || 'N/A'}
                              </td>
                              <td className="py-0.5 px-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${log.throttleStatus === '0x0' ? 'bg-[#A8D5A2] text-green-900' : 'bg-orange-100 text-orange-700'}`}>
                                  {log.throttleStatus === '0x0' ? 'OK' : 'Throttled'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-xs py-2">No RPI data available</p>
              )}
            </Card>
          </div>

          {/* Live Camera Feed */}
          <Card className="lg:col-span-1 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Live Camera Feed</h2>
            {cameraLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A8D5A2] mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading feed...</p>
              </div>
            ) : cameraFeed ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-[380px]">
                <img 
                  src={cameraFeed.imageUrl} 
                  alt="Live camera feed"
                  className="w-full h-full object-cover"
                />
                {/* LIVE Badge */}
                <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg animate-pulse">
                  LIVE
                </div>
                {/* Category Badge */}
                {cameraFeed.predictedCategory && cameraFeed.predictedCategory !== 'unknown' && (
                  <div className="absolute top-3 left-3 bg-[#A8D5A2] bg-opacity-95 text-gray-900 text-sm font-bold px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
                    {cameraFeed.predictedCategory.toUpperCase()} - {cameraFeed.confidence?.toFixed(1)}%
                  </div>
                )}
                {/* Bottom Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-8">
                  <p className="text-white font-semibold text-sm mb-1">{cameraFeed.location}</p>
                  <p className="text-gray-300 text-xs mb-2">
                    Last updated: {new Date(cameraFeed.updatedAt).toLocaleString()}
                  </p>
                  {cameraFeed.predictedCategory && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">
                        Detected: <span className="text-[#A8D5A2] font-semibold">{cameraFeed.predictedCategory}</span>
                      </span>
                      {cameraFeed.confidence && (
                        <span className="text-gray-400">
                          Confidence: {cameraFeed.confidence.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-[380px]">
                <img 
                  src="/images/camera-feed.jpg" 
                  alt="Camera offline"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-md">
                  OFFLINE
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 pt-8">
                  <p className="text-white text-sm">No live feed available</p>
                  <p className="text-gray-400 text-xs">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Waste Collection Map</h2>
          <div className="h-96">
            <DashboardChart type="map" />
          </div>
        </Card>

        {/* Anomaly Alerts, Maintenance Logs & Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Anomaly Alerts */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="w-6 h-6 text-gray-800" />
              <h4 className="text-xl font-bold text-gray-800">Anomaly Alerts</h4>
            </div>
            <div className="space-y-3">
              {anomalyAlerts.length > 0 ? (
                anomalyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="bg-[#A8D5A2] p-4 rounded-xl text-gray-800 transition-all hover:shadow-md cursor-pointer flex items-start space-x-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      {alert.timestamp && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <p className="text-sm">No anomalies detected</p>
                </div>
              )}
            </div>
          </Card>

          {/* Maintenance Logs */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <Wrench className="w-6 h-6 text-gray-800" />
              <h4 className="text-xl font-bold text-gray-800">Maintenance Logs</h4>
            </div>
            <div className="space-y-3">
              {maintenanceLogs.length > 0 ? (
                maintenanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#A8D5A2] p-4 rounded-xl text-gray-800 transition-all hover:shadow-md cursor-pointer flex items-start space-x-3"
                  >
                    <Wrench className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.message}</p>
                      {log.timestamp && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <CheckCircle className="w-8 h-8 mx-auto text-green-400 mb-2" />
                  <p className="text-sm">No maintenance scheduled</p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Feedback */}
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h4 className="text-xl font-bold text-gray-800">Recent Feedback</h4>
            </div>
            {feedbackLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50]"></div>
              </div>
            ) : feedbackError ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-sm">Error loading feedback</p>
                  <p className="text-xs mt-1">{feedbackError}</p>
                </div>
              </div>
            ) : recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {recentFeedback.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: item.avatar }}>
                      {item.email ? item.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{item.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.subtitle}</p>
                      {item.email && item.email !== 'Anonymous' && (
                        <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="mx-auto mb-2 text-gray-300" size={32} />
                <p className="text-sm">No feedback received yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard
