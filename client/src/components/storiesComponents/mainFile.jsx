// Stories.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStories } from "../../config/api"; // adjust path

const Stories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllStories();
      let storiesArray = [];
      if (response.data?.stories) storiesArray = response.data.stories;
      else if (response.data?.data?.stories) storiesArray = response.data.data.stories;
      else if (Array.isArray(response.data)) storiesArray = response.data;
      setStories(storiesArray);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = (story) => {
    navigate(`/story/${story._id}`, { state: story });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6d645b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f5f1eb] min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchStories}
          className="border border-[#6d645b] px-6 py-2 hover:bg-[#6d645b] hover:text-white transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f1eb] min-h-screen px-4 sm:px-8 lg:px-20 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="border-t border-[#cfc6bb] pt-10">
          <h1 className="text-center tracking-[10px] text-3xl text-[#6f655d] font-light">
            STORIES
          </h1>
          <p className="text-center italic text-[#b1a79d] mt-4 text-lg">
            Delve deeper into our world of story-telling!
          </p>
          <div className="border-b border-[#cfc6bb] mt-10"></div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {stories.map((story) => (
            <div key={story._id} className="group">
              <div className="overflow-hidden">
                <img
                  src={
                    story.coverImage ||
                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200"
                  }
                  alt={story.title}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition duration-500"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x500?text=No+Image";
                  }}
                />
              </div>
              <div className="text-center mt-5">
                <h2 className="text-3xl text-[#6d645b] font-light">
                  {story.title || "Untitled"}
                </h2>
                <p className="text-[#b0a69b] mt-3 text-lg">
                  {story.couple || "Couple"}, {story.location || "Location"}
                </p>
                <p className="text-[#b0a69b] text-sm italic mt-1">
                  {formatDate(story.date)}
                </p>
                <button
                  onClick={() => handleReadMore(story)}
                  className="mt-5 border border-[#6d645b] px-6 py-2 text-[#6d645b] hover:bg-[#6d645b] hover:text-white transition"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>

        {stories.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-[#b1a79d] text-lg">No stories found. Upload your first story!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;