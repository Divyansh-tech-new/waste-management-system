import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/layout/Layout';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckSquare, 
  Recycle, 
  MessageCircle, 
  BarChart3, 
  Trash2, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Reports = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch('https://waste-management-system-1-uyth.onrender.com/api/feedback', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }

        const data = await response.json();
        // Handle both array and object with data.feedback
        if (data && data.data && Array.isArray(data.data.feedback)) {
          setFeedback(data.data.feedback);
        } else if (Array.isArray(data)) {
          setFeedback(data);
        } else {
          setFeedback([]);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const pendingActions = [
    { id: 1, text: 'Review bin status', tag: 'Today' },
    { id: 2, text: 'Update collection schedule', tag: 'Today' },
    { id: 3, text: 'Check maintenance log', tag: 'Today' }
  ];

  const projects = [
    { id: 1, icon: Recycle, title: 'Waste Segregation Initiative', avatars: ['#FF6B6B', '#4ECDC4'] },
    { id: 2, icon: MessageCircle, title: 'Feedback Collection', avatars: ['#95E1D3'] },
    { id: 3, icon: BarChart3, title: 'Waste Segregation Stats', avatars: ['#F9CA24', '#E056FD'] },
    { id: 4, icon: Trash2, title: 'Live Bin Status Overview', avatars: ['#30336B', '#F79F1F', '#A3CB38'] },
    { id: 5, icon: TrendingUp, title: 'Collection Trends 2024', avatars: ['#12CBC4'] }
  ];

  // Transform feedback data to match the existing format
  const recentFeedback = feedback.map((item, index) => ({
    id: item._id || index,
    avatar: ['#686868', '#FF6B6B', '#4ECDC4', '#F9CA24', '#E056FD'][index % 5],
    title: item.subject || 'New feedback',
    subtitle: item.message?.substring(0, 50) + (item.message?.length > 50 ? '...' : ''),
    fullMessage: item.message,
    rating: item.rating,
    date: new Date(item.createdAt || new Date()).toLocaleDateString(),
    email: item.email
  }));

  const teamMembers = [
    { id: 1, name: 'Priyansh Saha', role: 'Lead Developer', avatar: '#5F27CD' },
    { id: 2, name: 'Rishabh Raj', role: 'UI/UX Designer', avatar: '#F79F1F' },
    { id: 3, name: 'Divyansh Negi', role: 'Backend Developer', avatar: '#00D2D3' },
    { id: 4, name: 'Kripa Kanodia', role: 'Project Manager', avatar: '#8E44AD' }
  ];

  const feedbackTags = ['#WasteManagment', '#SortingProcess', '#Feedback'];
  const calendarDays = [
    [27, 28, 29, 30, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 1]
  ];

  const isOtherMonth = (day, weekIndex) => (weekIndex === 0 && day > 20) || (weekIndex === 4 && day === 1);

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-semibold text-gray-800">October 2023</h5>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <th key={day} className="pb-2 text-xs font-semibold text-gray-500">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarDays.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day, dayIndex) => (
                    <td key={`${weekIndex}-${dayIndex}`} className={`py-2 ${isOtherMonth(day, weekIndex) ? 'text-gray-300' : day === 8 ? 'bg-[#A8D5A2] rounded-lg font-semibold text-gray-800' : 'text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer'}`}>
                      {day}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Pending Actions Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Pending Actions</h4>
          <ul className="space-y-3">
            {pendingActions.map((action) => (
              <li key={action.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#A8D5A2] transition-colors">
                    <CheckSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-700">{action.text}</p>
                </div>
                <span className="flex items-center text-xs text-gray-500 space-x-1">
                  <div className="w-2 h-2 bg-[#A8D5A2] rounded-full"></div>
                  <span>{action.tag}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Current Projects Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md lg:col-span-1">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Current Projects</h4>
          <ul className="space-y-3 mb-4">
            {projects.map((project) => {
              const IconComponent = project.icon;
              return (
                <li key={project.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#A8D5A2] transition-colors">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{project.title}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {project.avatars.map((color, idx) => (
                      <div key={idx} className="w-7 h-7 rounded-full border-2 border-white" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <Button className="w-full bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 rounded-xl transition-colors">
            + Add Alert
          </Button>
        </Card>

        {/* Recent Feedback Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md lg:col-span-2">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Recent Feedback</h4>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium">Error loading feedback</p>
                <p className="text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : recentFeedback.length > 0 ? (
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div key={item.id} className="group relative">
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: item.avatar }}>
                      {item.email ? item.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 truncate pr-2">{item.title}</h4>
                        <div className="flex items-center space-x-1">
                          {item.rating && (
                            <div className="flex items-center text-amber-400">
                              {'★'.repeat(Math.floor(item.rating))}
                              {'☆'.repeat(5 - Math.floor(item.rating))}
                            </div>
                          )}
                          <span className="text-xs text-gray-400">{item.date}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                      {item.email && (
                        <p className="text-xs text-gray-400 mt-1">{item.email}</p>
                      )}
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
                  </div>
                  {item.fullMessage && item.fullMessage.length > 50 && (
                    <div className="hidden group-hover:block absolute z-10 w-64 p-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <p className="text-sm text-gray-700">{item.fullMessage}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="mx-auto mb-2 text-gray-300" size={32} />
              <p>No feedback received yet</p>
              <p className="text-sm">Your feedback will appear here</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {feedbackTags.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-[#A8D5A2] transition-colors cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </Card>

        {/* Team Management Card */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
          <h4 className="text-xl font-semibold mb-4 text-gray-800">Team Management</h4>
          <div className="grid grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center space-y-2 p-4 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full mx-auto group-hover:scale-110 transition-transform" style={{ backgroundColor: member.avatar }} />
                <h5 className="font-semibold text-gray-800 text-sm">{member.name}</h5>
                <p className="text-xs text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
