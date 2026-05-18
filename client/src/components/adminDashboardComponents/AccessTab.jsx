import { useEffect, useState } from "react";

import {
  getEditors,
  updateEditorPermissions,
} from "../../config/api";

function AccessTab() {

  // ==========================
  // States
  // ==========================

  const [editors, setEditors] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ==========================
  // Fetch Editors
  // ==========================

  const fetchEditors = async () => {

    try {

      setLoading(true);

      const response =
        await getEditors();

      console.log(
        "Editors:",
        response.data.editors,
      );

      setEditors(
        response.data.editors,
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  // ==========================
  // Initial Load
  // ==========================

  useEffect(() => {

    fetchEditors();

  }, []);

  // ==========================
  // Handle Permissions
  // ==========================

  const handlePermissionChange = (
    editorId,
    permission,
  ) => {

    const updatedEditors =
      editors.map((editor) => {

        if (
          editor._id === editorId
        ) {

          const hasPermission =
            editor.permissions.includes(
              permission,
            );

          return {
            ...editor,

            permissions:
              hasPermission
                ? editor.permissions.filter(
                    (item) =>
                      item !==
                      permission,
                  )
                : [
                    ...editor.permissions,
                    permission,
                  ],
          };
        }

        return editor;
      });

    setEditors(updatedEditors);
  };

  // ==========================
  // Save Permissions
  // ==========================

  const handleSave = async () => {

    try {

      setLoading(true);

      for (const editor of editors) {

        await updateEditorPermissions(
          {
            userId: editor._id,

            permissions:
              editor.permissions,
          },
        );
      }

      alert(
        "Permissions Updated Successfully",
      );

      fetchEditors();

    } catch (error) {

      console.log(error);

      alert(
        "Failed To Update Permissions",
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">

      {/* Heading */}

      <h1 className="text-3xl font-bold mb-6">
        Access Management
      </h1>

      {/* Loading */}

      {loading && (
        <p className="mb-4">
          Loading...
        </p>
      )}

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full border border-gray-300">

          {/* Head */}

          <thead className="bg-black text-white">

            <tr>

              <th className="p-3 border">
                Editor Name
              </th>

              <th className="p-3 border">
                Overview
              </th>

              <th className="p-3 border">
                Posts
              </th>

              <th className="p-3 border">
                Settings
              </th>

            </tr>

          </thead>

          {/* Body */}

          <tbody>

            {editors.length > 0 ? (

              editors.map((editor) => (

                <tr
                  key={editor._id}
                  className="text-center"
                >

                  {/* Name */}

                  <td className="p-3 border font-semibold">

                    {editor.name}

                  </td>

                  {/* Overview */}

                  <td className="p-3 border">

                    <input
                      type="checkbox"

                      checked={editor.permissions.includes(
                        "overview",
                      )}

                      onChange={() =>
                        handlePermissionChange(
                          editor._id,
                          "overview",
                        )
                      }
                    />

                  </td>

                  {/* Posts */}

                  <td className="p-3 border">

                    <input
                      type="checkbox"

                      checked={editor.permissions.includes(
                        "posts",
                      )}

                      onChange={() =>
                        handlePermissionChange(
                          editor._id,
                          "posts",
                        )
                      }
                    />

                  </td>

                  {/* Settings */}

                  <td className="p-3 border">

                    <input
                      type="checkbox"

                      checked={editor.permissions.includes(
                        "settings",
                      )}

                      onChange={() =>
                        handlePermissionChange(
                          editor._id,
                          "settings",
                        )
                      }
                    />

                  </td>

                </tr>
              ))

            ) : (

              <tr>

                <td
                  colSpan="4"
                  className="p-5 text-center"
                >
                  No Editors Found
                </td>

              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* Button */}

      <div className="mt-6 flex justify-end">

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Save Permissions
        </button>

      </div>

    </div>
  );
}

export default AccessTab;