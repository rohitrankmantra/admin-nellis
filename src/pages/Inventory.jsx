import { useState, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { Plus, Edit, Trash2, Eye, Loader2, XCircle, Loader } from "lucide-react"; // Added XCircle for image removal
import toast from "react-hot-toast";
import axios from "axios";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);
  const [dealerships, setDealerships] = useState([]);
  const [loading, setLoading] = useState(false); // For general loading
  const [submitLoading, setSubmitLoading] = useState(false); // For form submission
  const [deleteLoadingId, setDeleteLoadingId] = useState(null); // For individual delete loading
  const [videoPreview, setVideoPreview] = useState(""); // State for video preview URL
  const fileInputRef = useRef(null); // Ref for triggering hidden file input

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    dealership: "", // Changed from 'dealer' to 'dealership' to match backend
    exteriorColor: "",
    interiorColor: "",
    condition: "",
    transmission: "",
    fuelType: "",
    bodyType: "",
    engineSize: "",
    driveTrain: "",
    numDoors: "",
    seatingCapacity: "",
    VIN: "",
    features: "", // Can be comma-separated string for input
    images: [], // Will hold File objects for upload
    video: null, // Will hold the File object for video upload
    videoUrl: "", // For displaying existing video URL from backend
    description: "",
    isFeatured: false,
    status: "Available",
  });
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}vehicles`);
      setInventory(response.data.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    const fetchDealerships = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}dealerships`);
        setDealerships(response.data.data); // Adjust based on your API response structure
      } catch (error) {
        console.error("Error fetching dealerships:", error);
        toast.error("Failed to fetch dealerships.");
      }
    };
    fetchDealerships();
  }, []);

  // Cleanup for video preview URL
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const columns = [
    {
      header: "Image",
      accessor: "images",
      cell: (row) => (
        <div>
          {row.images && row.images.length > 0 ? (
            <img
              src={row.images[0] || "/placeholder.png"}
              alt={`${row.year} ${row.brand} ${row.model}`}
              className="w-16 h-12 object-cover rounded"
              onError={(e) => (e.target.src = "/placeholder.png")}
            />
          ) : (
            <img
              src="/placeholder.png"
              alt="No Image"
              className="w-16 h-12 object-cover rounded"
            />
          )}
        </div>
      ),
    },
    {
      header: "Vehicle",
      accessor: "brand",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.year} {row.brand} {row.model}
          </div>
          <div className="text-sm text-gray-500">{row.condition}</div>
        </div>
      ),
    },
    {
      header: "Mileage",
      accessor: "mileage",
      cell: (row) => `${row.mileage?.toLocaleString() || "N/A"} mi`,
    },
    {
      header: "Price",
      accessor: "price",
      cell: (row) => (
        <span className="font-medium text-green-600">
          ${row.price?.toLocaleString() || "N/A"}
        </span>
      ),
    },
    {
      header: "Dealer",
      accessor: "dealership",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.dealership?.name || "N/A"}
        </span>
      ),
    },
    {
      header: "Transmission",
      accessor: "transmission",
      cell: (row) => row.transmission || "N/A",
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingVehicle(row)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-900"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className={`text-red-600 hover:text-red-900 ${
              deleteLoadingId === row._id ? "cursor-not-allowed" : ""
            }`}
            disabled={deleteLoadingId === row._id}
          >
            {deleteLoadingId === row._id ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      brand: "",
      model: "",
      year: "",
      mileage: "",
      price: "",
      dealership: "",
      exteriorColor: "",
      interiorColor: "",
      condition: "",
      transmission: "",
      fuelType: "",
      bodyType: "",
      engineSize: "",
      driveTrain: "",
      numDoors: "",
      seatingCapacity: "",
      VIN: "",
      features: "",
      images: [],
      video: null,
      videoUrl: "",
      description: "",
      isFeatured: false,
      status: "Available",
    });
    setVideoPreview(""); // Clear video preview
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year?.toString() || "",
      mileage: vehicle.mileage?.toString() || "",
      price: vehicle.price?.toString() || "",
      dealership: vehicle.dealership?._id || "",
      exteriorColor: vehicle.exteriorColor || "",
      interiorColor: vehicle.interiorColor || "",
      condition: vehicle.condition || "",
      transmission: vehicle.transmission || "",
      fuelType: vehicle.fuelType || "",
      bodyType: vehicle.bodyType || "",
      engineSize: vehicle.engineSize || "",
      driveTrain: vehicle.driveTrain || "",
      numDoors: vehicle.numDoors?.toString() || "",
      seatingCapacity: vehicle.seatingCapacity?.toString() || "",
      VIN: vehicle.VIN || "",
      features: Array.isArray(vehicle.features)
        ? vehicle.features.join(", ")
        : vehicle.features || "",
      images: [], // Reset images for new upload, but keep existing for display (handled separately below)
      video: null, // Reset video for new upload
      videoUrl: vehicle.video || "", // Set existing video URL
      description: vehicle.description || "",
      isFeatured: vehicle.isFeatured || false,
      status: vehicle.status || "Available",
    });
    setVideoPreview(vehicle.video || ""); // Set video preview for existing video
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setDeleteLoadingId(id);
      try {
        await axios.delete(`${API_BASE_URL}vehicles/${id}`);
        setInventory(inventory.filter((vehicle) => vehicle._id !== id));
        toast.success("Vehicle deleted successfully");
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        toast.error("Failed to delete vehicle.");
      } finally {
        setDeleteLoadingId(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === "images") {
        formData.images.forEach((file) => formDataToSend.append("images", file));
      } else if (key === "features") {
        // Ensure features are sent as a comma-separated string
        formDataToSend.append("features", formData.features);
      } else if (key === "isFeatured") {
        formDataToSend.append("isFeatured", formData.isFeatured);
      } else if (key === "video" && formData.video) {
        formDataToSend.append("video", formData.video);
      } else if (key !== "videoUrl") {
        // Don't append videoUrl if a new video file is selected
        formDataToSend.append(key, formData[key]);
      }
    }

    // If editing and no new video is selected, but there was an existing videoUrl, send it.
    if (editingVehicle && !formData.video && formData.videoUrl) {
      formDataToSend.append("videoUrl", formData.videoUrl);
    }

    try {
      if (editingVehicle) {
        await axios.put(
          `${API_BASE_URL}vehicles/${editingVehicle._id}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Vehicle updated successfully");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}vehicles`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setInventory([...inventory, response.data.data]); // Update with the newly created item
        toast.success("Vehicle added successfully");
      }
      setIsModalOpen(false);
      fetchInventory(); // Reload inventory after add/edit
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        editingVehicle ? "Failed to update vehicle." : "Failed to add vehicle."
      );
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "images") {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }));
    } else if (name === "video") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, video: file, videoUrl: "" })); // Clear videoUrl if a new file is selected
      setVideoPreview(file ? URL.createObjectURL(file) : "");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleAddAnotherImage = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  return (
    <Layout title="Inventory Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Vehicle Inventory
            </h2>
            <p className="text-gray-600">
              Manage used car listings and inventory
            </p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="w-10 mx-auto animate-spin" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={inventory}
            searchPlaceholder="Search vehicles..."
          />
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
          size="xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Year</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="form-input"
                  min="1900"
                  max="2025"
                  required
                />
              </div>
              <div>
                <label className="form-label">Mileage (miles)</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="form-label">Dealership</label>
                <select
                  name="dealership"
                  value={formData.dealership}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select a dealership</option>
                  {dealerships.map((dealership) => (
                    <option key={dealership._id} value={dealership._id}>
                      {dealership.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Exterior Color</label>
                <input
                  type="text"
                  name="exteriorColor"
                  value={formData.exteriorColor}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Interior Color</label>
                <input
                  type="text"
                  name="interiorColor"
                  value={formData.interiorColor}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Certified Pre-Owned">
                    Certified Pre-Owned
                  </option>
                </select>
              </div>
              <div>
                <label className="form-label">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="AMT">AMT</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>
              <div>
                <label className="form-label">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                  <option value="LPG">LPG</option>
                </select>
              </div>
              <div>
                <label className="form-label">Body Type</label>
                <select
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select body type</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Convertible">Convertible</option>
                  <option value="Truck">Truck</option>
                  <option value="Minivan">Minivan</option>
                  <option value="Van">Van</option>
                  <option value="Wagon">Wagon</option>
                </select>
              </div>
              <div>
                <label className="form-label">Engine Size</label>
                <input
                  type="text"
                  name="engineSize"
                  value={formData.engineSize}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Drive Train</label>
                <select
                  name="driveTrain"
                  value={formData.driveTrain}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select drive train</option>
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4x4">4x4</option>
                </select>
              </div>
              <div>
                <label className="form-label">Number of Doors</label>
                <input
                  type="number"
                  name="numDoors"
                  value={formData.numDoors}
                  onChange={handleChange}
                  className="form-input"
                  min="2"
                  max="5"
                />
              </div>
              <div>
                <label className="form-label">Seating Capacity</label>
                <input
                  type="number"
                  name="seatingCapacity"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="form-input"
                  min="1"
                  max="9"
                />
              </div>
              <div>
                <label className="form-label">VIN (Optional)</label>
                <input
                  type="text"
                  name="VIN"
                  value={formData.VIN}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Features (comma-separated)</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              {/* Images Section */}
              <div className="col-span-full">
                <label className="form-label">Images</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  className="hidden" // Hide the original input
                  ref={fileInputRef} // Assign ref to trigger it
                  accept="image/*"
                />
                <button
                  type="button"
                  onClick={handleAddAnotherImage}
                  className="btn-secondary w-full py-2 px-4 rounded-md text-sm font-semibold border-2 border-dashed border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="inline w-4 h-4 mr-2" />
                  {formData.images.length > 0 ? "Add Another Image" : "Select Images"}
                </button>

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Selected ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {editingVehicle && editingVehicle.images && editingVehicle.images.length > 0 && (
                  <div className="mt-4">
                    <p className="form-label">Current Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {editingVehicle.images.map((imageSrc, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={imageSrc}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border"
                            onError={(e) => (e.target.src = "/placeholder.png")}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      (New images will replace or be added to existing ones upon update)
                    </p>
                  </div>
                )}
              </div>

              {/* Video Media Section */}
              <div className="col-span-full">
                <label className="form-label">Video Media</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                  className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {(videoPreview || (editingVehicle && editingVehicle.video)) && (
                  <div className="mt-2 w-32 h-24 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <video
                      src={videoPreview || (editingVehicle && editingVehicle.video)}
                      controls
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                {editingVehicle && editingVehicle.videoUrl && !formData.video && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current:{" "}
                    <a
                      href={editingVehicle.videoUrl}
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

              <div className="col-span-full">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="form-label">Featured</label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="form-checkbox"
                />
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                  <option value="Pending">Pending</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : editingVehicle ? (
                  "Update"
                ) : (
                  "Add"
                )}{" "}
                Vehicle
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={!!viewingVehicle}
          onClose={() => setViewingVehicle(null)}
          title="Vehicle Details"
          size="xl"
        >
          {viewingVehicle && (
            <div className="space-y-4">
              {viewingVehicle.images && viewingVehicle.images.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {viewingVehicle.images.map((imageSrc, index) => (
                    <img
                      key={index}
                      src={imageSrc || "/placeholder.png"}
                      alt={`${viewingVehicle.brand} ${viewingVehicle.model} - Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="detail-label">Vehicle:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.year} {viewingVehicle.brand}{" "}
                    {viewingVehicle.model}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Price:</span>{" "}
                  <p className="detail-value">
                    ${viewingVehicle.price?.toLocaleString() || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Mileage:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.mileage?.toLocaleString() || "N/A"} miles
                  </p>
                </div>
                <div>
                  <span className="detail-label">Condition:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.condition || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Transmission:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.transmission || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Fuel Type:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.fuelType || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Body Type:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.bodyType || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Engine Size:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.engineSize || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Drive Train:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.driveTrain || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Number of Doors:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.numDoors || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Seating Capacity:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.seatingCapacity || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">VIN:</span>{" "}
                  <p className="detail-value">{viewingVehicle.VIN || "N/A"}</p>
                </div>
                <div>
                  <span className="detail-label">Dealer:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.dealership?.name ||
                      viewingVehicle.dealership ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Featured:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.isFeatured ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <span className="detail-label">Status:</span>{" "}
                  <p className="detail-value">
                    {viewingVehicle.status || "N/A"}
                  </p>
                </div>
                {viewingVehicle.features &&
                  viewingVehicle.features.length > 0 && (
                    <div className="col-span-full">
                      <span className="detail-label">Features:</span>
                      <ul className="list-disc list-inside">
                        {viewingVehicle.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                {viewingVehicle.description && (
                  <div className="col-span-full">
                    <span className="detail-label">Description:</span>
                    <p className="detail-value">{viewingVehicle.description}</p>
                  </div>
                )}
                {viewingVehicle.video && (
                  <div className="col-span-full">
                    <span className="detail-label">Video:</span>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={viewingVehicle.video}
                        title="Vehicle Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Inventory;