import { lazy, Suspense } from "react";

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

/* ==========================
   STORY PAGES
========================== */

import StoryManager from "./components/storiesComponents/mainFile";

import StoryDetails from "./components/storiesComponents/StoryDetails";

import StoriesList from "./components/storiesComponents/mainFile";

/* ==========================
   PHOTOBOOKS
========================== */

import PhotoBooks from "./components/photoBooks/photoBooks";

/* ==========================
   IMAGES PAGE
========================== */

import ImagesPage from "./components/image/image";

/* ==========================
   ADMIN PAGES
========================== */

const AdminOverview = lazy(() =>
  import(
    "./components/adminDashboardComponents/stories/AdminOverview"
  ),
);

const PhotoBooksAdmin = lazy(() =>
  import(
    "./components/adminDashboardComponents/photoBook/photoBookadminDashboard"
  ),
);

const AdminSettings = lazy(() =>
  import(
    "./components/adminDashboardComponents/AdminSettings"
  ),
);

const ImageAdminDashboard = lazy(() =>
  import(
    "./components/adminDashboardComponents/image/imageAdminDashboard"
  ),
);

/* ==========================
   EDITOR PAGES
========================== */

const EditorOverview = lazy(() =>
  import(
    "./components/editorDashboardComponents/EditorOverview"
  ),
);

const EditorPosts = lazy(() =>
  import(
    "./components/editorDashboardComponents/EditorPosts"
  ),
);

const EditorSettings = lazy(() =>
  import(
    "./components/editorDashboardComponents/EditorSettings"
  ),
);

/* ==========================
   LOGIN PAGE
========================== */

const Login = lazy(() =>
  import("./components/Login"),
);

function App() {

  const userStr =
    localStorage.getItem("user");

  let user = null;

  try {

    user = userStr
      ? JSON.parse(userStr)
      : null;

  } catch (e) {

    user = null;
  }

  const roleType =
    user?.role;

  return (

    <Suspense
      fallback={<RouteLoader />}
    >

      <Routes>

        {/* ==========================
            PUBLIC ROUTES
        ========================== */}

        <Route element={<PublicRoute />}>

          <Route
            path="/login"
            element={<Login />}
          />

        </Route>

        {/* ==========================
            HOME PAGE
        ========================== */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ==========================
            STORIES
        ========================== */}

        <Route
          path="/stories"
          element={<StoryManager />}
        />

        <Route
          path="/story/:id"
          element={<StoryDetails />}
        />

        <Route
          path="/storyList"
          element={<StoriesList />}
        />

        {/* ==========================
            PHOTOBOOKS
        ========================== */}

        <Route
          path="/photobooks"
          element={<PhotoBooks />}
        />

        {/* ==========================
            IMAGES PAGE
        ========================== */}

        <Route
          path="/images"
          element={<ImagesPage />}
        />

        {/* ==========================
            PROTECTED DASHBOARD
        ========================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={
              <Layout
                roleType={roleType}
              />
            }
          >

            {/* ==========================
                ADMIN ROUTES
            ========================== */}

            <Route
              path="admin-overview"
              element={<AdminOverview />}
            />

            <Route
              path="photobooks-admin"
              element={<PhotoBooksAdmin />}
            />

            <Route
              path="images-admin"
              element={<ImageAdminDashboard />}
            />

            <Route
              path="admin-settings"
              element={<AdminSettings />}
            />

            {/* ==========================
                EDITOR ROUTES
            ========================== */}

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

        {/* ==========================
            DASHBOARD REDIRECT
        ========================== */}

        <Route
          path="/dashboard"
          element={
            user ? (

              roleType === "ADMIN" ? (

                <Navigate
                  to="/dashboard/admin-overview"
                  replace
                />

              ) : roleType === "EDITOR" ? (

                <Navigate
                  to="/dashboard/editor-overview"
                  replace
                />

              ) : (

                <Navigate
                  to="/login"
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
            404 PAGE
        ========================== */}

        <Route
          path="*"
          element={
            <h1
              className="
                text-4xl
                text-center
                mt-20
              "
            >
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