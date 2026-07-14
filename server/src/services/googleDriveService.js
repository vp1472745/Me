import axios from "axios";

/**
 * Construct Google OAuth authorize URL for Consent Screen
 */
export const getAuthUrl = (userId) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    state: userId,
  };
  return `${rootUrl}?${new URLSearchParams(options).toString()}`;
};

/**
 * Exchange OAuth auth code for access & refresh tokens
 */
export const getTokens = async (code) => {
  const response = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  });
  return response.data;
};

/**
 * Fetch connected Google account email
 */
export const getUserEmail = async (accessToken) => {
  const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data.email;
};

/**
 * Automatically refresh access token using refresh token
 */
export const getAccessToken = async (user) => {
  if (!user.googleDrive?.refreshToken) {
    throw new Error("Google Drive not connected for this client");
  }
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.googleDrive.refreshToken,
      grant_type: "refresh_token",
    });
    const { access_token } = response.data;
    user.googleDrive.accessToken = access_token;
    await user.save();
    return access_token;
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    throw new Error("Failed to refresh Google Drive access token");
  }
};

/**
 * Find folder ID by name and parent folder
 */
export const findFolder = async (accessToken, name, parentId = null) => {
  let query = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }
  try {
    const response = await axios.get("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      },
    });
    const files = response.data.files;
    return files && files.length > 0 ? files[0].id : null;
  } catch (error) {
    console.error(`Error finding folder ${name}:`, error.response?.data || error.message);
    return null;
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (accessToken, folderName, parentId = null) => {
  const body = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    body.parents = [parentId];
  }
  try {
    const response = await axios.post("https://www.googleapis.com/drive/v3/files", body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.id;
  } catch (error) {
    console.error(`Error creating folder ${folderName}:`, error.response?.data || error.message);
    throw new Error(`Failed to create Google Drive folder: ${folderName}`);
  }
};

/**
 * Find existing folder or create it if not found (Prevents duplication)
 */
export const findOrCreateFolder = async (accessToken, name, parentId = null) => {
  let folderId = await findFolder(accessToken, name, parentId);
  if (!folderId) {
    folderId = await createFolder(accessToken, name, parentId);
  }
  return folderId;
};

/**
 * Setup default folders structure inside the client root folder
 */
export const setupClientFolders = async (accessToken, rootFolderId) => {
  const subFolders = [
    "Wedding",
    "Pre Wedding",
    "Haldi",
    "Mehendi",
    "Reception",
    "RAW Photos",
    "Edited Photos",
    "Videos",
    "Albums",
    "Final Delivery",
  ];
  const mapping = {};
  for (const folder of subFolders) {
    const folderId = await findOrCreateFolder(accessToken, folder, rootFolderId);
    mapping[folder] = folderId;
  }
  return mapping;
};

/**
 * Upload file directly to Google Drive via multipart REST API request
 */
export const uploadFile = async (accessToken, parentId, fileName, fileBuffer, mimeType) => {
  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [parentId],
  };

  const multipartRequestBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n` +
    "Content-Transfer-Encoding: base64\r\n\r\n" +
    fileBuffer.toString("base64") +
    closeDelimiter;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size",
      multipartRequestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": multipartRequestBody.length,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading file to Drive:", error.response?.data || error.message);
    throw new Error("Failed to upload file to Google Drive");
  }
};

/**
 * Download/Stream file content directly from Google Drive
 */
export const getFileStream = async (accessToken, fileId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "stream",
      }
    );
    return response;
  } catch (error) {
    console.error("Error downloading file from Drive:", error.response?.data || error.message);
    throw new Error("Failed to retrieve file content from Google Drive");
  }
};
