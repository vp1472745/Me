import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { loginUser } from "../config/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  // ==========================
  // Handle Input Change
  // ==========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // ==========================
  // Handle Login
  // ==========================

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response =
        await loginUser(formData);

      // ==========================
      // Save User
      // ==========================

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user,
        ),
      );

      toast.success(
        response.data.message,
      );

      // ==========================
      // Role Based Redirect
      // ==========================

      const userRole =
        response.data.user.role;

      // ADMIN
      if (
        userRole === "ADMIN"
      ) {

        navigate(
          "/dashboard/admin-stories",
        );

      }

      // EDITOR
      else if (
        userRole === "EDITOR"
      ) {

        navigate(
          "/dashboard/editor-overview",
        );

      }

      // DEFAULT
      else {

        navigate("/");
      }

    }  catch (error) {
  console.log("ERROR:", error);
  console.log("STATUS:", error.response?.status);
  console.log("DATA:", error.response?.data);
  console.log("MESSAGE:", error.message);

  toast.error(
    error.response?.data?.message ||
    error.message ||
    "Login Failed"
  );
} finally {

      setLoading(false);
    }
  };

  return (

    <div
      className="
        flex
        min-h-screen
        overflow-hidden
      "
    >

      {/* ==========================
          LEFT SIDE
      ========================== */}

      <div
        className="
          hidden
          md:flex
          md:w-1/2
          relative
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage:
            `url('https://images.unsplash.com/photo-1613336026275-d6d473084e85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
        }}
      >

        {/* Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-black/50
            backdrop-blur-[2px]
          "
        ></div>

        {/* Content */}

        <div
          className="
            relative
            z-10
            flex
            flex-col
            justify-center
            px-12
            text-white
          "
        >

          <div className="mb-6">

            <span
              className="
                text-4xl
                font-black
                tracking-tighter
              "
            >
              SHUTTER
            </span>

            <span
              className="
                text-4xl
                font-light
                tracking-tighter
              "
            >
              STUDIO
            </span>

          </div>

          <h1
            className="
              text-5xl
              lg:text-6xl
              font-bold
              leading-tight
              mb-6
            "
          >
            Capture the
            <br />
            Art of Moments
          </h1>

          <p
            className="
              text-lg
              lg:text-xl
              text-gray-200
              mb-8
              leading-relaxed
            "
          >
            Every photograph tells a unique story.
            Join our community of visual storytellers
            and showcase your perspective.
          </p>

        </div>

      </div>

      {/* ==========================
          RIGHT SIDE
      ========================== */}

      <div
        className="
          w-full
          md:w-1/2
          flex
          items-center
          justify-center
          p-6
          lg:p-10
          bg-gradient-to-br
          from-gray-50
          to-gray-100
        "
      >

        <div
          className="
            w-full
            max-w-md
          "
        >

          {/* Mobile Logo */}

          <div
            className="
              md:hidden
              text-center
              mb-8
            "
          >

            <span
              className="
                text-3xl
                font-black
                tracking-tighter
                text-gray-900
              "
            >
              SHUTTER
            </span>

            <span
              className="
                text-3xl
                font-light
                tracking-tighter
                text-gray-700
              "
            >
              STUDIO
            </span>

            <p
              className="
                text-sm
                text-gray-500
                mt-2
              "
            >
              Sign in to continue
            </p>

          </div>

          {/* FORM */}

          <form
            onSubmit={handleLogin}
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              shadow-gray-200/50
              p-8
              lg:p-10
            "
          >

            <div
              className="
                text-center
                mb-8
              "
            >

              <div
                className="
                  hidden
                  md:block
                  mb-4
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    bg-amber-100
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    mx-auto
                  "
                >

                  <span className="text-3xl">
                    📷
                  </span>

                </div>

              </div>

              <h2
                className="
                  text-2xl
                  lg:text-3xl
                  font-bold
                  text-gray-800
                "
              >
                Welcome Back
              </h2>

              <p
                className="
                  text-gray-500
                  mt-2
                  text-sm
                "
              >
                Sign in to your account
              </p>

            </div>

            {/* USERNAME */}

            <div className="mb-5">

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Full Name / Username
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter username"
                value={formData.name}
                onChange={handleChange}
                required
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  focus:ring-2
                  focus:ring-amber-400/30
                  focus:border-amber-400
                  outline-none
                "
              />

            </div>

            {/* PASSWORD */}

            <div className="mb-6">

              <label
                className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-200
                  rounded-xl
                  focus:ring-2
                  focus:ring-amber-400/30
                  focus:border-amber-400
                  outline-none
                "
              />

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-gradient-to-r
                from-gray-900
                to-gray-800
                hover:from-amber-700
                hover:to-amber-600
                text-white
                font-semibold
                py-3.5
                rounded-xl
                transition-all
                duration-300
              "
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;