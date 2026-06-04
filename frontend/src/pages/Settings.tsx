import { User } from '../types';
import { ArrowLeft, Edit, Trash2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { userAPI } from '../services/api';
import { updateUser as updateUserLocal, deleteUser as deleteUserLocal } from '../services/userService';

interface SettingsProps {
  user: User;
  onBack: () => void;
  onLogout?: () => void;
  onUpdateUser?: (updatedUser: User) => void;
}

export function Settings({ user, onBack, onLogout, onUpdateUser }: SettingsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });

  // Reset form when user prop changes
  useEffect(() => {
    setEditForm({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  }, [user]);

  const avatarOptions = ['🎓', '📚', '✏️', '🧮', '🎯', '🚀', '⭐', '🏆', '💡', '🔢', '👨‍🎓', '👩‍🎓', '🧑‍💻', '👨‍💼'];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    console.log('Starting profile update...');
    console.log('Form data:', editForm);
    console.log('Current user ID:', user.id);

    // Always update locally first for immediate UI update
    const updatedUser = updateUserLocal(user.id, {
      username: editForm.username,
      email: editForm.email,
      avatar: editForm.avatar,
    });

    console.log('Local update result:', updatedUser);

    if (updatedUser) {
      // Update parent component's state
      if (onUpdateUser) {
        console.log('Calling onUpdateUser callback...');
        onUpdateUser(updatedUser);
      } else {
        console.warn('onUpdateUser callback not provided!');
      }
      
      setShowEditModal(false);
      toast.success('Profile updated successfully!');
      
      // Try to sync with API in background
      try {
        await userAPI.updateUser(user.id, {
          username: editForm.username,
          email: editForm.email,
          avatar: editForm.avatar,
        });
        console.log('Profile synced with server');
      } catch (error) {
        console.log('Sync skipped - will sync when online');
      }
    } else {
      console.error('Local update failed!');
      toast.error('Failed to update profile');
    }
    
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 active:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white rounded-2xl p-6 mb-4">
          <h1 className="text-white mb-2">Account Settings</h1>
          <p className="text-gray-300 text-sm">Manage your account preferences</p>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <h2 className="text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{user.avatar}</div>
              <div>
                <p className="text-gray-900">{user.username}</p>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-600 text-sm">Role: <span className="text-gray-900 capitalize">{user.role}</span></p>
              <p className="text-gray-600 text-sm">Member since: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-4">
          <h2 className="text-gray-900 mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        )}

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Avatar</label>
                  <div className="grid grid-cols-7 gap-2">
                    {avatarOptions.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, avatar })}
                        className={`text-3xl p-2 rounded-lg transition-colors ${
                          editForm.avatar === avatar
                            ? 'bg-blue-100 ring-2 ring-blue-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="mb-6">
                <h2 className="text-gray-900 mb-2">Delete Account</h2>
                <p className="text-gray-600">
                  Are you sure you want to delete your account? This action cannot be undone. All your progress, achievements, and data will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      const { error } = await userAPI.deleteUser(user.id);
                      if (error) {
                        // API failed, try local fallback
                        console.log('API delete failed, using local fallback');
                        const deleted = deleteUserLocal(user.id);
                        if (deleted) {
                          toast.success('Account deleted successfully (offline mode)');
                          if (onLogout) {
                            setTimeout(() => onLogout(), 1000);
                          }
                        } else {
                          toast.error('Failed to delete account');
                        }
                      } else {
                        // API success
                        toast.success('Account deleted successfully');
                        deleteUserLocal(user.id);
                        if (onLogout) {
                          setTimeout(() => onLogout(), 1000);
                        }
                      }
                    } catch (error) {
                      // Network error - use local fallback
                      console.log('Network error, using local fallback');
                      const deleted = deleteUserLocal(user.id);
                      if (deleted) {
                        toast.success('Account deleted successfully (offline mode)');
                        if (onLogout) {
                          setTimeout(() => onLogout(), 1000);
                        }
                      } else {
                        toast.error('Failed to delete account');
                      }
                    } finally {
                      setIsUpdating(false);
                      setShowDeleteModal(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}