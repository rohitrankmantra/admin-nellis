import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Eye, CheckCircle, XCircle, Clock, Loader } from 'lucide-react'; // Added Loader
import toast from 'react-hot-toast';
import axios from 'axios';

// Define your API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ServiceParts = () => {
  const [serviceBookings, setServiceBookings] = useState([]); // Renamed from 'bookings' for clarity
  const [viewingBooking, setViewingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [limit, setLimit] = useState(10); // Items per page

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800', // Use lowercase as per backend enum
    'confirmed': 'bg-green-100 text-green-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800'
  };

  // Function to fetch service bookings
  const fetchServiceBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Sort by latest item (-createdAt), pagination parameters
      const response = await axios.get(
        `${API_BASE_URL}services?page=${currentPage}&limit=${limit}&sort=-createdAt`
      );
      const { data, pagination } = response.data;

      // Map backend data fields to match frontend expectations
      const formattedBookings = data.map(booking => ({
        id: booking._id, // Use _id from backend as 'id'
        customerName: booking.name,
        email: booking.email,
        phone: booking.phone,
        service: booking.serviceNeeded,
        vehicle: `${booking.vehicleYear} ${booking.make} ${booking.model}`,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        additionalNotes: booking.additionalNotes,
        status: booking.status // Backend status already matches enum
      }));

      setServiceBookings(formattedBookings);
      setTotalPages(pagination.totalPages);
      setTotalResults(pagination.totalResults);
    } catch (err) {
      console.error("Error fetching service bookings:", err.response?.data || err.message);
      setError("Failed to fetch service bookings. Please try again.");
      toast.error(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]); // Dependencies for useCallback

  useEffect(() => {
    fetchServiceBookings();
  }, [fetchServiceBookings]); // Fetch data when component mounts or fetchServiceBookings changes

  // Columns for the Table component
  const columns = [
    {
      header: 'Customer',
      accessor: 'customerName', // Use accessor for searching/sorting if Table component supports it
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customerName}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Service',
      accessor: 'service',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.service}</div>
          <div className="text-sm text-gray-500">{row.vehicle}</div>
        </div>
      )
    },
    {
      header: 'Preferred Date',
      accessor: 'preferredDate',
      cell: (row) => new Date(row.preferredDate).toLocaleDateString()
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id', // Use 'id' for actions
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingBooking(row)}
            className="text-blue-600 hover:text-blue-900"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.status === 'pending' && ( // Check for lowercase 'pending'
            <>
              <button
                onClick={() => updateStatus(row.id, 'confirmed')}
                className="text-green-600 hover:text-green-900"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => updateStatus(row.id, 'cancelled')}
                className="text-red-600 hover:text-red-900"
                title="Cancel"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {row.status === 'confirmed' && ( // Check for lowercase 'confirmed'
            <button
              onClick={() => updateStatus(row.id, 'completed')}
              className="text-blue-600 hover:text-blue-900"
              title="Mark Complete"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Function to update status via API
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_BASE_URL}services/status/${id}`, {
        status: newStatus
      });

      if (response.status === 200) {
        toast.success(`Booking status updated to ${newStatus}!`);
        // Optimistically update the local state or refetch data
        // Refetching is safer to ensure data consistency after backend update
        fetchServiceBookings();
      }
    } catch (err) {
      console.error(`Error updating status for ${id} to ${newStatus}:`, err.response?.data || err.message);
      toast.error(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
    }
  };

  // Handlers for pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Optional: If you have a separate parts table, you'd replicate this logic for parts
  // For now, this component seems to be focused on "Service Bookings".
  // If you intend to show both, you'll need separate state, API calls, and tables.


  return (
    <Layout title="Service & Parts Management"> {/* Updated Layout title */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Service Bookings</h2> {/* Specific heading */}
            <p className="text-gray-600">Manage all incoming service requests</p>
          </div>
          {/* Add a button for 'Parts Orders' if you want to switch or navigate */}
          {/* <button className="btn-primary">View Parts Orders</button> */}
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
                    {serviceBookings.filter(b => b.status === 'pending').length}
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
                    {serviceBookings.filter(b => b.status === 'confirmed').length}
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
                    {serviceBookings.filter(b => b.status === 'completed').length}
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
                    {serviceBookings.filter(b => b.status === 'cancelled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-10 animate-spin " />

          </div>
        ) : error ? (
          <div className="text-center text-red-600 p-4 border border-red-300 rounded-md bg-red-50">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={serviceBookings}
              searchPlaceholder="Search bookings..."
              // Pass pagination props to Table if it supports them
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalResults={totalResults}
            />
            {/* You might want pagination controls here if your Table component doesn't render them */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                {/* Basic pagination controls */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}


        {/* View Modal */}
        <Modal
          isOpen={!!viewingBooking}
          onClose={() => setViewingBooking(null)}
          title="Service Booking Details"
          size="lg"
        >
          {viewingBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Customer Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name</span>
                      <p>{viewingBooking.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p>{viewingBooking.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone</span>
                      <p>{viewingBooking.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Service Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Service</span>
                      <p>{viewingBooking.service}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Vehicle</span>
                      <p>{viewingBooking.vehicle}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preferred Date</span>
                      <p>{new Date(viewingBooking.preferredDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Preferred Time</span>
                      <p>{viewingBooking.preferredTime}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[viewingBooking.status]}`}>
                          {viewingBooking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {viewingBooking.additionalNotes && ( // Changed from 'notes' to 'additionalNotes'
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {viewingBooking.additionalNotes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                {viewingBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(viewingBooking.id, 'confirmed');
                        setViewingBooking(null); // Close modal after action
                      }}
                      className="btn-primary bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(viewingBooking.id, 'cancelled');
                        setViewingBooking(null); // Close modal after action
                      }}
                      className="btn-danger bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel Booking
                    </button>
                  </>
                )}
                {viewingBooking.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      updateStatus(viewingBooking.id, 'completed');
                      setViewingBooking(null); // Close modal after action
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

export default ServiceParts;