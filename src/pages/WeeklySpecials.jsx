import { useState, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Video as VideoIcon,
  Loader,
} from "lucide-react"; // Removed SearchIcon
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const WeeklySpecials = () => {
  const [specials, setSpecials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecial, setEditingSpecial] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    thumbnailUrl: "",
    thumbnailFile: null,
    videoUrl: "",
    video: null,
    description: "",
    date: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specialToDeleteId, setSpecialToDeleteId] = useState(null);

  // --- Dealership Selection States ---
  const [allDealerships, setAllDealerships] = useState([]); // Stores all fetched dealerships
  const [selectedDealershipId, setSelectedDealershipId] = useState(""); // Stores the ID of the selected dealership
  const [selectedDealershipName, setSelectedDealershipName] = useState(""); // Stores the name of the selected dealership for display

  // --- API Calls ---

  const fetchSpecials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}weekly-specials`);
      setSpecials(response.data.data);
    } catch (err) {
      console.error("Error fetching weekly specials:", err);
      setError("Failed to load weekly specials.");
      toast.error("Failed to load weekly specials.", { id: "fetchSpecials" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDealershipsForSelect = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}dealerships/searchIdName`
      );
      setAllDealerships(response.data.data);
    } catch (err) {
      console.error("Error fetching all dealerships for select:", err);
      toast.error("Failed to load dealerships for selection.");
    }
  };

  useEffect(() => {
    fetchSpecials();
    fetchDealershipsForSelect();
  }, []);

  const columns = [
    {
      header: "Title",
      accessor: "title",
      cell: (row) => (
        <div className="font-medium text-gray-900">{row.title}</div>
      ),
    },
    {
      header: "Dealership",
      accessor: "dealership",
      // Assuming row.dealership still gives the name string for display
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {}
          {!row.dealership?.name ? (
            <span>Deleted</span>
          ) : (
            <span>{row?.dealership?.name}</span>
          )}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: "date",
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      header: "Thumbnail",
      accessor: "thumbnailUrl",
      cell: (row) =>
        row.thumbnail ? (
          <img
            src={row.thumbnail}
            alt="Thumbnail"
            className="h-10 w-10 object-cover rounded"
          />
        ) : (
          <div className="text-gray-400 flex items-center">
            <ImageIcon className="w-4 h-4 mr-1" />
            No Image
          </div>
        ),
    },
    {
      header: "Video",
      accessor: "videoUrl",
      cell: (row) =>
        row.video ? (
          <a
            href={row.video}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <VideoIcon className="w-4 h-4 mr-1" />
            View Video
          </a>
        ) : (
          <div className="text-gray-400 flex items-center">
            <VideoIcon className="w-4 h-4 mr-1" />
            No Video
          </div>
        ),
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingSpecial(null);
    setFormData({
      title: "",
      thumbnailUrl: "",
      thumbnailFile: null,
      videoUrl: "",
      video: null,
      description: "",
      date: "",
    });
    setThumbnailPreview("");
    setVideoPreview("");
    setSelectedDealershipId(""); // Clear selected ID
    setSelectedDealershipName(""); // Clear selected name
    setIsModalOpen(true);
  };

  const handleEdit = (special) => {
    setEditingSpecial(special);
    setFormData({
      title: special.title,
      thumbnailUrl: special.thumbnail || "",
      thumbnailFile: null,
      videoUrl: special.video || "",
      video: null,
      description: special.description,
      date: special.date
        ? new Date(special.date).toISOString().split("T")[0]
        : "",
    });
    setThumbnailPreview(special.thumbnail || "");
    setVideoPreview(special.video || "");

    if (
      special.dealership &&
      typeof special.dealership === "object" &&
      special.dealership._id
    ) {
      setSelectedDealershipId(special.dealership._id);
      setSelectedDealershipName(special.dealership.name);
    } else if (typeof special.dealership === "string") {
      // If only the name string is available, try to find the ID from the allDealerships list
      const foundDealership = allDealerships.find(
        (d) => d.name === special.dealership
      );
      if (foundDealership) {
        setSelectedDealershipId(foundDealership._id);
        setSelectedDealershipName(foundDealership.name);
      } else {
        // Handle case where dealership name from special isn't in our current list
        setSelectedDealershipId("");
        setSelectedDealershipName(special.dealership || ""); // Keep name for display if not found
      }
    } else {
      setSelectedDealershipId("");
      setSelectedDealershipName("");
    }

    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "thumbnailFile") {
      setFormData((prev) => ({ ...prev, thumbnailFile: files[0] }));
      setThumbnailPreview(files[0] ? URL.createObjectURL(files[0]) : "");
    } else if (name === "video") {
      setFormData((prev) => ({ ...prev, video: files[0] }));
      setVideoPreview(files[0] ? URL.createObjectURL(files[0]) : "");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDealershipSelectChange = (e) => {
    const selectedId = e.target.value;
    setSelectedDealershipId(selectedId);
    const selectedDealership = allDealerships.find((d) => d._id === selectedId);
    setSelectedDealershipName(
      selectedDealership ? selectedDealership.name : ""
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedDealershipId) {
      toast.error("Please select a dealership.");
      setIsLoading(false);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("dealership", selectedDealershipId);

    if (formData.thumbnailFile) {
      data.append("thumbnail", formData.thumbnailFile);
    } else if (formData.thumbnailUrl) {
      data.append("thumbnail", formData.thumbnailUrl);
    } else {
      data.append("thumbnail", "");
    }

    // Handle video
    if (formData.video) {
      data.append("video", formData.video);
    } else if (formData.videoUrl) {
      data.append("video", formData.videoUrl);
    } else {
      data.append("video", "");
    }

    try {
      if (editingSpecial) {
        await axios.put(
          `${API_BASE_URL}weekly-specials/${editingSpecial._id}`,
          data
        );
        toast.success("Special updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}weekly-specials`, data);
        toast.success("Special added successfully!");
      }
      setIsModalOpen(false);
      fetchSpecials();
    } catch (err) {
      console.error("Error submitting special:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to save special. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Delete Handlers ---

  const handleDelete = (id) => {
    setSpecialToDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setError(null);
    setShowDeleteModal(false);

    try {
      await axios.delete(`${API_BASE_URL}weekly-specials/${specialToDeleteId}`);
      toast.success("Special deleted successfully!");
      fetchSpecials();
    } catch (err) {
      console.error("Error deleting special:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete special.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setSpecialToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSpecialToDeleteId(null);
  };

  return (
    <Layout title="Weekly Specials">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Weekly Specials
            </h2>
            <p className="text-gray-600">
              Manage weekly promotional videos and offers
            </p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Special
          </button>
        </div>

        {isLoading && <Loader className="animate-spin w-10 mx-auto" />}
        {error && <div className="text-center text-red-600">{error}</div>}

        {!isLoading && !error && (
          <Table
            columns={columns}
            data={specials}
            searchPlaceholder="Search specials..."
          />
        )}

        {/* Add/Edit Special Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSpecial ? "Edit Weekly Special" : "Add Weekly Special"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Dealership Select Dropdown */}
            <div>
              <label className="form-label">Dealership</label>
              <select
                name="dealershipId" // Changed name to reflect sending ID
                value={selectedDealershipId}
                onChange={handleDealershipSelectChange}
                className="form-input"
                required
                disabled={!allDealerships?.length && !isLoading} // Disable if no dealerships loaded
              >
                <option value="">-- Select a Dealership --</option>
                {allDealerships?.map((dealership) => (
                  <option key={dealership._id} value={dealership._id}>
                    {dealership.name}
                  </option>
                ))}
              </select>
              {!allDealerships?.length && isLoading && (
                <p className="text-sm text-gray-500 mt-1">
                  Loading dealerships...
                </p>
              )}
              {!allDealerships?.length && !isLoading && (
                <p className="text-sm text-red-500 mt-1">
                  No dealerships available. Please add some first.
                </p>
              )}
            </div>

            {/* Thumbnail Input */}
            <div>
              <label className="form-label">Thumbnail Image</label>
              <input
                type="file"
                name="thumbnailFile"
                accept="image/*"
                onChange={handleChange}
                className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {(formData.thumbnailFile || formData.thumbnailUrl) && (
                <div className="mt-2 w-24 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={
                      formData.thumbnailFile
                        ? URL.createObjectURL(formData.thumbnailFile)
                        : formData.thumbnailUrl
                    }
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {editingSpecial &&
                formData.thumbnailUrl &&
                !formData.thumbnailFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current:{" "}
                    <a
                      href={formData.thumbnailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Image
                    </a>{" "}
                    (Select new file to change)
                  </p>
                )}
            </div>

            {/* Video Input */}
            <div>
              <label className="form-label">Video Media</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleChange}
                className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {(formData.video || formData.videoUrl) && (
                <div className="mt-2 w-32 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  <video
                    src={
                      formData.video
                        ? URL.createObjectURL(formData.video)
                        : formData.videoUrl
                    }
                    controls
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              {editingSpecial && formData.videoUrl && !formData.video && (
                <p className="text-sm text-gray-500 mt-1">
                  Current:{" "}
                  <a
                    href={formData.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Video
                  </a>{" "}
                  (Select new file to change)
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="form-input"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              {isLoading ? (
                <button type="submit" className="btn-primary">
                  <Loader className="animate-spin w-10 mx-auto" />
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  {editingSpecial ? "Update" : "Add"} Special
                </button>
              )}
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!showDeleteModal}
          onClose={handleCancelDelete}
          title="Confirm Deletion"
          size="sm"
        >
          {showDeleteModal && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                  color: "#333",
                }}
              >
                You are about to permanently delete this weekly special. This
                action cannot be undone. Are you absolutely sure you want to
                proceed?
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  style={{
                    padding: "10px 25px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s, border-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e0e0e0")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                  }
                >
                  Cancel
                </button>

                {isLoading ? (
                  <Loader className="animate-spin w-10 mx-auto" />
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    style={{
                      padding: "10px 25px",
                      borderRadius: "5px",
                      border: "none",
                      backgroundColor: "#dc3545",
                      color: "white",
                      fontSize: "1rem",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#c82333")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dc3545")
                    }
                  >
                    Delete Permanently
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default WeeklySpecials;
