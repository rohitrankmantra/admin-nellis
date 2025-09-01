import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Globe,
  Loader,
} from "lucide-react"; // Added Loader icon
import toast from "react-hot-toast";
import axios from "axios"; // Import axios

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AutoBusinesses = () => {
  const [businesses, setBusinesses] = useState([]); // Initialize as empty, will be fetched
  const [loading, setLoading] = useState(true); // Initial loading state for fetching data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [viewingBusiness, setViewingBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    hours: "", // This will map to 'hoursServices' in the backend
    services: "", // This will be a comma-separated string for input, then converted to array
  });

  const businessTypes = [
    "Service Center", // Updated based on schema enum
    "Repair Shop", // Updated based on schema enum
    "Detailing", // Updated based on schema enum
    "Car Wash",
    "Parts Store",
    "Oil Change",
    "Tire Shop",
    "Body Shop",
    "Towing Service",
    "Insurance",
    "Financing",
    "Other",
  ];

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}businesses`);
      setBusinesses(response.data.data); // Assuming API returns { data: [...] }
     
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast.error("Failed to load businesses.");
      setBusinesses([]); // Clear businesses on error
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch businesses on component mount
  useEffect(() => {
    fetchBusinesses();
  }, []); // Empty dependency array means this runs once on mount

  // --- CRUD Operations ---

  const handleAdd = () => {
    setEditingBusiness(null);
    setFormData({
      name: "",
      type: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      hours: "",
      services: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      type: business.type,
      address: business.address,
      phone: business.phone,
      email: business.email,
      description: business.description,
      website: business.website || "", // Handle potential null/undefined website
      hours: business.hoursServices ? business.hoursServices.join(", ") : "", // Map hoursServices array to string
      services: business.services ? business.services.join(", ") : "", // Map services array to string
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      // Optimistic UI update (optional, but good for responsiveness)
      const originalBusinesses = businesses;
      setBusinesses(businesses.filter((business) => business._id !== id)); // Use _id from MongoDB

      try {
        await axios.delete(`${API_BASE_URL}businesses/${id}`);
        toast.success("Business deleted successfully!");
      } catch (error) {
        console.error("Error deleting business:", error);
        toast.error("Failed to delete business.");
        setBusinesses(originalBusinesses); // Revert on error
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const businessData = {
      name: formData.name,
      type: formData.type,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      description: formData.description,
      website: formData.website,
      // Convert comma-separated string to array for backend
      hoursServices: formData.hours
        .split(",")
        .map((h) => h.trim())
        .filter((h) => h),
      services: formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    try {
      if (editingBusiness) {
        // Update existing business
        const response = await axios.put(
          `${API_BASE_URL}businesses/${editingBusiness._id}`,
          businessData
        );
        setBusinesses(
          businesses.map(
            (business) =>
              business._id === editingBusiness._id
                ? response.data.data
                : business // Update with server response
          )
        );
        toast.success("Business updated successfully!");
      } else {
        // Add new business
        const response = await axios.post(
          `${API_BASE_URL}businesses`,
          businessData
        );
        setBusinesses([...businesses, response.data.data]); // Add new business from server response
        toast.success("Business added successfully!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(
        "Error submitting business:",
        error.response ? error.response.data : error.message
      );
      // Display specific error message from backend if available
      toast.error(
        error.response?.data?.message ||
          "Failed to save business. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- Table Column Definitions ---

  const columns = [
    {
      header: "Business",
      accessor: "name",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.address}</div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {row.type}
        </span>
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
      accessor: "services", // Note: This will now be `row.services` directly from DB
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.services &&
            row.services.slice(0, 2).map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {service}
              </span>
            ))}
          {row.services && row.services.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{row.services.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "_id", // Use _id for MongoDB documents
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingBusiness(row)}
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
            onClick={() => handleDelete(row._id)} // Pass _id for deletion
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout title="Auto Businesses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Auto Businesses
            </h2>
            <p className="text-gray-600">
              Directory of automotive businesses on Nellis Boulevard
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center"
            disabled={loading} // Disable add button while initial data is loading
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Business
          </button>
        </div>

        {/* Display loading, no data, or table */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-10  animate-spin" />
          </div>
        ) : businesses.length > 0 ? (
          <Table
            columns={columns}
            data={businesses}
            searchPlaceholder="Search businesses..."
          />
        ) : (
          <div className="flex justify-center items-center h-48">
            <h1 className="text-center font-semibold text-gray-700">
              No data available. Add new Business +{" "}
            </h1>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBusiness ? "Edit Auto Business" : "Add Auto Business"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select type</option>
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
            <div>
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                value={formData.description}
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
              <label className="form-label">Hours (comma-separated)</label>
              <input
                type="text"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                className="form-input"
                placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-5PM"
                required
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
                placeholder="Oil Change, Brake Service, Tire Installation"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
                disabled={isSubmitting} // Disable cancel button during submission
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : editingBusiness ? (
                  "Update"
                ) : (
                  "Add"
                )}{" "}
                Business
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={!!viewingBusiness}
          onClose={() => setViewingBusiness(null)}
          title="Business Details"
          size="lg"
        >
          {viewingBusiness && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {viewingBusiness.name}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {viewingBusiness.type}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Address
                  </span>
                  <p className="text-gray-900">{viewingBusiness.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{viewingBusiness.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{viewingBusiness.email}</span>
                    </div>
                    {viewingBusiness.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={viewingBusiness.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Business Hours
                    </h4>
                    {/* Display hoursServices from backend which is an array */}
                    <div className="text-gray-600">
                      {viewingBusiness.hoursServices &&
                        viewingBusiness.hoursServices.map((hour, index) => (
                          <p key={index}>{hour}</p>
                        ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingBusiness.services &&
                      viewingBusiness.services.map((service, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {service}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default AutoBusinesses;
