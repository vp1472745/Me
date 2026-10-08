import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./utils/ProtectedRoute";
import PublicRoute from "./utils/PublicRoute";
import { ToastContainer } from "react-toastify";
import RouteLoader from "./components/common/RouteLoader";
import ScrollToTop from "./components/common/ScrollToTop";
import "react-toastify/dist/ReactToastify.css";

/* ==========================
   PUBLIC PAGES (LAZY LOADED FOR FAST INITIAL LOAD)
========================== */
const Home = lazy(() => import("./pages/homePage"));
const Contact = lazy(() => import("./features/public/contact/ContactForm"));
const Film = lazy(() => import("./features/public/films/Films"));
const PreWeddingGallery = lazy(() => import("./features/public/pre-wedding/PreWeddingGallery"));
const StoryManager = lazy(() => import("./features/public/stories/StoryManager"));
const StoryDetails = lazy(() => import("./features/public/stories/StoryDetails"));
const StoriesList = lazy(() => import("./features/public/stories/StoryManager"));
const PhotoBooks = lazy(() => import("./pages/photoBookPage"));
const ImagesPage = lazy(() => import("./features/public/image-portfolio/ImagesPage"));
const FAQ = lazy(() => import("./features/public/faq/FAQ"));

/* ==========================
   AUTH PAGES
========================== */
const Registeration = lazy(() => import("./features/auth/RegistrationCard"));
const Login = lazy(() => import("./features/auth/LoginCard"));

/* ==========================
   ADMIN PAGES
========================== */
const AdminOverview = lazy(() =>
  import("./features/admin/AdminOverview")
);
const AdminStories = lazy(() =>
  import("./features/admin/AdminStoriesOverview")
);
const AdminHero = lazy(() =>
  import("./features/admin/AdminHero")
);
const PhotoBooksAdmin = lazy(() =>
  import("./features/admin/AdminPhotoBookDashboard")
);
const AdminFilms = lazy(() =>
  import("./features/admin/AdminFilms")
);
const ImageAdminDashboard = lazy(() =>
  import("./features/admin/AdminImageDashboard")
);
const AdminPreWedding = lazy(() =>
  import("./features/admin/AdminPreWedding")
);
const AdminCreateUsers = lazy(() =>
  import("./features/admin/CreateUsers")
);
const AdminUsers = lazy(() =>
  import("./features/admin/AdminUsers")
);

/* ==========================
   EDITOR PAGES
========================== */
const EditorOverview = lazy(() =>
  import("./features/editor/EditorOverview")
);
const EditorPosts = lazy(() =>
  import("./features/editor/EditorPosts")
);
const EditorSettings = lazy(() =>
  import("./features/editor/EditorSettings")
);

/* ==========================
   USER DASHBOARD PAGES
========================== */
const UserOverview = lazy(() =>
  import("./features/user/UserOverview")
);
const MyProjects = lazy(() =>
  import("./features/user/MyProjects")
);
const UserGallery = lazy(() =>
  import("./features/user/UserGallery")
);
const UserCorrections = lazy(() =>
  import("./features/user/UserCorrections")
);
const UserNotifications = lazy(() =>
  import("./features/user/UserNotifications")
);
const UserTimeline = lazy(() =>
  import("./features/user/UserTimeline")
);
const UserProfile = lazy(() =>
  import("./features/user/UserProfile")
);

/* ==========================
   FAMILY ACCESS PAGES
========================== */
const FamilyAccess = lazy(() =>
  import("./features/admin/FamilyAccess")
);
const AdminFamilyRequests = lazy(() =>
  import("./features/admin/AdminFamilyRequests")
);

// assign work
const AssignWork = lazy(() =>
  import("./features/admin/ProjectManagement")
);

/* ==========================
   LOGIN PAGE
========================== */
const AdminLogin = lazy(() => import("./features/auth/AdminLoginCard"));
  
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
      <ScrollToTop />
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
                  <Navigate to="admin-overview" replace />
                ) : roleType === "EDITOR" ? (
                  <Navigate to="editor-overview" replace />
                ) : (
                  <Navigate to="user-overview" replace />
                )
              }
            />

            {/* ==========================
                ADMIN ROUTES
            ========================== */}
            <Route path="admin-overview" element={<AdminOverview />} />
            <Route path="admin-hero" element={<AdminHero />} />
            <Route path="admin-users" element={<AdminCreateUsers />} />
            <Route path="admin-all-users" element={<AdminUsers />} />
            <Route path="admin-stories" element={<AdminStories />} />
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
                USER ROUTES
            ========================== */}
            <Route path="user-overview" element={<UserOverview />} />
            <Route path="my-projects" element={<MyProjects />} />
            <Route path="gallery" element={<UserGallery />} />
            <Route path="corrections" element={<UserCorrections />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="timeline" element={<UserTimeline />} />
            <Route path="profile" element={<UserProfile />} />

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