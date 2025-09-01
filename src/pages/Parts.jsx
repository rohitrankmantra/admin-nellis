import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import { Eye, CheckCircle, XCircle, Clock, Loader } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

// Define your API base URL for parts
const API_BASE_URL = import.meta.env.VITE_API_URL;

const Parts = () => {
  const [partsRequests, setPartsRequests] = useState([]); // Renamed from 'bookings'
  const [viewingRequest, setViewingRequest] = useState(null); // Renamed from 'viewingBooking'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [limit, setLimit] = useState(10); // Items per page

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800", // Use lowercase as per backend enum
    confirmed: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  // Function to fetch parts requests
  const fetchPartsRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}parts?page=${currentPage}&limit=${limit}&sort=-createdAt`
      );
      const { data, pagination } = response.data;

      // Map backend data fields to match frontend expectations
      const formattedRequests = data.map((request) => ({
        id: request._id, // Use _id from backend as 'id'
        customerName: request.name,
        email: request.email,
        phone: request.phone,
        vehicle: `${request.vehicleYear} ${request.make} ${request.model}`,
        VIN: request.VIN,
        partsNeeded: request.partsNeeded.join(", "), // Join array into a string
        preferredPickup: request.preferredPickup,
        status: request.status,
      }));

      setPartsRequests(formattedRequests);
      setTotalPages(pagination.totalPages);
      setTotalResults(pagination.totalResults);
    } catch (err) {
      console.error(
        "Error fetching parts requests:",
        err.response?.data || err.message
      );
      setError("Failed to fetch parts requests. Please try again.");
      toast.error(
        err.response?.data?.message || "Failed to load parts requests."
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchPartsRequests();
  }, [fetchPartsRequests]);

  // Columns for the Table component
  const columns = [
    {
      header: "Customer",
      accessor: "customerName",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      ),
    },
    {
      header: "Vehicle",
      accessor: "vehicle",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.vehicle}</div>
          <div className="text-sm text-gray-500">VIN: {row.VIN}</div>
        </div>
      ),
    },
    {
      header: "Parts Needed",
      accessor: "partsNeeded",
      cell: (row) => (
        <div className="text-sm text-gray-900">{row.partsNeeded}</div>
      ),
    },
    {
      header: "Preferred Pickup",
      accessor: "preferredPickup",
      cell: (row) => new Date(row.preferredPickup).toLocaleDateString(),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            statusColors[row.status]
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingRequest(row)} // Use setViewingRequest
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={() => updateStatus(row.id, "confirmed")}
                className="text-green-600 hover:text-green-900"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateStatus(row.id, "cancelled")}
                className="text-red-600 hover:text-red-900"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {row.status === "confirmed" && (
            <button
              onClick={() => updateStatus(row.id, "completed")}
              className="text-blue-600 hover:text-blue-900"
              title="Mark Complete"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Function to update status via API
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}parts/status/${id}`, {
        status: newStatus,
      });

      if (response.status === 200) {
        toast.success(`Parts request status updated to ${newStatus}!`);
        fetchPartsRequests(); // Re-fetch to ensure UI consistency
      }
    } catch (err) {
      console.error(
        `Error updating status for ${id} to ${newStatus}:`,
        err.response?.data || err.message
      );
      toast.error(
        err.response?.data?.message ||
          `Failed to update status to ${newStatus}.`
      );
    }
  };

  // Handlers for pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout title="Parts Order Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Parts Requests</h2>
            <p className="text-gray-600">
              Manage customer requests for vehicle parts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {partsRequests.filter((b) => b.status === "pending").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Confirmed
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {
                      partsRequests.filter((b) => b.status === "confirmed")
                        .length
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {
                      partsRequests.filter((b) => b.status === "completed")
                        .length
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cancelled
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {
                      partsRequests.filter((b) => b.status === "cancelled")
                        .length
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <p className="ml-3 text-gray-700">Loading parts requests...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={partsRequests}
              searchPlaceholder="Search parts requests..."
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalResults={totalResults}
            />
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 mx-1 rounded-md ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* View Modal */}
        <Modal
          isOpen={!!viewingRequest} // Use viewingRequest
          onClose={() => setViewingRequest(null)} // Use setViewingRequest
          title="Parts Request Details"
          size="lg"
        >
          {viewingRequest && ( // Use viewingRequest
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Name
                      </span>
                      <p>{viewingRequest.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Email
                      </span>
                      <p>{viewingRequest.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Phone
                      </span>
                      <p>{viewingRequest.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Pickup Option
                      </span>
                      <p>{viewingRequest.preferredPickupOption}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Parts Request Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Vehicle
                      </span>
                      <p>{viewingRequest.vehicle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        VIN
                      </span>
                      <p>{viewingRequest.VIN}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Parts Needed
                      </span>
                      <p>{viewingRequest.partsNeeded}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Preferred Pickup Date
                      </span>
                      <p>
                        {new Date(
                          viewingRequest.preferredPickup
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Status
                      </span>
                      <p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColors[viewingRequest.status]
                          }`}
                        >
                          {viewingRequest.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* No 'additionalNotes' or 'notes' in your Parts API response, so removing this section. 
                  If you need it, ensure it's added to your backend response.
              {viewingRequest.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {viewingRequest.notes}
                  </p>
                </div>
              )} */}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                {viewingRequest.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(viewingRequest.id, "confirmed");
                        setViewingRequest(null);
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Confirm Request
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(viewingRequest.id, "cancelled");
                        setViewingRequest(null);
                      }}
                      className="btn-danger bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
                {viewingRequest.status === "confirmed" && (
                  <button
                    onClick={() => {
                      updateStatus(viewingRequest.id, "completed");
                      setViewingRequest(null);
                    }}
                    className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Mark as Completed
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

export default Parts;
