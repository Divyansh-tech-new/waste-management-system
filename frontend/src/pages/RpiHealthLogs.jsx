import { useEffect, useState } from "react"
import axios from "axios"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Layout from "../components/layout/Layout"
import { 
  Activity, 
  Cpu, 
  Fan, 
  Thermometer, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react"

const RpiHealthLogs = () => {
  const [logs, setLogs] = useState([])
  const [latestLog, setLatestLog] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch latest log
      const latestResponse = await axios.get(`${API_URL}/api/rpi-health/latest`)
      setLatestLog(latestResponse.data.data)

      // Fetch recent logs
      const logsResponse = await axios.get(`${API_URL}/api/rpi-health?limit=50`)
      setLogs(logsResponse.data.data || [])

      // Fetch statistics
      const statsResponse = await axios.get(`${API_URL}/api/rpi-health/stats?hours=24`)
      setStats(statsResponse.data.data)

      setError(null)
    } catch (error) {
      console.error("Error fetching RPI health data:", error)
      setError("Failed to load RPI health data. Please check if the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 10 seconds if enabled
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchData, 10000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const getTemperatureColor = (temp) => {
    if (temp < 60) return "text-green-600"
    if (temp < 75) return "text-yellow-600"
    return "text-red-600"
  }

  const getTemperatureBgColor = (temp) => {
    if (temp < 60) return "from-green-50 to-green-100"
    if (temp < 75) return "from-yellow-50 to-yellow-100"
    return "from-red-50 to-red-100"
  }

  const decodeThrottle = (throttleHex) => {
    try {
      const value = parseInt(throttleHex, 16)
      const issues = []
      if (value & 0x1) issues.push("Under-voltage")
      if (value & 0x2) issues.push("Freq Capped")
      if (value & 0x4) issues.push("Throttled")
      if (value & 0x8) issues.push("Soft Temp Limit")
      return issues.length > 0 ? issues : ["Normal"]
    } catch {
      return ["Unknown"]
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Raspberry Pi Health Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time system health metrics from edge devices</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchData}
              disabled={loading}
              className="bg-[#A8D5A2] hover:bg-[#8BC48D] text-gray-800 font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
              } text-white font-medium px-4 py-2 rounded-xl transition-colors`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Auto-Refresh: {autoRefresh ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Latest Status Cards */}
        {latestLog && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Temperature Card */}
            <Card className={`p-6 bg-gradient-to-br ${getTemperatureBgColor(latestLog.temperature)} rounded-2xl shadow-sm border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                <Thermometer className={`w-8 h-8 ${getTemperatureColor(latestLog.temperature)}`} />
                <span className="text-xs text-gray-600">{getTimeAgo(latestLog.timestamp)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">CPU Temperature</h3>
              <p className={`text-3xl font-bold ${getTemperatureColor(latestLog.temperature)}`}>
                {latestLog.temperature.toFixed(1)}°C
              </p>
            </Card>

            {/* CPU Frequency Card */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Cpu className="w-8 h-8 text-blue-600" />
                <span className="text-xs text-gray-600">{getTimeAgo(latestLog.timestamp)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">CPU Frequency</h3>
              <p className="text-3xl font-bold text-blue-600">
                {latestLog.cpuFrequency.toFixed(2)} GHz
              </p>
            </Card>

            {/* Fan State Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Fan className="w-8 h-8 text-purple-600" />
                <span className="text-xs text-gray-600">{getTimeAgo(latestLog.timestamp)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Fan State</h3>
              <p className="text-3xl font-bold text-purple-600">
                {latestLog.fanState}
              </p>
            </Card>

            {/* Throttle Status Card */}
            <Card className={`p-6 bg-gradient-to-br ${
              latestLog.throttleStatus === '0x0' ? 'from-green-50 to-green-100' : 'from-orange-50 to-orange-100'
            } rounded-2xl shadow-sm border border-gray-100`}>
              <div className="flex items-center justify-between mb-4">
                {latestLog.throttleStatus === '0x0' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                )}
                <span className="text-xs text-gray-600">{getTimeAgo(latestLog.timestamp)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Throttle Status</h3>
              <p className={`text-lg font-bold ${
                latestLog.throttleStatus === '0x0' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {decodeThrottle(latestLog.throttleStatus)[0]}
              </p>
            </Card>
          </div>
        )}

        {/* Statistics Card */}
        {stats && (
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-[#A8D5A2]" />
              24-Hour Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Avg Temp</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgTemp?.toFixed(1)}°C</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Max Temp</p>
                <p className="text-2xl font-bold text-red-600">{stats.maxTemp?.toFixed(1)}°C</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Min Temp</p>
                <p className="text-2xl font-bold text-blue-600">{stats.minTemp?.toFixed(1)}°C</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Avg Freq</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgFreq?.toFixed(2)} GHz</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Max Freq</p>
                <p className="text-2xl font-bold text-green-600">{stats.maxFreq?.toFixed(2)} GHz</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Readings</p>
                <p className="text-2xl font-bold text-gray-800">{stats.count}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Logs Table */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-[#A8D5A2]" />
            Recent Health Logs
          </h2>
          {loading && logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A8D5A2] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Temperature</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Frequency</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Throttle</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr 
                      key={log._id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold ${getTemperatureColor(log.temperature)}`}>
                        {log.temperature.toFixed(1)}°C
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                        {log.cpuFrequency.toFixed(2)} GHz
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {log.fanState}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {log.throttleStatus}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {decodeThrottle(log.throttleStatus).map((issue, i) => (
                          <span 
                            key={i}
                            className={`inline-block px-2 py-1 rounded text-xs mr-1 mb-1 ${
                              issue === "Normal" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {issue}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No health logs found</p>
              <p className="text-sm mt-1">Start the RPI health monitor script to collect data</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export default RpiHealthLogs
