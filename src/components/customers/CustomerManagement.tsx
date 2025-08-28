import React, { useState } from 'react';
import { useData, Customer } from '../../context/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { UserCheck, Plus, Edit, Trash2, User, Building, Mail, Phone, MapPin } from 'lucide-react';

export function CustomerManagement() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'B2B_CLIENT',
    companyName: '',
    address: '',
    preferences: [] as string[]
  });
  const [preferenceInput, setPreferenceInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      type: 'INDIVIDUAL',
      companyName: '',
      address: '',
      preferences: []
    });
    setPreferenceInput('');
    setEditingCustomer(null);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      type: customer.type,
      companyName: customer.companyName || '',
      address: customer.address,
      preferences: customer.preferences
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(customerId);
    }
  };

  const addPreference = () => {
    if (preferenceInput.trim() && !formData.preferences.includes(preferenceInput.trim())) {
      setFormData({
        ...formData,
        preferences: [...formData.preferences, preferenceInput.trim()]
      });
      setPreferenceInput('');
    }
  };

  const removePreference = (preference: string) => {
    setFormData({
      ...formData,
      preferences: formData.preferences.filter(p => p !== preference)
    });
  };

  const individualCustomers = customers.filter(c => c.type === 'INDIVIDUAL');
  const b2bClients = customers.filter(c => c.type === 'B2B_CLIENT');

  const CustomerTable = ({ customers }: { customers: Customer[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Preferences</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div>
                <p>{customer.name}</p>
                {customer.companyName && (
                  <p className="text-sm text-gray-600">{customer.companyName}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-sm text-gray-600">{customer.address}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={customer.type === 'B2B_CLIENT' ? 'default' : 'secondary'}>
                {customer.type === 'B2B_CLIENT' ? 'B2B Client' : 'Individual'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {customer.preferences.slice(0, 2).map((preference) => (
                  <Badge key={preference} variant="outline" className="text-xs">
                    {preference}
                  </Badge>
                ))}
                {customer.preferences.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{customer.preferences.length - 2}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(customer.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Customer Management</span>
              </CardTitle>
              <CardDescription>
                Manage individual customers and B2B clients
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCustomer ? 'Update customer information' : 'Add a new customer or B2B client'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="type">Customer Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: 'INDIVIDUAL' | 'B2B_CLIENT') => 
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INDIVIDUAL">Individual Customer</SelectItem>
                          <SelectItem value="B2B_CLIENT">B2B Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">
                          {formData.type === 'B2B_CLIENT' ? 'Contact Person' : 'Full Name'}
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      {formData.type === 'B2B_CLIENT' && (
                        <div>
                          <Label htmlFor="companyName">Company Name</Label>
                          <Input
                            id="companyName"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <Label>Travel Preferences</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          value={preferenceInput}
                          onChange={(e) => setPreferenceInput(e.target.value)}
                          placeholder="Add preference (e.g., Beach, Adventure, Culture)"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreference())}
                        />
                        <Button type="button" onClick={addPreference}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.preferences.map((preference) => (
                          <Badge
                            key={preference}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removePreference(preference)}
                          >
                            {preference} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCustomer ? 'Update' : 'Create'} Customer
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Customers ({customers.length})</TabsTrigger>
              <TabsTrigger value="individual">
                <User className="w-4 h-4 mr-1" />
                Individual ({individualCustomers.length})
              </TabsTrigger>
              <TabsTrigger value="b2b">
                <Building className="w-4 h-4 mr-1" />
                B2B Clients ({b2bClients.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <CustomerTable customers={customers} />
            </TabsContent>
            
            <TabsContent value="individual">
              <CustomerTable customers={individualCustomers} />
            </TabsContent>
            
            <TabsContent value="b2b">
              <CustomerTable customers={b2bClients} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}