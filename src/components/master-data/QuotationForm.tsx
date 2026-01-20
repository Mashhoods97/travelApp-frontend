import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown } from "lucide-react";
import { useData, Package } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { cn } from "../ui/utils";
import TravelService from '../../lib/api/services/travelService';

export default function QuotationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const { quotations, addQuotation, updateQuotation, packages } = useData();
  const { user } = useAuth();

  const [openCustomer, setOpenCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerOptions, setCustomerOptions] = useState<{ id: string, name: string, companyName?: string }[]>([]);
  const [packageOptions, setPackageOptions] = useState<Package[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    customerId: '' as unknown as number,
    packageId: '' as unknown as number,
    userId: 0,
    bookingDate: new Date().toISOString().split('T')[0],
    travelDate: '',
    paxCount: 1,
    totalPrice: 0,
    discount: 0,
    finalPrice: 0,
    status: 0,
    notes: ''
  });

  // 1. Load initial dropdown data (RUNS ONCE)
  useEffect(() => {
    (async () => {
      try {
        const [custRes, pkgRes] = await Promise.all([
          TravelService.searchCustomers(''),
          TravelService.searchPackages('')
        ]);

        const cItems = (custRes || []).map((c: any) => ({
          id: String(c.id),
          name: (c.firstName && c.lastName) ? `${c.firstName} ${c.lastName}` : (c.name || c.username || 'Unknown Customer'),
          companyName: c.companyName
        }));
        setCustomerOptions(cItems);

        const pItems = (pkgRes || []).map((p: any) => ({
          id: String(p.id),
          name: p.title || p.name || p.label || 'Unknown Package',
          basePrice: Number(p.price || p.basePrice || p.cost || 0),
          ...p
        }));
        setPackageOptions(pItems);
      } catch (e) { console.error('Failed to load dropdown data', e); }
    })();
  }, []);

  // 2. Load quotation data (RUNS ON ID CHANGE)
  useEffect(() => {
    if (!isEdit) {
      if (user?.id) setFormData(prev => ({ ...prev, userId: Number(user.id) }));
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const q = await TravelService.getQuotationById(String(id));

        if (q) {
          setFormData({
            title: q.title || '',
            customerId: Number(q.customerId),
            packageId: Number(q.packageId),
            userId: Number(q.userId || q.createdBy || user?.id || 0),
            bookingDate: q.bookingDate ? new Date(q.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            travelDate: q.travelDate ? new Date(q.travelDate).toISOString().split('T')[0] : '',
            paxCount: Number(q.paxCount || 1),
            totalPrice: Number(q.totalPrice),
            discount: Number(q.discount),
            finalPrice: Number(q.finalPrice),
            status: typeof q.status === 'number' ? q.status : (q.status === 'APPROVED' ? 2 : q.status === 'SENT' ? 1 : q.status === 'REJECTED' ? 3 : 0),
            notes: q.notes || ''
          });
        }
      } catch (e) {
        console.error('Failed to load quotation', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, user]);

  // 3. Ensure Customer Exists in Dropdown (RUNS WHEN FORM DATA OR OPTIONS CHANGE - STABLE CHECK)
  useEffect(() => {
    const cId = String(formData.customerId);
    if (!cId || cId === '0') return;

    // Check if customer is already in the list
    const exists = customerOptions.some(opt => String(opt.id) === cId);

    if (!exists) {
      // If not, fetch and add it. Running asynchronously.
      (async () => {
        try {
          const cust = await TravelService.getCustomerById(cId);
          if (cust) {
            const newOption = {
              id: String(cust.id),
              name: (cust.firstName && cust.lastName) ? `${cust.firstName} ${cust.lastName}` : (cust.name || cust.username || 'Unknown Customer'),
              companyName: cust.companyName
            };
            // Functional update ensures no race conditions and only adds if still missing
            setCustomerOptions(prev => {
              if (prev.some(p => String(p.id) === cId)) return prev;
              return [...prev, newOption];
            });
          }
        } catch (err) {
          console.error('Failed to load specific customer', err);
        }
      })();
    }
  }, [formData.customerId, customerOptions]);


  const handlePackageChange = (val: string) => {
    const pkgId = Number(val);
    const selectedPackage = packageOptions.find(p => Number(p.id) === pkgId);
    if (selectedPackage) {
      const base = selectedPackage.basePrice ?? 0;
      setFormData(prev => ({
        ...prev,
        packageId: pkgId,
        totalPrice: base * prev.paxCount,
        finalPrice: (base * prev.paxCount) - prev.discount
      }));
    } else {
      setFormData(prev => ({ ...prev, packageId: pkgId }));
    }
  };

  const handlePaxChange = (count: number) => {
    setFormData(prev => ({ ...prev, paxCount: count }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        userId: user?.id ? Number(user.id) : formData.userId, // Ensure userId is current user on create
        bookingDate: formData.bookingDate ? new Date(formData.bookingDate).toISOString() : null,
        travelDate: formData.travelDate ? new Date(formData.travelDate).toISOString() : null,
      };

      if (isEdit) {
        updateQuotation(String(id), payload as any);
      } else {
        addQuotation(payload as any);
      }
      navigate('/quotations');
    } catch (e) {
      console.error('Failed to save quotation', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEdit ? 'Edit Quotation' : 'Create Quotation'}</CardTitle>
              <CardDescription>Manage quotation details</CardDescription>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => navigate('/quotations')}>Back</Button>
              <Button form="quotation-form" type="submit" disabled={saving}>{isEdit ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <form id="quotation-form" onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter Quotation Title"
                  />
                </div>
                {/* User ID is hidden now, handled internally */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerId">Customer</Label>
                  <Select
                    value={String(formData.customerId || '')}
                    onValueChange={(v) => setFormData({ ...formData, customerId: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.customerId ? "Customer Selected" : "Select Customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {customerOptions.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="packageId">Package</Label>
                  <Select value={String(formData.packageId || '')} onValueChange={handlePackageChange}>
                    <SelectTrigger id="packageId"><SelectValue placeholder="Select package" /></SelectTrigger>
                    <SelectContent>
                      {packageOptions.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} - ${p.basePrice}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bookingDate">Booking Date</Label>
                  <Input
                    id="bookingDate"
                    type="date"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="travelDate">Travel Date</Label>
                  <Input
                    id="travelDate"
                    type="date"
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="paxCount">Pax Count</Label>
                  <Input
                    id="paxCount"
                    type="number"
                    min="1"
                    value={formData.paxCount}
                    onChange={(e) => handlePaxChange(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="totalPrice">Total Price ($)</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    value={formData.totalPrice}
                    onChange={(e) => setFormData({ ...formData, totalPrice: Number(e.target.value), finalPrice: Number(e.target.value) - formData.discount })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="discount">Discount ($)</Label>
                  <Input id="discount" type="number" value={formData.discount} onChange={(e) => {
                    const d = Number(e.target.value) || 0;
                    setFormData({ ...formData, discount: d, finalPrice: formData.totalPrice - d });
                  }} />
                </div>

                <div>
                  <Label htmlFor="finalPrice">Final Price ($)</Label>
                  <Input id="finalPrice" value={formData.finalPrice} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={String(formData.status)} onValueChange={(v) => setFormData({ ...formData, status: Number(v) })}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Draft</SelectItem>
                      <SelectItem value="1">Sent</SelectItem>
                      <SelectItem value="2">Approved</SelectItem>
                      <SelectItem value="3">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
