import { useState, useEffect } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { Plus, Edit, Trash2, Eye, Loader } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const [dealerships, setDealerships] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag: "",
    offer: "", // New field for offer text
    dealership: "",
    image: null,
    validUntil: "",
    termsConditions: "",
  });

  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    fetchOffers();
    fetchDealerships();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}special-offers`);
      setOffers(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching special offers:", error);
      toast.error("Failed to load special offers.");
    }
  };

  const fetchDealerships = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}dealerships/searchIdName`
      );
      setDealerships(response.data.data);
    } catch (error) {
      console.error("Error fetching dealerships:", error);
      toast.error("Failed to load dealerships for selection.");
    }
  };

  const columns = [
    {
      header: "Offer",
      accessor: "title",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      ),
    },
    {
      header: "Dealership",
      accessor: "dealership",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.dealership?.name || row.dealership || "N/A"}
        </span>
      ),
    },
    {
      header: "Valid Until",
      accessor: "validUntil",
      cell: (row) => new Date(row.validUntil).toLocaleDateString(),
    },
    {
      header: "Status",
      accessor: "validUntil",
      cell: (row) => {
        const isActive = new Date(row.validUntil) > new Date();
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Expired"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "_id",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingOffer(row)}
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
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingOffer(null);
    setFormData({
      title: "",
      description: "",
      tag: "",
      offer: "", // Initialize new offer field
      dealership: "",
      image: null,
      validUntil: "",
      termsConditions: "",
    });
    setCurrentImageUrl("");
    setIsModalOpen(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      tag: offer.tag || "",
      offer: offer.offer || "", // Populate new offer field
      dealership: offer.dealership?._id || "",
      image: null,
      validUntil: offer.validUntil
        ? new Date(offer.validUntil).toISOString().split("T")[0]
        : "",
      termsConditions: offer.termsConditions || "",
    });
    setCurrentImageUrl(offer.image || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await axios.delete(`${API_BASE_URL}special-offers/${id}`);
        toast.success("Offer deleted successfully!");
        fetchOffers();
      } catch (error) {
        console.error("Error deleting offer:", error);
        toast.error("Failed to delete offer. Please try again.");
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setSubmitLoading(true);

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === "image" && formData.image) {
        formDataToSend.append("image", formData.image);
      } else if (key === "dealership") {
        formDataToSend.append("dealership", formData.dealership);
      } else if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      if (editingOffer) {
        await axios.put(
          `${API_BASE_URL}special-offers/${editingOffer._id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setLoading(false);
        toast.success("Offer updated successfully!");
      } else {
        await axios.post(`${API_BASE_URL}special-offers`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setLoading(false);
        toast.success("Offer added successfully!");
      }
      setIsModalOpen(false);
      fetchOffers();
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      toast.error(
        editingOffer
          ? "Failed to update offer. Please try again."
          : "Failed to add offer. Please try again."
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
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0] || null,
      });
      if (files[0]) {
        setCurrentImageUrl(URL.createObjectURL(files[0]));
      } else {
        setCurrentImageUrl("");
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  return (
    <Layout title="Special Offers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Special Offers</h2>
            <p className="text-gray-600">Manage promotional offers and deals</p>
          </div>
          <button onClick={handleAdd} className="btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Offer
          </button>
        </div>
{console.log(offers)}
        {loading ? (
          // Show a loader when data is being fetched
          <div className="flex justify-center items-center h-48">
            <Loader className="w-10 animate-spin" />
          </div>
        ) : offers && offers.length > 0 ? (
        
          // If loading is complete and offers array has data, display the table
          <Table
            columns={columns}
            data={offers}
            searchPlaceholder="Search offers..."
          />
        ) : (
          // If loading is complete and there's no data, show the "no data" message
          <div className="flex justify-center items-center h-48">
            <h1 className="text-center font-semibold text-gray-700">
              No data available. Add new Offer +{" "}
            </h1>
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingOffer ? "Edit Special Offer" : "Add Special Offer"}
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

            <div>
              <label className="form-label">Tag</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Summer Sale, Limited Time"
              />
            </div>

            {/* New "Offer" input field */}
            <div>
              <label className="form-label">Offer Text</label>
              <input
                type="text"
                name="offer"
                value={formData.offer}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 20% Off All Sedans"
                required
              />
            </div>

            {/* Dealership Dropdown */}
            <div>
              <label className="form-label">Dealership</label>
              <select
                name="dealership"
                value={formData.dealership}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select a Dealership</option>
                {dealerships?.map((dealership) => (
                  <option key={dealership._id} value={dealership._id}>
                    {dealership.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Offer Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="form-input block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {currentImageUrl && (
                <div className="mt-2">
                  <img
                    src={currentImageUrl}
                    alt="Current Offer"
                    className="w-32 h-32 object-cover rounded-md border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Current/New Image Preview
                  </p>
                </div>
              )}
              {editingOffer && !formData.image && currentImageUrl && (
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep current image.
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Valid Until</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Terms & Conditions</label>
              <textarea
                name="termsConditions"
                value={formData.termsConditions}
                onChange={handleChange}
                rows={3}
                className="form-input"
                placeholder="Terms and conditions for this offer..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={submitLoading}
              >
                {submitLoading
                  ? editingOffer
                    ? "Updating..."
                    : (<Loader className="w-6 animate-spin"/>)
                  : editingOffer
                  ? "Update"
                  : "Add"}{" "}
                Offer
              </button>
            </div>
          </form>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={!!viewingOffer}
          onClose={() => setViewingOffer(null)}
          title="Offer Details"
          size="lg"
        >
          {viewingOffer && (
            <div className="space-y-4">
              {viewingOffer.image && (
                <div className="mb-4">
                  <img
                    src={viewingOffer.image}
                    alt={viewingOffer.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {viewingOffer.title}
                </h3>
                {viewingOffer.tag && (
                  <p className="text-sm font-medium text-blue-600 mb-2">
                    {viewingOffer.tag}
                  </p>
                )}
                {viewingOffer.offer && ( // Display the new "offer" field
                  <p className="text-sm text-gray-700 mb-2">
                    **Offer:** {viewingOffer.offer}
                  </p>
                )}
                <p className="text-gray-600 mb-4">{viewingOffer.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Dealership
                  </span>
                  <p>
                    {viewingOffer.dealership?.name || viewingOffer.dealership}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Valid Until
                  </span>
                  <p>
                    {new Date(viewingOffer.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {viewingOffer.termsConditions && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Terms & Conditions
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {viewingOffer.termsConditions}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default SpecialOffers;



// Demo Credentials:
// Email: admin@nellisauto.com
// Password: password123