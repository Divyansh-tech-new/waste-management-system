import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/layout/Layout';
import { ChevronLeft, ChevronRight, CheckSquare, Thermometer, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';

const Reports = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rpiLogs, setRpiLogs] = useState([]);
  const [rpiLoading, setRpiLoading] = useState(true);
  const [latestRpi, setLatestRpi] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/feedback`, { credentials: 'include', headers: { 'Accept': 'application/json' } });
      if (!response.ok) throw new Error('Failed to fetch feedback');
      const data = await response.json();
      if (data && data.data && Array.isArray(data.data.feedback)) setFeedback(data.data.feedback);
      else if (Array.isArray(data)) setFeedback(data);
      else setFeedback([]);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

    try {
      setRpiLoading(true);
      const [latestResponse, logsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/rpi-health/latest`), 
        axios.get(`${API_URL}/api/rpi-health?limit=5`)
      ]);
      
      // Backend returns { success: true, data: {...} }
      if (latestResponse.data && latestResponse.data.success && latestResponse.data.data) {
        setLatestRpi(latestResponse.data.data);
      }
      
      // Backend returns { success: true, data: [...] }
      if (logsResponse.data && logsResponse.data.success && Array.isArray(logsResponse.data.data)) {
        setRpiLogs(logsResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching RPI health:', err);
    } finally {
      setRpiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTemperatureColor = (temp) => temp < 60 ? 'text-green-600' : temp < 75 ? 'text-yellow-600' : 'text-red-600';
  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const teamMembers = [
    { id: 1, name: 'Priyansh Saha', role: 'Team Lead', avatar: '#4CAF50' },
    { id: 2, name: 'Kripa Kanodia', role: 'Developer', avatar: '#2196F3' },
    { id: 3, name: 'Divyansh Negi', role: 'Developer', avatar: '#FF9800' },
    { id: 4, name: 'Mridul Joshi', role: 'Developer', avatar: '#9C27B0' },
    { id: 5, name: 'Rishabh Raj', role: 'Developer', avatar: '#F44336' },
    { id: 6, name: 'Rohan Kumar', role: 'Developer', avatar: '#00BCD4' }
  ];

  const pendingActions = [
    { id: 1, title: 'Review waste segregation logs' },
    { id: 2, title: 'Update AI model parameters' },
    { id: 3, title: 'Check camera feed quality' }
  ];

  const recentFeedback = feedback.slice(0, 2).map((item, index) => ({
    id: item._id || index,
    title: item.subject || 'No Subject',
    subtitle: item.message || '',
    email: item.email || 'Anonymous',
    date: item.createdAt ? getTimeAgo(item.createdAt) : 'Recently',
    avatar: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][index % 4]
  }));

  const calendarDays = [[1,2,3,4,5,6,7],[8,9,10,11,12,13,14],[15,16,17,18,19,20,21],[22,23,24,25,26,27,28],[29,30,31,1,2,3,4]];
  const isOtherMonth = (day, weekIndex) => weekIndex === 4 && day < 7;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Team Management</h4>
            <div className="grid grid-cols-3 gap-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="text-center space-y-1 p-2 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: member.avatar }} />
                  <h5 className="font-semibold text-gray-800 text-xs">{member.name}</h5>
                  <p className="text-[10px] text-gray-600">{member.role}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Pending Actions</h4>
            <div className="space-y-3">
              {pendingActions.map((action) => (
                <div key={action.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  <CheckSquare className="text-[#4CAF50]" size={20} />
                  <span className="text-gray-700 text-sm">{action.title}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Live Camera Feed</h4>
            <div className="relative">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&h=300&fit=crop" alt="Camera Feed" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-md flex items-center space-x-1 text-xs font-semibold">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span>LIVE</span>
              </div>
              <div className="mt-2 text-sm text-gray-600">Camera 1 - Main Entrance</div>
            </div>
          </Card>
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                <Thermometer className="text-[#A8D5A2]" size={24} />
                <span>RPI Health Monitor</span>
              </h4>
              <Button variant="outline" size="sm" onClick={() => fetchData()} disabled={rpiLoading} className="flex items-center space-x-1 border-[#A8D5A2] text-[#A8D5A2] hover:bg-[#A8D5A2] hover:text-white">
                <RefreshCw className={`w-4 h-4 ${rpiLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
            {latestRpi && latestRpi.temperature !== undefined && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#A8D5A2] bg-opacity-20 p-3 rounded-lg border border-[#A8D5A2]">
                  <p className="text-xs text-gray-700 mb-1 font-medium">Temperature</p>
                  <p className={`text-2xl font-bold ${getTemperatureColor(latestRpi.temperature)}`}>{latestRpi.temperature.toFixed(1)}°C</p>
                </div>
                <div className="bg-[#A8D5A2] bg-opacity-20 p-3 rounded-lg border border-[#A8D5A2]">
                  <p className="text-xs text-gray-700 mb-1 font-medium">CPU Frequency</p>
                  <p className="text-2xl font-bold text-gray-800">{latestRpi.cpuFrequency?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="bg-[#A8D5A2] bg-opacity-20 p-3 rounded-lg border border-[#A8D5A2]">
                  <p className="text-xs text-gray-700 mb-1 font-medium">Fan State</p>
                  <p className="text-2xl font-bold text-gray-800">{latestRpi.fanState || 'N/A'}</p>
                </div>
                <div className="bg-[#A8D5A2] bg-opacity-20 p-3 rounded-lg border border-[#A8D5A2]">
                  <p className="text-xs text-gray-700 mb-1 font-medium">Status</p>
                  <p className={`text-lg font-bold ${latestRpi.throttleStatus === '0x0' ? 'text-green-700' : 'text-orange-600'}`}>{latestRpi.throttleStatus === '0x0' ? 'Normal' : 'Throttled'}</p>
                </div>
              </div>
            )}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-2">Recent Logs</h5>
              {rpiLoading ? (
                <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A8D5A2]"></div></div>
              ) : rpiLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#A8D5A2] bg-opacity-30 border-b-2 border-[#A8D5A2]">
                      <tr>
                        <th className="py-1.5 px-2 text-xs font-semibold text-gray-800">Time</th>
                        <th className="py-1.5 px-2 text-xs font-semibold text-gray-800">Temp</th>
                        <th className="py-1.5 px-2 text-xs font-semibold text-gray-800">CPU Freq</th>
                        <th className="py-1.5 px-2 text-xs font-semibold text-gray-800">Fan</th>
                        <th className="py-1.5 px-2 text-xs font-semibold text-gray-800">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rpiLogs.map((log, index) => (
                        <tr key={index} className="border-b border-[#A8D5A2] border-opacity-30 hover:bg-[#A8D5A2] hover:bg-opacity-10 transition-colors">
                          <td className="py-1 px-2 text-xs text-gray-600">{log.timestamp ? getTimeAgo(log.timestamp) : 'N/A'}</td>
                          <td className={`py-1 px-2 text-xs font-bold ${log.temperature ? getTemperatureColor(log.temperature) : 'text-gray-600'}`}>{log.temperature ? `${log.temperature.toFixed(1)}°C` : 'N/A'}</td>
                          <td className="py-1 px-2 text-xs font-semibold text-gray-700">{log.cpuFrequency ? `${log.cpuFrequency.toFixed(2)} GHz` : 'N/A'}</td>
                          <td className="py-1 px-2 text-xs text-gray-700">{log.fanState || 'N/A'}</td>
                          <td className="py-1 px-2"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.throttleStatus === '0x0' ? 'bg-[#A8D5A2] text-green-900' : 'bg-orange-100 text-orange-700'}`}>{log.throttleStatus === '0x0' ? 'Normal' : 'Throttled'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">No RPI data available</p>
              )}
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-gray-800">October 2023</h5>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
              </div>
            </div>
            <table className="w-full text-center text-sm">
              <thead>
                <tr>{['SUN','MON','TUE','WED','THU','FRI','SAT'].map((day) => (<th key={day} className="pb-2 text-xs font-semibold text-gray-500">{day}</th>))}</tr>
              </thead>
              <tbody>
                {calendarDays.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => (<td key={`${weekIndex}-${dayIndex}`} className={`py-2 ${isOtherMonth(day, weekIndex) ? 'text-gray-300' : day === 8 ? 'bg-[#A8D5A2] rounded-lg font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer'}`}>{day}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
            <h4 className="text-xl font-semibold mb-4 text-gray-800">Recent Feedback</h4>
            {isLoading ? (
              <div className="flex justify-center items-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50]"></div></div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
                <AlertCircle className="shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium">Error loading feedback</p>
                  <p className="text-sm">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>Try Again</Button>
                </div>
              </div>
            ) : recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {recentFeedback.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: item.avatar }}>{item.email ? item.email.charAt(0).toUpperCase() : 'U'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{item.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.subtitle}</p>
                      {item.email && (<p className="text-xs text-gray-400 mt-1">{item.email}</p>)}
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
};

export default Reports;
