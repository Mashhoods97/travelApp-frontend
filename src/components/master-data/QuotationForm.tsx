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

  // Load initial data
  useEffect(() => {
    if (!isEdit) {
      if (user?.id) setFormData(prev => ({ ...prev, userId: Number(user.id) }));
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const q = quotations.find(x => String(x.id) === id);

        if (q) {
          if (q.customerId) {
            const c = await TravelService.getCustomerById(q.customerId);
            if (c) setCustomerOptions([c]);
          }

          setFormData({
            title: (q as any).title || '',
            customerId: Number(q.customerId),
            packageId: Number(q.packageId),
            userId: Number(q.createdBy || user?.id || 0),
            bookingDate: (q as any).bookingDate ? new Date((q as any).bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            travelDate: (q as any).travelDate ? new Date((q as any).travelDate).toISOString().split('T')[0] : '',
            paxCount: (q as any).paxCount || 1,
            totalPrice: q.totalPrice,
            discount: q.discount,
            finalPrice: q.finalPrice,
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
  }, [id, isEdit, quotations, user]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (customerSearch) {
        TravelService.searchCustomers(customerSearch).then(res => {
          // API might return array or object with data property depending on implementation
          // Assuming TravelService.searchCustomers returns array directly based on previous code usage
          // But let's be safe
          const list = Array.isArray(res) ? res : (res as any)?.data || [];
          setCustomerOptions(list);
        });
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [customerSearch]);

  const handlePackageChange = (val: string) => {
    const pkgId = Number(val);
    const selectedPackage = packages.find(p => Number(p.id) === pkgId);
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
                <div className="flex flex-col space-y-2">
                  <Label>Customer</Label>
                  <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCustomer}
                        className="w-full justify-between"
                      >
                        {formData.customerId
                          ? customerOptions.find((c) => String(c.id) === String(formData.customerId))?.name || "Select Customer..."
                          : "Search Customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Type name to search..."
                          value={customerSearch}
                          onValueChange={setCustomerSearch}
                        />
                        <CommandList>
                          <CommandEmpty>No customer found.</CommandEmpty>
                          <CommandGroup>
                            {customerOptions.map((c) => (
                              <CommandItem
                                key={c.id}
                                value={String(c.id)}
                                onSelect={(currentValue) => {
                                  setFormData({ ...formData, customerId: Number(c.id) });
                                  setOpenCustomer(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    String(formData.customerId) === String(c.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {c.name} {c.companyName ? `(${c.companyName})` : ''}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="packageId">Package</Label>
                  <Select value={String(formData.packageId || '')} onValueChange={handlePackageChange}>
                    <SelectTrigger id="packageId"><SelectValue placeholder="Select package" /></SelectTrigger>
                    <SelectContent>
                      {packages.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} - ${p.basePrice}</SelectItem>)}
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
