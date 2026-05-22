// ==============================
// GalleryUpload.jsx
// ==============================

import React, {
  useEffect,
  useState,
} from "react";

import {
  createGallery,
  getAllGalleries,
  deleteGallery,
} from "../../../config/api";

const GalleryUpload = () => {

  // ==============================
  // STATES
  // ==============================

  const [activeTab, setActiveTab] =
    useState("create");

  const [title, setTitle] =
    useState("");

  const [images, setImages] =
    useState([]);

  const [galleries, setGalleries] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ==============================
  // CREATE GALLERY
  // ==============================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "title",
          title
        );

        for (
          let i = 0;
          i < images.length;
          i++
        ) {
          formData.append(
            "images",
            images[i]
          );
        }

        await createGallery(
          formData
        );

        alert(
          "Gallery Uploaded Successfully"
        );

        setTitle("");
        setImages([]);

        fetchGalleries();

        setActiveTab("all");

      } catch (error) {

        console.log(error);

        alert(
          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  // ==============================
  // GET ALL GALLERIES
  // ==============================

  const fetchGalleries =
    async () => {

      try {

        const res =
          await getAllGalleries();

        setGalleries(
          res?.data?.data || []
        );

      } catch (error) {

        console.log(error);
      }
    };

  // ==============================
  // DELETE GALLERY
  // ==============================

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this gallery?"
        );

      if (!confirmDelete) return;

      try {

        await deleteGallery(id);

        alert(
          "Gallery Deleted"
        );

        fetchGalleries();

      } catch (error) {

        console.log(error);

        alert(
          "Delete failed"
        );
      }
    };

  // ==============================
  // USE EFFECT
  // ==============================

  useEffect(() => {

    fetchGalleries();

  }, []);

  return (

    <div
      className="
        min-h-screen
        bg-[#f5f2eb]
        px-4
        md:px-10
        py-10
      "
    >

      {/* ==============================
          CONTAINER
      ============================== */}

      <div
        className="
          max-w-7xl
          mx-auto
          bg-white
          shadow-xl
          overflow-hidden
        "
      >

        {/* ==============================
            HEADER
        ============================== */}

        <div
          className="
            border-b
            border-[#ece7df]
            px-8
            py-8
          "
        >

          <h1
            className="
              text-center
              text-3xl
              md:text-5xl
              tracking-[10px]
              uppercase
              text-[#8d8479]
              font-light
            "
          >
            Gallery Dashboard
          </h1>

        </div>

        {/* ==============================
            TABS
        ============================== */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-4
            py-8
            bg-[#faf7f2]
            border-b
            border-[#ece7df]
          "
        >

          {/* CREATE TAB */}

          <button
            onClick={() =>
              setActiveTab("create")
            }
            className={`
              px-8
              py-3
              uppercase
              tracking-[3px]
              text-sm
              transition-all
              duration-300

              ${
                activeTab === "create"
                  ? `
                    bg-[#8d8479]
                    text-white
                  `
                  : `
                    border
                    border-[#d8d1c7]
                    text-[#8d8479]
                    hover:bg-[#f4f1eb]
                  `
              }
            `}
          >
            Create Gallery
          </button>

          {/* ALL TAB */}

          <button
            onClick={() =>
              setActiveTab("all")
            }
            className={`
              px-8
              py-3
              uppercase
              tracking-[3px]
              text-sm
              transition-all
              duration-300

              ${
                activeTab === "all"
                  ? `
                    bg-[#8d8479]
                    text-white
                  `
                  : `
                    border
                    border-[#d8d1c7]
                    text-[#8d8479]
                    hover:bg-[#f4f1eb]
                  `
              }
            `}
          >
            Get All Galleries
          </button>

        </div>

        {/* ==============================
            CREATE TAB
        ============================== */}

        {activeTab === "create" && (

          <div className="p-8 md:p-14">

            <form
              onSubmit={handleSubmit}
              className="space-y-10"
            >

              {/* TITLE */}

              <div>

                <label
                  className="
                    block
                    mb-4
                    uppercase
                    tracking-[3px]
                    text-[#8d8479]
                    text-sm
                  "
                >
                  Gallery Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Enter gallery title"
                  className="
                    w-full
                    border
                    border-[#ddd]
                    px-6
                    py-4
                    outline-none
                    text-[#8d8479]
                    focus:border-[#8d8479]
                  "
                  required
                />

              </div>

              {/* IMAGES */}

              <div>

                <label
                  className="
                    block
                    mb-4
                    uppercase
                    tracking-[3px]
                    text-[#8d8479]
                    text-sm
                  "
                >
                  Upload Images
                </label>

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setImages(
                      e.target.files
                    )
                  }
                  className="
                    w-full
                    border
                    border-dashed
                    border-[#d8d1c7]
                    p-6
                    bg-[#faf7f2]
                  "
                  required
                />

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  bg-[#8d8479]
                  text-white
                  px-10
                  py-4
                  uppercase
                  tracking-[4px]
                  hover:opacity-90
                  transition-all
                "
              >
                {
                  loading
                    ? "Uploading..."
                    : "Upload Gallery"
                }
              </button>

            </form>

          </div>
        )}

        {/* ==============================
            GET ALL TAB
        ============================== */}

        {activeTab === "all" && (

          <div
            className="
              p-8
              md:p-12
            "
          >

            {galleries.length === 0 ? (

              <div
                className="
                  text-center
                  text-[#8d8479]
                  text-xl
                  py-20
                "
              >
                No Galleries Found
              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-3
                  gap-10
                "
              >

                {galleries.map(
                  (gallery) => (

                    <div
                      key={gallery._id}
                      className="
                        bg-[#faf7f2]
                        border
                        border-[#ece7df]
                        overflow-hidden
                        shadow-md
                      "
                    >

                      {/* IMAGE */}

                      <img
                        src={
                          gallery
                            ?.images?.[0]
                        }
                        alt=""
                        className="
                          w-full
                          h-[320px]
                          object-cover
                        "
                      />

                      {/* CONTENT */}

                      <div className="p-6">

                        <h2
                          className="
                            text-2xl
                            text-[#8d8479]
                            tracking-[4px]
                            uppercase
                            font-light
                            mb-4
                          "
                        >
                          {gallery.title}
                        </h2>

                        <p
                          className="
                            text-[#8d8479]
                            mb-6
                          "
                        >
                          Total Images:
                          {" "}
                          {
                            gallery
                              ?.images
                              ?.length
                          }
                        </p>

                        {/* BUTTON */}

                        <button
                          onClick={() =>
                            handleDelete(
                              gallery._id
                            )
                          }
                          className="
                            bg-red-500
                            text-white
                            px-6
                            py-3
                            uppercase
                            tracking-[3px]
                            text-sm
                          "
                        >
                          Delete
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default GalleryUpload;