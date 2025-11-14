import { Button } from "../ui/button"
import { Trash2, RefreshCw, Activity } from "lucide-react"

const Sidebar = () => {
  return (
    <aside className="w-52 bg-gradient-to-b from-[#A8D5A2] to-[#B8E6A2] h-screen fixed left-0 top-16 p-4 space-y-4 shadow-lg">
      <Button
        className="w-full bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-6 font-bold transition-all duration-200 hover:shadow-lg border-2 border-white hover:border-gray-200"
        onClick={() => console.log("Empty All Bins")}
      >
        <Trash2 className="mr-2 h-5 w-5" />
        Empty All Bins
      </Button>

      <Button
        className="w-full bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-6 font-bold transition-all duration-200 hover:shadow-lg border-2 border-white hover:border-gray-200"
        onClick={() => console.log("Test System")}
      >
        <Activity className="mr-2 h-5 w-5" />
        Test System
      </Button>

      <Button
        className="w-full bg-white hover:bg-gray-50 text-gray-800 rounded-xl py-6 font-bold transition-all duration-200 hover:shadow-lg border-2 border-white hover:border-gray-200"
        onClick={() => console.log("Restart Sensors")}
      >
        <RefreshCw className="mr-2 h-5 w-5" />
        Restart Sensors
      </Button>
    </aside>
  )
}

export default Sidebar
