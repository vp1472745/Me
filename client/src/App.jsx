import { lazy, Suspense, useEffect, useState } from "react";

import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Layout from "./components/dashboardLayoutComponents/layout";

import ProtectedRoute from "./utils/ProtectedRoute";

import PublicRoute from "./utils/PublicRoute";

import { ToastContainer } from "react-toastify";

import RouteLoader from "./components/commonComponents/RouteLoader/RouteLoader";
import Home from "./pages/homePage";

import "react-toastify/dist/ReactToastify.css";

import StoryManager from "./components/storiesComponents/mainFile";
import StoryDetails from "./components/storiesComponents/StoryDetails";
import StoriesList from "./components/storiesComponents/mainFile";

import axios from "axios";

// ==========================
// Admin Pages
// ==========================

const AdminOverview = lazy(() =>
  import("./components/adminDashboardComponents/stories/AdminOverview"),
);

const AdminUsers = lazy(() =>
  import("./components/adminDashboardComponents/AdminUsers"),
);

const AdminSettings = lazy(() =>
  import("./components/adminDashboardComponents/AdminSettings"),
);

const AdminAccess = lazy(() =>
  import("./components/adminDashboardComponents/AccessTab"),
);

// ==========================
// Editor Pages
// ==========================

const EditorOverview = lazy(() =>
  import("./components/editorDashboardComponents/EditorOverview"),
);

const EditorPosts = lazy(() =>
  import("./components/editorDashboardComponents/EditorPosts"),
);

const EditorSettings = lazy(() =>
  import("./components/editorDashboardComponents/EditorSettings"),
);

// ==========================
// Login
// ==========================

const Login = lazy(() =>
  import("./components/Login"),
);

function App() {

  const user = JSON.parse(
    localStorage.getItem("user"),
  );

  const roleType = user?.role;

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/story/all");
        setStories(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch stories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const retryFetchingStories = () => {
    setError(null);
    setLoading(true);
    fetchStories();
  };

  const handleStoryClick = (story) => {
    console.log("Story clicked:", story);
  };

  return (
    <Suspense fallback={<RouteLoader />}>

      <Routes>

        {/* ==========================
            PUBLIC ROUTE
        ========================== */}

        <Route element={<PublicRoute />}>

         <Route path="/" element={<Home />} />

  <Route
    path="/login"
    element={<Login />}
  />

 <Route path="/stories" element={<StoryManager />} />
        <Route path="/story/:id" element={<StoryDetails />} />

    <Route path="/storyList" element={<StoriesList />} />


        </Route>

        {/* ==========================
            ADMIN ROUTES
        ========================== */}

        {roleType === "ADMIN" && (
          <Route element={<ProtectedRoute />}>

            <Route
              path="/"
              element={
                <Layout roleType={roleType} />
              }
            >

              <Route
                path="admin-overview"
                element={<AdminOverview />}
              />

              <Route
                path="users"
                element={<AdminUsers />}
              />

              <Route
                path="access"
                element={<AdminAccess />}
              />

              <Route
                path="admin-settings"
                element={<AdminSettings />}
              />

            </Route>

          </Route>
        )}

        {/* ==========================
            EDITOR ROUTES
        ========================== */}

        {roleType === "EDITOR" && (
          <Route element={<ProtectedRoute />}>

            <Route
              path="/"
              element={
                <Layout roleType={roleType} />
              }
            >

              <Route
                path="editor-overview"
                element={<EditorOverview />}
              />

              <Route
                path="posts"
                element={<EditorPosts />}
              />

              <Route
                path="editor-settings"
                element={<EditorSettings />}
              />

            </Route>

          </Route>
        )}

        {/* ==========================
            ROOT REDIRECT
        ========================== */}

        <Route
          path="/"
          element={
            user ? (
              roleType === "ADMIN" ? (
                <Navigate
                  to="/admin-overview"
                  replace
                />
              ) : (
                <Navigate
                  to="/editor-overview"
                  replace
                />
              )
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* ==========================
            404
        ========================== */}

        <Route
          path="*"
          element={
            <h1 className="text-4xl text-center mt-20">
              404 Page Not Found
            </h1>
          }
        />

      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

    </Suspense>
  );
}

export default App;