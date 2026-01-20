import React, { useState, useEffect } from 'react';
import { useData, Customer } from '../../context/DataContext';
import TravelService from '../../lib/api/services/travelService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Mail, Phone, MapPin, Search, Pencil, Trash2, Building, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CustomerManagement() {
    const navigate = useNavigate();
    const { customers, deleteCustomer } = useData();
    const [loading, setLoading] = useState(false);
    const [list, setList] = useState<Customer[]>([]);
    const [search, setSearch] = useState('');

    const performSearch = async () => {
        try {
            setLoading(true);
            const res = await TravelService.getCustomers({
                page: 1,
                size: 100,
                name: search || undefined,
                email: search || undefined,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });
            const items = (res.data || []).map((c: any) => ({
                id: String(c.id),
                firstName: c.firstName,
                lastName: c.lastName,
                name: (c.firstName && c.lastName) ? `${c.firstName} ${c.lastName}` : (c.name || c.username || 'Unknown Customer'),
                email: c.email || '',
                phone: c.phone || '',
                type: c.type || 'INDIVIDUAL',
                companyName: c.companyName,
                address: c.address || '',
                city: c.city,
                state: c.state,
                country: c.country,
                postalCode: c.postalCode,
                preferences: c.preferences || [],
            } as Customer));
            setList(items);
        } catch (e) {
            console.error('Search failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        performSearch();
    }, []);

    const handleEdit = (customer: Customer) => {
        navigate(`/customers/${customer.id}`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            await deleteCustomer(id);
            performSearch();
        }
    };

    const individualCustomers = list.filter(c => c.type === 'INDIVIDUAL');
    const b2bClients = list.filter(c => c.type === 'B2B_CLIENT');

    const CustomerTable = ({ customers }: { customers: Customer[] }) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center">No customers found.</TableCell></TableRow>
                    ) : customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell>
                                <div>
                                    <p className="font-medium">{customer.name}</p>
                                    {customer.companyName && (
                                        <p className="text-sm text-muted-foreground">{customer.companyName}</p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-1">
                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-sm">{customer.email}</span>
                                    </div>
                                    {customer.phone && (
                                        <div className="flex items-center space-x-1">
                                            <Phone className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm">{customer.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={customer.type === 'B2B_CLIENT' ? 'secondary' : 'outline'}>
                                    {customer.type === 'B2B_CLIENT' ? 'Business' : 'Individual'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {customer.city || customer.country ? (
                                    <div className="flex items-center space-x-1">
                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-sm">
                                            {[customer.city, customer.country].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                ) : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(customer.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">Manage your customer database</p>
                </div>
                <Button onClick={() => navigate('/customers/new')}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Directory</CardTitle>
                    <CardDescription>
                        A list of all customers in your system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8"
                                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                            />
                        </div>
                        <Button variant="secondary" onClick={performSearch}>Search</Button>
                    </div>

                    <Tabs defaultValue="all" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="all">All ({list.length})</TabsTrigger>
                            <TabsTrigger value="individual">
                                Individual ({individualCustomers.length})
                            </TabsTrigger>
                            <TabsTrigger value="b2b">
                                Business ({b2bClients.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <CustomerTable customers={list} />
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
