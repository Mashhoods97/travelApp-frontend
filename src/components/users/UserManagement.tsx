import React, { useMemo, useState } from 'react';
import { useAuth, User, UserRole } from '../../context/AuthContext';
import { UserService } from '../../lib/api';
import { USER_TYPE_OPTIONS, getUserTypeLabel } from '../../lib/api/constants';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Edit, Trash2, User as UserIcon } from 'lucide-react';

export function UserManagement() {
  const { user, createUser, updateUser, deleteUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagedUsers, setPagedUsers] = useState<any>({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState({ name: '', email: '', phone: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    roleId: 1,
    role: 'MANAGER' as UserRole,
    password: '',
    type: 1,
    permissions: [] as string[]
  });
  const [roles, setRoles] = useState<{ id: number; title: string }[]>([]);
  const safeRoles = Array.isArray(roles) ? roles : [];
  React.useEffect(() => {
    (async () => {
      try {
        const data = await UserService.getRoles();
        setRoles(data);
        if (data?.length && !formData.roleId) {
          setFormData((p) => ({ ...p, roleId: data[0].id }));
        }
      } catch (e: any) {
        const status = e?.response?.status;
        console.error('Failed to load roles', status || e);
      }
    })();
  }, [user]);

  // Permissions are not used anymore; backend drives authorization

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await UserService.getUsersPaged({
        page,
        size,
        name: search.name || undefined,
        email: search.email || undefined,
        phone: search.phone || undefined,
      });
      setPagedUsers(data);
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || 'Failed to load users';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await UserService.updateUser(editingUser.id, {
          username: formData.email,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          roleId: formData.roleId,
          type: formData.type,
          active: true,
        });
        await fetchUsers();
      } else {
        await UserService.createUser({
          username: formData.email,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          roleId: formData.roleId,
          password: formData.password,
          type: formData.type,
        });
        await fetchUsers();
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Create user failed', err);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      roleId: 1,
      role: 'MANAGER',
      password: '',
      type: 1,
      permissions: []
    });
    setEditingUser(null);
  };

  const handleEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      firstName: userToEdit.name?.split(' ')[0] || '',
      lastName: userToEdit.name?.split(' ').slice(1).join(' ') || '',
      email: userToEdit.email,
      phone: '',
      address: '',
      roleId: 1,
      role: userToEdit.role,
      password: '',
      type: 1,
      permissions: userToEdit.permissions || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to archive this user?')) {
      try {
        await UserService.archiveUser(userId);
        await fetchUsers();
      } catch (e) {
        console.error('Archive user failed', e);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HEAD':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'SALES_MANAGER':
        return 'bg-green-100 text-green-800';
      case 'RESELLER':
        return 'bg-orange-100 text-orange-800';
      case 'OWNER':
        return 'bg-gray-900 text-white';
      case 'CLIENT':
        return 'bg-teal-100 text-teal-800';
      case 'CUSTOMER':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const roleIdToTitle = useMemo(() => {
    const map = new Map<number, string>();
    (roles || []).forEach(r => map.set(r.id, r.title));
    return map;
  }, [roles]);

  const usersToRender: Array<any> = pagedUsers?.content || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Manage your team members and their roles
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Update user information' : 'Create a new team member'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>
<div>
  <Label htmlFor="role">Role</Label>
  <Select
    value={String(formData.roleId)}
    onValueChange={(value: string) => {
      const selectedRole = roles.find(r => r.id === Number(value));
      setFormData({
        ...formData,
        roleId: Number(value),
        role: (selectedRole?.title as UserRole) || formData.role,
      });
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select role" />
    </SelectTrigger>
    <SelectContent>
      {safeRoles.map((r) => (
        <SelectItem key={r.id} value={String(r.id)}>
          {r.title}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                    {/* roleId is selected via Role dropdown */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={String(formData.type)}
                          onValueChange={(value: string) => setFormData({ ...formData, type: Number(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Permissions display removed */}
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Update' : 'Create'} User
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="search-name">Search Name</Label>
              <Input id="search-name" value={search.name} onChange={(e) => { setPage(0); setSearch({ ...search, name: e.target.value }); }} placeholder="e.g. ali" />
            </div>
            <div>
              <Label htmlFor="search-email">Search Email</Label>
              <Input id="search-email" value={search.email} onChange={(e) => { setPage(0); setSearch({ ...search, email: e.target.value }); }} placeholder="e.g. user@email.com" />
            </div>
            <div>
              <Label htmlFor="search-phone">Search Phone</Label>
              <Input id="search-phone" value={search.phone} onChange={(e) => { setPage(0); setSearch({ ...search, phone: e.target.value }); }} placeholder="e.g. 123456789" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {isLoading ? 'Loading users…' : error ? <span className="text-red-600">{error}</span> : `${pagedUsers.totalElements || 0} users`}
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size">Rows</Label>
              <select id="page-size" className="border rounded px-2 py-1" value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersToRender.map((u) => {
                const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username || u.email;
                const typeLabel = getUserTypeLabel(Number(u.type));
                return (
                  <TableRow key={u.id}>
                    <TableCell>{fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(typeLabel)}>
                        {typeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit({
                            id: String(u.id),
                            name: fullName,
                            email: u.email,
                            role: typeLabel as any,
                            businessId: user?.businessId || '',
                            businessName: user?.businessName || '',
                            permissions: [],
                          })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {u.id !== user?.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(String(u.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" disabled={isLoading || pagedUsers?.first} onClick={() => setPage((p) => Math.max(0, p - 1))}>Previous</Button>
            <div className="text-sm">Page {Number(pagedUsers?.currentPage ?? page) + 1} of {pagedUsers?.totalPages ?? 1}</div>
            <Button variant="outline" disabled={isLoading || pagedUsers?.last} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}