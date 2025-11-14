import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Upload, LogOut, Trash2, Settings, Plus, X, Calendar } from "lucide-react"

const AdminDashboard = () => {
  const [images, setImages] = useState([])
  const [cameraFeed, setCameraFeed] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [wasteData, setWasteData] = useState([])
  const [pendingActions, setPendingActions] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [feedback, setFeedback] = useState([])
  const [showActionModal, setShowActionModal] = useState(false)
  const [newAction, setNewAction] = useState({ title: "", description: "", dueDate: "", priority: "medium" })
  const [dataLoading, setDataLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      navigate("/admin/login")
    }
    fetchAllData()
    fetchCameraFeed()
  }, [navigate, selectedDate])

  const fetchCameraFeed = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/settings/camera-feed");
      if (response.data.success) {
        setCameraFeed(response.data.data.value);
      }
    } catch (error) {
      console.error("Error fetching camera feed:", error);
    }
  };

  const fetchAllData = async () => {
    setDataLoading(true)
    setMessage("")

    try {
      // Fetch all data in parallel with Promise.allSettled
      const [imagesRes, actionsRes, teamRes, feedbackRes, wasteRes] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/images"),
        axios.get("http://localhost:5000/api/pending-actions"),
        axios.get("http://localhost:5000/api/team"),
        axios.get("http://localhost:5000/api/feedback"),
        axios.get(`http://localhost:5000/api/waste-data/date/${selectedDate}`)
      ])

      // Process images
      if (imagesRes.status === "fulfilled" && imagesRes.value?.data?.success) {
        const imageData = imagesRes.value.data.data
        setImages(Array.isArray(imageData?.images) ? imageData.images : Array.isArray(imageData) ? imageData : [])
      } else {
        setImages([])
      }

      // Process pending actions
      if (actionsRes.status === "fulfilled" && actionsRes.value?.data?.success) {
        const actionData = actionsRes.value.data.data
        setPendingActions(Array.isArray(actionData?.actions) ? actionData.actions : Array.isArray(actionData) ? actionData : [])
      } else {
        setPendingActions([])
      }

      // Process team members
      if (teamRes.status === "fulfilled" && teamRes.value?.data?.success) {
        const teamData = teamRes.value.data.data
        setTeamMembers(Array.isArray(teamData) ? teamData : [])
      } else {
        setTeamMembers([])
      }

      // Process feedback
      if (feedbackRes.status === "fulfilled" && feedbackRes.value?.data?.success) {
        const feedbackData = feedbackRes.value.data.data
        setFeedback(Array.isArray(feedbackData?.feedback) ? feedbackData.feedback : Array.isArray(feedbackData) ? feedbackData : [])
      } else {
        setFeedback([])
      }

      // Process waste data
      if (wasteRes.status === "fulfilled" && wasteRes.value?.data?.success) {
        const wasteDataResult = wasteRes.value.data.data
        setWasteData(Array.isArray(wasteDataResult?.wasteData) ? wasteDataResult.wasteData : Array.isArray(wasteDataResult) ? wasteDataResult : [])
      } else {
        setWasteData([])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setMessage("Error loading data. Please refresh the page.")
    } finally {
      setDataLoading(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be less than 5MB")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("image", file)
    formData.append("binId", "default-bin")

    try {
      const response = await axios.post("http://localhost:5000/api/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data.success) {
        setMessage("Image uploaded successfully!")
        fetchAllData()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Error uploading image: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleAddAction = async () => {
    if (!newAction.title || !newAction.description || !newAction.dueDate) {
      setMessage("Please fill all required fields")
      return
    }

    if (newAction.title.length < 3) {
      setMessage("Title must be at least 3 characters")
      return
    }

    try {
      const adminId = localStorage.getItem("adminId") || "admin-default"

      const response = await axios.post("http://localhost:5000/api/pending-actions", {
        ...newAction,
        createdBy: adminId,
      })
      if (response.data.success) {
        setMessage("Action added successfully!")
        setNewAction({ title: "", description: "", dueDate: "", priority: "medium" })
        setShowActionModal(false)
        fetchAllData()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      console.error("[v0] Add action error:", error)
      setMessage("Error adding action: " + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteAction = async (actionId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/pending-actions/${actionId}`)
      if (response.data.success) {
        setMessage("Action deleted successfully!")
        fetchAllData()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Error deleting action: " + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/feedback/${feedbackId}`)
      if (response.data.success) {
        setMessage("Feedback deleted successfully!")
        fetchAllData()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Error deleting feedback: " + (error.response?.data?.message || error.message))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminEmail")
    navigate("/admin/login")
  }

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/images/${imageId}`)
      if (response.data.success) {
        setMessage("Image deleted successfully!")
        fetchAllData()
        setTimeout(() => setMessage(""), 3000)
      }
    } catch (error) {
      setMessage("Error deleting image: " + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Welcome, Admin!</h1>
            <p className="text-gray-600 mt-2">Your Waste Management Dashboard</p>
          </div>
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-md"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl font-medium transition-all ${message.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
          >
            {message}
          </div>
        )}

        {/* Calendar and Date Selection */}
        <Card className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-[#A8D5A2]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8D5A2]"
            />
            <span className="text-gray-600 font-medium">
              Total Waste: {wasteData.reduce((sum, item) => sum + (item.wasteAmount || 0), 0)} kg
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Image Upload Section */}
          <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="w-6 h-6 text-[#A8D5A2]" />
              <h2 className="text-2xl font-bold text-gray-800">Upload Website Images</h2>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#A8D5A2] hover:bg-green-50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="hidden"
                  id="imageInput"
                />
                <label htmlFor="imageInput" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-[#A8D5A2] transition-colors" />
                  <p className="text-gray-700 font-semibold">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              <Button
                onClick={() => document.getElementById("imageInput").click()}
                disabled={loading}
                className="w-full bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold py-3 rounded-xl transition-all hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Select Image"}
              </Button>
            </div>
          </Card>

          {/* Camera Feed Section */}
          <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <Settings className="w-6 h-6 text-[#A8D5A2]" />
              <h2 className="text-2xl font-bold text-gray-800">Update Camera Feed</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Camera Feed URL</label>
                <Input
                  type="url"
                  value={cameraFeed}
                  onChange={(e) => setCameraFeed(e.target.value)}
                  placeholder="Enter camera feed URL or image URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8D5A2] focus:border-transparent transition-all"
                />
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await axios.post("http://localhost:5000/api/admin/settings/camera-feed", { cameraFeedUrl: cameraFeed });
                    if (response.data.success) {
                      setMessage("Camera feed updated successfully!");
                      setTimeout(() => setMessage(""), 3000);
                    }
                  } catch (error) {
                    setMessage("Error updating camera feed: " + (error.response?.data?.message || error.message));
                  }
                }}
                className="w-full bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold py-3 rounded-xl transition-all hover:shadow-md"
              >
                Update Camera Feed
              </Button>
            </div>
          </Card>
        </div>

        {/* Pending Actions Section */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pending Actions</h2>
            <Button
              onClick={() => setShowActionModal(true)}
              className="flex items-center gap-2 bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              Add Action
            </Button>
          </div>

          {showActionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="p-8 bg-white rounded-2xl w-96">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Add New Action</h3>
                  <button onClick={() => setShowActionModal(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8D5A2]"
                  />
                  <textarea
                    placeholder="Description"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8D5A2]"
                    rows="3"
                  />
                  <input
                    type="date"
                    value={newAction.dueDate}
                    onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8D5A2]"
                  />
                  <select
                    value={newAction.priority}
                    onChange={(e) => setNewAction({ ...newAction, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A8D5A2]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddAction}
                      className="flex-1 bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold py-2 rounded-lg"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setShowActionModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <div className="space-y-3">
            {pendingActions.length > 0 ? (
              pendingActions.map((action) => (
                <div
                  key={action._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${action.priority === "high" ? "bg-red-100 text-red-700" : action.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                      >
                        {action.priority}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {new Date(action.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteAction(action._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No pending actions</div>
            )}
          </div>
        </Card>

        {/* Uploaded Images Gallery */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Uploaded Images Gallery</h2>
          {images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt="Uploaded"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                    <Button
                      onClick={() => handleDeleteImage(image._id)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-semibold"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No images uploaded yet. Upload your first image above.</p>
            </div>
          )}
        </Card>

        {/* Recent Feedback */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Feedback</h2>
          {feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.email}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.subject}</p>
                    <p className="text-sm text-gray-500 mt-2">{item.message}</p>
                  </div>
                  <Button
                    onClick={() => handleDeleteFeedback(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm ml-4"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No feedback yet</div>
          )}
        </Card>

        {/* Team Management */}
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Team Management</h2>
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div key={member._id} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-all">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#A8D5A2] flex items-center justify-center text-2xl font-bold text-gray-800">
                    {member.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-gray-800">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-xs text-gray-500 mt-2">{member.email}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No team members added yet</div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
