import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import { Plus, Edit, Trash2, Eye, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const CommunityBlog = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [viewingPost, setViewingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    image: null,
    tags: '',
    status: 'Published',
    imageUrl: '',
  });

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],
    ],
  };

  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'align',
  ];

  const columns = [
    {
      header: 'Post',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          {row.image && (
            <img
              src={row.image}
              alt={row.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
          )}
          <div>
            <div className="font-medium text-gray-900">{row.title}</div>
            <div className="text-sm text-gray-500">By {row.author}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Publish Date',
      accessor: 'publishDate',
      cell: (row) => new Date(row.publishDate).toLocaleDateString(),
    },
    {
      header: 'Tags',
      accessor: 'tags',
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
          {row.tags.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{row.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.status === 'Published'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewingPost(row)}
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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}posts`);
        const fetchedPosts = response.data.data.map((post) => ({
          ...post,
          id: post._id,
        }));
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error.response?.data || error);
        toast.error(error.response?.data?.error || 'Failed to load posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setFormData({
        ...formData,
        image: file,
        imageUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleAdd = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      content: '',
      author: 'Admin',
      image: null,
      tags: '',
      status: 'Published',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      author: post.author,
      image: null,
      tags: post.tags ? post.tags.join(', ') : '',
      status: post.status,
      imageUrl: post.image || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const originalPosts = posts;
      setPosts(posts.filter((post) => post._id !== id));
      try {
        await axios.delete(`${API_BASE_URL}posts/${id}`);
        toast.success('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting post:', error.response?.data || error);
        toast.error(error.response?.data?.error || 'Failed to delete post');
        setPosts(originalPosts);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('author', formData.author);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('status', formData.status);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    } else if (formData.imageUrl) {
      formDataToSend.append('image', formData.imageUrl);
    }

    try {
      const response = await axios[editingPost ? 'put' : 'post'](
        `${API_BASE_URL}posts${editingPost ? `/${editingPost._id}` : ''}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedPost = response.data.data;
      if (editingPost) {
        setPosts(
          posts.map((post) =>
            post._id === editingPost._id
              ? { ...post, ...updatedPost, id: editingPost._id }
              : post
          )
        );
        toast.success('Post updated successfully');
      } else {
        setPosts([...posts, { ...updatedPost, id: updatedPost._id }]);
        toast.success('Post created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting post:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Failed to save post');
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

  return (
    <Layout title="Community Blog">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Community Blog</h2>
            <p className="text-gray-600">Manage blog posts and community content</p>
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center"
            disabled={loading || isSubmitting}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="w-10 h-10 animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <Table
            columns={columns}
            data={posts}
            searchPlaceholder="Search posts..."
          />
        ) : (
          <div className="flex justify-center items-center h-48">
            <h1 className="text-center font-semibold text-gray-700">
              No posts available. Add a new post +
            </h1>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPost ? 'Edit Blog Post' : 'Create Blog Post'}
          size="xl"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="form-label">Content</label>
              <ReactQuill
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                modules={quillModules}
                formats={quillFormats}
                className="bg-white"
                readOnly={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Featured Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="form-input"
                disabled={isSubmitting}
              />
              {(formData.image || formData.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-input"
                placeholder="Used Cars, Tips, Maintenance"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
                disabled={isSubmitting}
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
                ) : editingPost ? (
                  'Update'
                ) : (
                  'Create'
                )}{' '}
                Post
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={!!viewingPost}
          onClose={() => setViewingPost(null)}
          title="Blog Post Preview"
          size="xl"
        >
          {viewingPost && (
            <div className="space-y-6">
              {viewingPost.image && (
                <div className="mb-6">
                  <img
                    src={viewingPost.image}
                    alt={viewingPost.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {viewingPost.title}
                </h1>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <span>By {viewingPost.author}</span>
                  <span>•</span>
                  <span>{new Date(viewingPost.publishDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      viewingPost.status === 'Published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {viewingPost.status}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: viewingPost.content }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {viewingPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

export default CommunityBlog;
