import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/dashboardLayoutComponents/layout";
import Film from "./components/films/films";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import PreWeddingGallery from "./components/preWedding/preWedding";
import { ToastContainer } from "react-toastify";
import RouteLoader from "./components/commonComponents/RouteLoader/RouteLoader";
import Contact from "./components/contact/contact";
import Home from "./pages/homePage";
import "react-toastify/dist/ReactToastify.css";

/* ==========================
   STORY PAGES
========================== */
import StoryManager from "./components/storiesComponents/mainFile";
import StoryDetails from "./components/storiesComponents/StoryDetails";
import StoriesList from "./components/storiesComponents/mainFile";
import Registeration from "./components/auth/registeration"
import Login from "./components/auth/login"

/* ==========================
   PHOTOBOOKS
========================== */
import PhotoBooks from "./pages/photoBookPage";

/* ==========================
   IMAGES PAGE
========================== */
import ImagesPage from "./components/image/image";

/* ==========================
   FAQ
========================== */
import FAQ from "./components/FAQ/faq";

/* ==========================
   ADMIN PAGES
========================== */
const AdminOverview = lazy(() =>
  import("./components/adminDashboardComponents/stories/AdminOverview")
);
const AdminHero = lazy(() =>
  import("./components/adminDashboardComponents/heroSection/AdminHero")
);
const PhotoBooksAdmin = lazy(() =>
  import("./components/adminDashboardComponents/photoBook/photoBookadminDashboard")
);
const AdminFilms = lazy(() =>
  import("./components/adminDashboardComponents/Films/AdminFilms")
);
const ImageAdminDashboard = lazy(() =>
  import("./components/adminDashboardComponents/image/imageAdminDashboard")
);
const AdminPreWedding = lazy(() =>
  import("./components/adminDashboardComponents/preWedding/preWedding")
);
const AdminCreateUsers = lazy(() =>
  import("./components/adminDashboardComponents/CreateUsers/CreateUsers")
);

/* ==========================
   EDITOR PAGES
========================== */
const EditorOverview = lazy(() =>
  import("./components/editorDashboardComponents/EditorOverview")
);
const EditorPosts = lazy(() =>
  import("./components/editorDashboardComponents/EditorPosts")
);
const EditorSettings = lazy(() =>
  import("./components/editorDashboardComponents/EditorSettings")
);

/* ==========================
   FAMILY ACCESS PAGES
========================== */
const FamilyAccess = lazy(() =>
  import("./components/adminDashboardComponents/CreateUsers/FamilyAccess")
);
const AdminFamilyRequests = lazy(() =>
  import("./components/adminDashboardComponents/CreateUsers/AdminFamilyRequests")
);



// assign work
const AssignWork = lazy(() =>
  import("./components/adminDashboardComponents/projectManagement/ProjectManagement")
);


/* ==========================
   LOGIN PAGE
========================== */
const AdminLogin = lazy(() => import("./components/Login"));
  
function App() {
  const userStr = localStorage.getItem("user");
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }
  const roleType = user?.role;

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {/* ==========================
            PUBLIC ROUTES
        ========================== */}
        <Route element={<PublicRoute />}>
          <Route path="/adminlogin" element={<AdminLogin />} />
        </Route>

        {/* ==========================
            HOME PAGE
        ========================== */}
        <Route path="/" element={<Home />} />
<Route path="/register" element={<Registeration />} />
<Route path="/login" element={<Login />} />
        {/* ==========================
            STORIES
        ========================== */}
        <Route path="/stories" element={<StoryManager />} />
        <Route path="/story/:id" element={<StoryDetails />} />
        <Route path="/storyList" element={<StoriesList />} />

        {/* ==========================
            FILMS
        ========================== */}
        <Route path="/films" element={<Film />} />

        {/* ==========================
            PRE WEDDING
        ========================== */}
        <Route path="/pre-wedding-stories" element={<PreWeddingGallery />} />

        {/* ==========================
            CONTACT
        ========================== */}
        <Route path="/contact" element={<Contact />} />

        {/* ==========================
            PHOTOBOOKS
        ========================== */}
        <Route path="/photobooks" element={<PhotoBooks />} />

        {/* ==========================
            IMAGES
        ========================== */}
        <Route path="/images" element={<ImagesPage />} />

        {/* ==========================
            FAQ
        ========================== */}
        <Route path="/faq" element={<FAQ />} />

        {/* ==========================
            PROTECTED DASHBOARD
        ========================== */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Layout roleType={roleType} />}
          >
            {/* ==========================
                DEFAULT DASHBOARD REDIRECT
            ========================== */}
            <Route
              index
              element={
                roleType === "ADMIN" ? (
                  <Navigate to="admin-stories" replace />
                ) : (
                  <Navigate to="editor-overview" replace />
                )
              }
            />

            {/* ==========================
                ADMIN ROUTES
            ========================== */}
            <Route path="admin-hero" element={<AdminHero />} />
            <Route path="admin-users" element={<AdminCreateUsers />} />
            <Route path="admin-stories" element={<AdminOverview />} />
            <Route path="photobooks-admin" element={<PhotoBooksAdmin />} />
            <Route path="images-admin" element={<ImageAdminDashboard />} />
            <Route path="admin-Films" element={<AdminFilms />} />
            <Route path="admin-PreWedding" element={<AdminPreWedding />} />
            <Route path="assign-work" element={<AssignWork />} />

            {/* ==========================
                EDITOR ROUTES
            ========================== */}
            <Route path="editor-overview" element={<EditorOverview />} />
            <Route path="posts" element={<EditorPosts />} />
            <Route path="editor-settings" element={<EditorSettings />} />

            {/* ==========================
                FAMILY ACCESS ROUTES
            ========================== */}
            {/* 👇 All logged-in users can access this page */}
            <Route path="family-access" element={<FamilyAccess />} />
            {/* 👇 Only ADMIN can access this page */}
            <Route path="admin-family-requests" element={<AdminFamilyRequests />} />
          </Route>
        </Route>

        {/* ==========================
            404 PAGE
        ========================== */}
        <Route
          path="*"
          element={<h1 className="text-4xl text-center mt-20">404 Page Not Found</h1>}
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </Suspense>
  );
}

export default App;