import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Trash2, Edit } from 'lucide-react'
import { addUser, deleteUser as deleteUserService, getUsers, updateUser, UserItem } from '@/services/adminService'

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formStatus, setFormStatus] = useState<'registered' | 'pending'>('registered')

  const openAddUser = () => {
    setEditingUser(null)
    setFormName('')
    setFormEmail('')
    setFormPassword('')
    setFormStatus('registered')
    setIsModalOpen(true)
  }

  const openEditUser = (user: UserItem) => {
    setEditingUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormPassword('')
    setFormStatus(user.status)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    const loadUsers = async () => {
      const data = await getUsers()
      setUsers(data)
    }
    loadUsers()
  }, [])

  const saveUser = async () => {
    if (editingUser) {
      const updated = await updateUser({
        id: editingUser.id,
        name: formName,
        email: formEmail,
        status: formStatus,
        registeredDate: editingUser.registeredDate,
      })
      setUsers((prev) => prev.map((user) => (user.id === updated.id ? updated : user)))
    } else {
      const newUser = await addUser({
        name: formName,
        email: formEmail,
        password: formPassword,
        status: formStatus,
      })
      setUsers((prev) => [...prev, newUser])
    }
    closeModal()
  }

  const deleteUser = async (id: number) => {
    await deleteUserService(id)
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Biometric Management</h1>
            <p className="text-gray-400">Manage registered users and their biometric data</p>
          </div>
          <button onClick={openAddUser} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors">
            Add User
          </button>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800 bg-dark-800/50">
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Registered Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-3 text-sm">{user.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'registered'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {user.status === 'registered' ? 'Registered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-400">{user.registeredDate}</td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => openEditUser(user)} className="p-2 hover:bg-dark-700 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteUser(user.id)} className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-dark-950 border border-dark-800 p-6 shadow-2xl">
            <h2 className="text-2xl font-semibold mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-800 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-800 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-800 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'registered' | 'pending')}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-800 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="registered">Registered</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2 border border-dark-700 rounded-lg hover:border-dark-600 transition-colors">
                Cancel
              </button>
              <button onClick={saveUser} className="px-5 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </GlobalLayout>
  )
}
