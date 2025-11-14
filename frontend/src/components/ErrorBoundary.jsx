import { Component } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { AlertCircle } from "lucide-react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Error Boundary]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 m-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-[#A8D5A2] hover:bg-[#98C592] text-gray-800 font-semibold px-4 py-2 rounded-lg"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
