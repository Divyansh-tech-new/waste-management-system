"use client"

import { useState } from "react"

const BinCard = ({ bin, index }) => {
  const [imageError, setImageError] = useState(false)

  // Get background colors based on waste type
  const getBackgroundStyle = (category) => {
    const type = category?.toLowerCase() || "others"
    
    const styles = {
      biodegradable: "bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7]",
      "non-biodegradable": "bg-gradient-to-br from-[#B2DFDB] to-[#80CBC4]",
      metal: "bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]",
      plastic: "bg-gradient-to-br from-[#81C784] to-[#66BB6A]",
      others: "bg-gradient-to-br from-[#DCEDC8] to-[#C5E1A5]",
    }
    
    return styles[type] || styles.others
  }

  // Get image URL with fallback
  const getImageUrl = () => {
    if (bin.images && bin.images.length > 0 && !imageError) {
      return bin.images[0].url
    }
    
    // Placeholder images based on waste type
    const type = (bin.type || bin.category || "others").toLowerCase()
    const placeholders = {
      biodegradable: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
      "non-biodegradable": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=300&fit=crop",
      metal: "https://res.cloudinary.com/deqzetctp/image/upload/v1763136251/camera-feeds/eb8azi3nypbmf9slakez.jpg",
      plastic: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400&h=300&fit=crop",
      others: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop",
    }
    
    return placeholders[type] || placeholders.others
  }

  const imageUrl = getImageUrl()
  const category = bin.type || bin.category || "Others"

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl cursor-pointer h-40 ${
        getBackgroundStyle(category)
      }`}
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center space-y-1 p-4">
        <span className="text-3xl font-bold text-gray-900 drop-shadow-md">
          {bin.fillLevel || 0}% Full
        </span>
        <span className="text-base font-bold text-gray-800 drop-shadow-sm">
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      </div>
    </div>
  )
}

export default BinCard
