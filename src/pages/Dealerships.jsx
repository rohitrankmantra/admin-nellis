import { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;
console.log("api url", apiUrl); // This should now log your URL

const Dealerships = () => {
  const [dealerships, setDealerships] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealership, setEditingDealership] = useState(null);
  const [viewingDealership, setViewingDealership] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    logo: null,
    coverImage: null,
    address: "",
    phone: "",
    email: "",
    website: "",
    services: "",
    specialties: "",
    hours: "",
    mapUrl: "",
    description: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModel, setShowDeleteModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchDealerships = useCallback(async () => {
    // toast.loading("Fetching dealerships...", { id: "fetchDealers" });
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}dealerships?page=${currentPage}&limit=${itemsPerPage}`
      );
      setDealerships(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
      // toast.success("Dealerships fetched successfully!", {
      //   id: "fetchDealers",
      // });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching dealerships:", error);
      toast.error("Failed to fetch dealerships.");
      setDealerships([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchDealerships();
  }, [fetchDealerships]);

  const columns = [
    {
      header: "Dealership",
      accessor: "name",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row.logo && (
            <img
              src={row.logo}
              alt={row.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.address}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "phone",
      cell: (row) => (
        <div className="text-sm">
          <div className="flex items-center text-gray-900">
            <Phone className="w-3 h-3 mr-1" />
            {row.phone}
          </div>
          <div className="flex items-center text-gray-500">
            <Mail className="w-3 h-3 mr-1" />
            {row.email}
          </div>
        </div>
      ),
    },
    {
      header: "Services",
      accessor: "services",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(row.services) &&
            row.services.slice(0, 2).map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {service}
              </span>
            ))}
          {Array.isArray(row.services) && row.services.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{row.services.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingDealership(row)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Edit Dealership"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setShowDeleteModel(true);

              setDeleteId(row._id);
            }}
            className="text-red-600 hover:text-red-900"
            title="Delete Dealership"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingDealership(null);
    setFormData({
      name: "",
      logo: null,
      coverImage: null,
      address: "",
      phone: "",
      email: "",
      website: "",
      services: "",
      specialties: "",
      hours: "",
      mapUrl: "",
      description: "",
    });
    setLogoPreview("");
    setCoverImagePreview("");
    setIsModalOpen(true);
  };

  const handleEdit = (dealership) => {
    setEditingDealership(dealership);
    setFormData({
      name: dealership.name,
      logo: dealership.logo || null,
      coverImage: dealership.coverImage || null,
      address: dealership.address,
      phone: dealership.phone,
      email: dealership.email,
      website: dealership.website || "",
      services: dealership.services,
      specialties: dealership.specialties,
      hours: dealership.hours,
      mapUrl: dealership.mapUrl || "",
      description: dealership.description || "",
    });
    setLogoPreview(dealership.logo || "");
    setCoverImagePreview(dealership.coverImage || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (id) {
      toast.loading("Deleting dealership...", { id: "deleteDealer" });
      try {
        await axios.delete(`${apiUrl}dealerships/${id}`);
        toast.success("Dealership deleted successfully!", {
          id: "deleteDealer",
        });
        fetchDealerships();
      } catch (error) {
        console.error("Error deleting dealership:", error);
        toast.error("Failed to delete dealership.", { id: "deleteDealer" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();

    dataToSend.append("name", formData.name);
    dataToSend.append("address", formData.address);
    dataToSend.append("phone", formData.phone);
    dataToSend.append("email", formData.email);
    dataToSend.append("website", formData.website);
    dataToSend.append("hours", formData.hours);
    dataToSend.append("mapUrl", formData.mapUrl);
    dataToSend.append("description", formData.description);
    dataToSend.append("services", formData.services);
    dataToSend.append("specialties", formData.specialties);

    if (formData.logo instanceof File) {
      dataToSend.append("logo", formData.logo);
    } else if (formData.logo === null && editingDealership?.logo) {
      dataToSend.append("logo", "");
    } else if (typeof formData.logo === "string") {
      dataToSend.append("logo", formData.logo);
    }

    if (formData.coverImage instanceof File) {
      dataToSend.append("coverImage", formData.coverImage);
    } else if (formData.coverImage === null && editingDealership?.coverImage) {
      dataToSend.append("coverImage", "");
    } else if (typeof formData.coverImage === "string") {
      dataToSend.append("coverImage", formData.coverImage);
    }

    toast.loading(
      editingDealership ? "Updating dealership..." : "Adding dealership...",
      { id: "submitDealer" }
    );

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingDealership) {
        await axios.put(
          `${apiUrl}dealerships/${editingDealership._id}`,
          dataToSend,
          config
        );
        toast.success("Dealership updated successfully!", {
          id: "submitDealer",
        });
      } else {
        await axios.post(
          `${apiUrl}dealerships`,
          dataToSend,
          config
        );
        toast.success("Dealership added successfully!", { id: "submitDealer" });
      }
      setIsModalOpen(false);
      fetchDealerships();
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage, { id: "submitDealer" });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Set the file object to formData
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      // Create a URL for preview
      const previewUrl = URL.createObjectURL(file);
      if (fieldName === "logo") {
        setLogoPreview(previewUrl);
      } else if (fieldName === "coverImage") {
        setCoverImagePreview(previewUrl);
      }
    } else {
      // If file input is cleared, set formData field to null and clear preview
      setFormData((prev) => ({ ...prev, [fieldName]: null }));
      if (fieldName === "logo") {
        setLogoPreview("");
      } else if (fieldName === "coverImage") {
        setCoverImagePreview("");
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout title="Dealerships">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dealerships</h2>
            <p className="text-gray-600">
              Manage dealership directory on Nellis Boulevard
            </p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Dealership
          </button>
        </div>

        {loading ? (
          <Loader className=" w-10 mx-auto animate-spin" />
        ) : (
          <Table
            columns={columns}
            data={dealerships}
            searchPlaceholder="Search dealerships..."
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-secondary px-3 py-1 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-secondary px-3 py-1 flex items-center"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDealership ? "Edit Dealership" : "Add Dealership"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              {/* Logo Upload Input */}
              <div>
                <label className="form-label">Logo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                    className="hidden"
                  />
                  <label
                    htmlFor="logoUpload"
                    className="btn-secondary flex items-center px-3 py-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 mr-2" /> Browse Logo
                  </label>
                  {/* Logo Preview */}
                  {(logoPreview ||
                    (formData.logo && typeof formData.logo === "string")) && (
                    <div className="relative w-16 h-16 border rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={logoPreview || formData.logo}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cover Image Upload Input */}
            <div>
              <label className="form-label">Cover Image</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="coverImageUpload"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "coverImage")}
                  className="hidden"
                />
                <label
                  htmlFor="coverImageUpload"
                  className="btn-secondary flex items-center px-3 py-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> Browse Cover Image
                </label>
                {/* Cover Image Preview */}
                {(coverImagePreview ||
                  (formData.coverImage &&
                    typeof formData.coverImage === "string")) && (
                  <div className="relative w-32 h-20 border rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={coverImagePreview || formData.coverImage}
                      alt="Cover Image Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="form-label">Services (comma-separated)</label>
              <input
                type="text"
                name="services"
                value={formData.services}
                onChange={handleChange}
                className="form-input"
                placeholder="New Cars, Used Cars, Service, Parts"
                required
              />
            </div>

            <div>
              <label className="form-label">Hours</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                className="form-input"
                placeholder="Mon-Sat: 9AM-9PM, Sun: 10AM-7PM"
                required
              />
            </div>
            <div>
              <label className="form-label">
                Specialties (comma-separated)
              </label>
              <input
                type="text"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                className="form-input"
                placeholder="Luxury Vehicles, Electric Cars, Classic Cars"
              />
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="Provide a detailed description of the dealership, its history, and unique offerings."
              ></textarea>
            </div>

            <div>
              <label className="form-label">Map URL</label>
              <input
                type="url"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleChange}
                className="form-input"
                placeholder="https://maps.google.com/..."
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
              <button type="submit" className="btn-primary">
                {editingDealership ? "Update" : "Add"} Dealership
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={!!viewingDealership}
          onClose={() => setViewingDealership(null)}
          title="Dealership Details"
          size="lg"
        >
          {viewingDealership && (
            <div className="space-y-6">
              {viewingDealership.coverImage && (
                <div className="mb-4">
                  <img
                    src={viewingDealership.coverImage}
                    alt={`${viewingDealership.name} Cover`}
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="flex items-center space-x-4">
                {viewingDealership.logo && (
                  <img
                    src={viewingDealership.logo}
                    alt={viewingDealership.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {viewingDealership.name}
                  </h3>
                  <p className="text-gray-600">{viewingDealership.address}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{viewingDealership.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{viewingDealership.email}</span>
                  </div>
                  {viewingDealership.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={viewingDealership.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  {viewingDealership.mapUrl && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <a
                        href={viewingDealership.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View on Map
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Business Hours
                  </h4>
                  <p className="text-gray-600">{viewingDealership.hours}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(viewingDealership.services) &&
                    viewingDealership.services.map((service, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {service}
                      </span>
                    ))}
                </div>
              </div>

              {viewingDealership.specialties &&
                Array.isArray(viewingDealership.specialties) &&
                viewingDealership.specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Specialties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingDealership.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingDealership.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 whitespace-pre-line">
                    {viewingDealership.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
        <Modal
          isOpen={!!showDeleteModel}
          onClose={() => setShowDeleteModel(false)}
          title="Confirm Deletion" // Changed title to be more direct
          size="lg" // Adjust size as needed, "md" or "sm" might be better for confirmation
        >
          {showDeleteModel && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              {/* Modern and clear message */}
              <p
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "25px",
                  color: "#333",
                }}
              >
                You are about to permanently delete this item. This action
                cannot be undone. Are you absolutely sure you want to proceed?
              </p>

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "15px",
                }}
              >
                {/* Cancel Button */}
                <button
                  onClick={() => setShowDeleteModel(false)}
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

                {/* Confirm Delete Button */}
                <button
                  onClick={() => {
                    handleDelete(deleteId);
                    setShowDeleteModel(false);
                  }}
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
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default Dealerships;
