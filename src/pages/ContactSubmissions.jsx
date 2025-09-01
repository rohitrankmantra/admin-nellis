'use client';

import { useState, useEffect } from 'react';
// Corrected import paths assuming components directory is at the project root
import Layout from '../components/layout/Layout'; 
import Table from '../components/ui/Table';     
import Modal from '../components/ui/Modal';     
import { Eye, Mail, Phone, Trash2, Loader } from 'lucide-react'; 
import toast from 'react-hot-toast'; 
import axios from 'axios'; 
const API_BASE_URL = import.meta.env.VITE_API_URL;

const ContactSubmissions = () => {
  const [submissions, setSubmissions] = useState([]); 
  const [loadingSubmissions, setLoadingSubmissions] = useState(true); 
  const [viewingSubmission, setViewingSubmission] = useState(null);
  
  // States for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submissionToDeleteId, setSubmissionToDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); 

  const statusColors = {
    'new': 'bg-blue-100 text-blue-800', 
    'responded': 'bg-green-100 text-green-800', 
    'archive': 'bg-gray-100 text-gray-800'     
  };

  // Function to fetch all contact submissions from the backend
  const fetchSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const response = await axios.get(`${API_BASE_URL}contact`); 
      if (response.data && Array.isArray(response.data.data)) {
        setSubmissions(response.data.data);
      } else {
        setSubmissions([]); 
        toast.error('Unexpected data format from contacts API.');
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast.error('Failed to load contact submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };


  useEffect(() => {
    fetchSubmissions();
  }, []); 

  // Handles opening the delete confirmation modal
  const handleDeleteClick = (id) => {
    setSubmissionToDeleteId(id);
    setDeleteModalOpen(true);
  };

  // Handles the actual deletion API call
  const handleDeleteConfirm = async () => {
    setIsDeleting(true); 
    try {
      const response = await axios.delete(`${API_BASE_URL}contact/${submissionToDeleteId}`);
      
      if (response.data.success == true) {
        toast.success('Submission deleted successfully');
        fetchSubmissions(); 
        setDeleteModalOpen(false); 
        setSubmissionToDeleteId(null); 
      } else {
        toast.error(response.data.message || 'Failed to delete submission.');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error(error.response?.data?.message || 'Failed to delete submission. Please try again.');
    } finally {
      setIsDeleting(false); 
    }
  };

  // Handles updating the status of a contact submission
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}contact/${id}/status`, { status: newStatus });

      if (response.data.success == true) {
        toast.success(`Status updated to ${newStatus}`);
        fetchSubmissions(); 
      } else {
        toast.error(response.data.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  const columns = [
    {
      header: 'Contact',
      accessor: 'name',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <Mail className="w-3 h-3 mr-1" />
            {row.email}
          </div>
          {row.phone && ( 
            <div className="text-sm text-gray-500 flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {row.phone}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Subject',
      accessor: 'subject',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.subject}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">
            {row.message}
          </div>
        </div>
      )
    },
    {
      header: 'Submitted',
      accessor: 'createdAt', 
      cell: (row) => {
        const date = new Date(row.createdAt || row.submittedAt); 
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <div className="text-sm text-gray-500">{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)} 
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id', 
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingSubmission(row)}
            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row._id)} 
            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
            title="Delete Submission"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout title="Contact Submissions">
      <div className="space-y-6 p-4 md:p-6"> 
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
            <p className="text-gray-600">View and manage customer contact inquiries</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-card p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    New Submissions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {submissions.filter(s => s.status === 'new').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="stat-card p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Responded
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {submissions.filter(s => s.status === 'responded').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="stat-card p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Submissions
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {submissions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Conditional rendering for loading or no data */}
        {loadingSubmissions ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="animate-spin w-8 h-8 text-blue-500" />
            <span className="ml-3 text-gray-600">Loading submissions...</span>
          </div>
        ) : submissions.length > 0 ? (
          <Table
            columns={columns}
            data={submissions}
            searchPlaceholder="Search submissions..."
          />
        ) : (
          <div className="text-center py-10 text-gray-500">
            No contact submissions found.
          </div>
        )}

        {/* View Modal */}
        <Modal
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
          title="Contact Submission Details"
          size="lg"
        >
          {viewingSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name</span>
                      <p className="text-gray-900">{viewingSubmission.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p className="text-gray-900">
                        <a 
                          href={`mailto:${viewingSubmission.email}`}
                          className="text-blue-600 hover:text-blue-800" 
                        >
                          {viewingSubmission.email}
                        </a>
                      </p>
                    </div>
                    {viewingSubmission.phone && ( 
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone</span>
                        <p className="text-gray-900">
                          <a 
                            href={`tel:${viewingSubmission.phone}`}
                            className="text-blue-600 hover:text-blue-800" 
                          >
                            {viewingSubmission.phone}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Submission Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Subject</span>
                      <p className="text-gray-900">{viewingSubmission.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Submitted</span>
                      <p className="text-gray-900">
                        {new Date(viewingSubmission.createdAt || viewingSubmission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[viewingSubmission.status]}`}>
                          {viewingSubmission.status.charAt(0).toUpperCase() + viewingSubmission.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingSubmission.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 mt-6 space-y-3 sm:space-y-0">
                <div className="w-full sm:w-auto">
                  <label htmlFor="status-select" className="sr-only">Update Status</label>
                  <select
                    id="status-select"
                    value={viewingSubmission.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setViewingSubmission(prev => ({ ...prev, status: newStatus }));
                      updateStatus(viewingSubmission._id, newStatus); 
                    }}
                    className="form-select block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="new">New</option>
                    <option value="responded">Responded</option>
                    <option value="archive">Archived</option>
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <a
                    href={`mailto:${viewingSubmission.email}?subject=Re: ${viewingSubmission.subject}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </a>
                  {viewingSubmission.phone && (
                    <a
                      href={`tel:${viewingSubmission.phone}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          size="sm"
        >
          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700">
              Are you sure you want to delete this contact submission?
            </p>
            <p className="text-sm text-gray-500">
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader className="animate-spin w-4 h-4 mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default ContactSubmissions;
