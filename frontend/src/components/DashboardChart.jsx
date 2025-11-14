import { Card } from "./ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const DashboardChart = ({ data, type = "line" }) => {
  // Default placeholder data for waste collection
  const defaultData = [
    { day: 'Mon', collection: 120 },
    { day: 'Tue', collection: 150 },
    { day: 'Wed', collection: 180 },
    { day: 'Thu', collection: 90 },
    { day: 'Fri', collection: 130 },
    { day: 'Sat', collection: 160 },
    { day: 'Sun', collection: 140 },
  ]

  const chartData = data || defaultData

  const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  }

  // Sample bin data for the map - Locations around IIT Mandi area
  const bins = [
    { 
      id: 'bin-1', 
      type: 'Metal', 
      location: { lat: 31.7815, lng: 76.9970 }, 
      fillLevel: 75, 
      status: 'active',
      name: 'Main Gate'
    },
    { 
      id: 'bin-2', 
      type: 'Biodegradable', 
      location: { lat: 31.7812, lng: 76.9980 }, 
      fillLevel: 50, 
      status: 'active',
      name: 'Cafeteria'
    },
    { 
      id: 'bin-3', 
      type: 'Non-Biodegradable', 
      location: { lat: 31.7809, lng: 76.9965 }, 
      fillLevel: 30, 
      status: 'active',
      name: 'Hostel Block'
    },
    { 
      id: 'bin-4', 
      type: 'E-Waste', 
      location: { lat: 31.7818, lng: 76.9975 }, 
      fillLevel: 20, 
      status: 'active',
      name: 'Computer Center'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 w-full">
      {/* Chart Card - Takes 40% width on large screens */}
      <Card className="lg:col-span-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Waste Collection</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={chartData} {...chartConfig}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="collection" fill="#A8D5A2" name="Collected (kg)" />
              </BarChart>
            ) : (
              <LineChart data={chartData} {...chartConfig}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="collection"
                  stroke="#A8D5A2"
                  strokeWidth={2}
                  dot={{ fill: "#A8D5A2", r: 4 }}
                  name="Collected (kg)"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Map Card - Takes 60% width on large screens */}
      <Card className="lg:col-span-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bin Locations</h3>
        <div className="h-64 rounded-xl overflow-hidden bg-gray-100">
          <MapContainer 
            center={[31.78129, 76.99750]} 
            zoom={16} 
            style={{ height: '100%', width: '100%' }} 
            className="rounded-xl"
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            {bins.map((bin) => (
              <Marker key={bin.id} position={[bin.location.lat, bin.location.lng]}>
                <Popup>
                  <div className="text-sm">
                    <strong className="text-gray-800">{bin.name}</strong><br />
                    <span className="text-gray-600">Type: {bin.type}</span><br />
                    <span className="text-gray-600">Fill Level: {bin.fillLevel}%</span><br />
                    <span className={`text-sm font-medium ${bin.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {bin.status.charAt(0).toUpperCase() + bin.status.slice(1)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div className="mt-3 text-xs text-gray-500 text-center">
          {bins.length} active bins in your area
        </div>
      </Card>
    </div>
  )
}

export default DashboardChart
