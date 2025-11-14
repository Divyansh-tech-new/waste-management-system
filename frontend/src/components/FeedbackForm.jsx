import { useState } from "react"
import axios from "axios"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Mail, MessageSquare, Star } from "lucide-react"

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    userId: "anonymous",
    email: "",
    subject: "",
    message: "",
    rating: 5,
    category: "general",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.email || !formData.subject || !formData.message) {
      setMessage("Please fill in all required fields")
      return
    }

    if (formData.message.length < 10) {
      setMessage("Message must be at least 10 characters long")
      return
    }

    if (formData.subject.length < 5) {
      setMessage("Subject must be at least 5 characters long")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:5000/api/feedback", {
        userId: formData.userId,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        rating: formData.rating,
        category: formData.category,
      })

      if (response.data.success) {
        setMessage("Thank you! Your feedback has been submitted successfully.")
        setSubmitted(true)
        setFormData({
          userId: "anonymous",
          email: "",
          subject: "",
          message: "",
          rating: 5,
          category: "general",
        })

        // Reset form after 3 seconds
        setTimeout(() => {
          setSubmitted(false)
          setMessage("")
        }, 3000)
      }
    } catch (error) {
      console.error("[v0] Feedback submission error:", error)
      setMessage(error.response?.data?.message || "Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="w-6 h-6 text-[#A8D5A2]" />
        <h2 className="text-2xl font-bold text-gray-800">Send Us Your Feedback</h2>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl font-medium transition-all ${
            submitted
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8D5A2] focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Subject Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
          <Input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="What is your feedback about?"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8D5A2] focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Category Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8D5A2] focus:border-transparent transition-all"
          >
            <option value="general">General Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature-request">Feature Request</option>
            <option value="complaint">Complaint</option>
          </select>
        </div>

        {/* Rating Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                className="transition-all"
              >
                <Star
                  className={`w-6 h-6 ${star <= formData.rating ? "fill-[#A8D5A2] text-[#A8D5A2]" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Message * ({formData.message.length}/2000)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Please share your feedback in detail..."
            rows="5"
            maxLength="2000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8D5A2] focus:border-transparent transition-all resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-bold py-3 rounded-xl transition-all hover:shadow-md disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Card>
  )
}

export default FeedbackForm
