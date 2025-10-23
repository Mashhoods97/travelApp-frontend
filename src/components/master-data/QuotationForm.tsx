// src/components/quotations/QuotationForm.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function QuotationForm() {
  const { id } = useParams<{ id?: string }>();
  const editingId = id === 'new' ? undefined : id;
  const navigate = useNavigate();
  const { quotations, addQuotation, updateQuotation, customers, packages } = useData();
  const { user } = useAuth();

  const editingQuotation = editingId ? quotations.find(q => q.id === editingId) : null;

  const [formData, setFormData] = useState({
    customerId: '',
    packageId: '',
    totalPrice: 0,
    discount: 0,
    finalPrice: 0,
    validUntil: '',
    status: 'DRAFT' as 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED',
    notes: ''
  });

  useEffect(() => {
    if (editingQuotation) {
      setFormData({
        customerId: editingQuotation.customerId,
        packageId: editingQuotation.packageId,
        totalPrice: editingQuotation.totalPrice,
        discount: editingQuotation.discount,
        finalPrice: editingQuotation.finalPrice,
        validUntil: editingQuotation.validUntil ? editingQuotation.validUntil.split('T')[0] : '',
        status: editingQuotation.status,
        notes: editingQuotation.notes || ''
      });
    }
  }, [editingQuotation]);

  const handlePackageChange = (packageId: string) => {
    const selectedPackage = packages.find(p => p.id === packageId);
    if (selectedPackage) {
      setFormData({
        ...formData,
        packageId,
        totalPrice: selectedPackage.basePrice ?? 0,
        finalPrice: (selectedPackage.basePrice ?? 0) - formData.discount
      });
    } else {
      setFormData({ ...formData, packageId });
    }
  };

  const handleDiscountChange = (discount: number) => {
    setFormData({ ...formData, discount, finalPrice: formData.totalPrice - discount });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      finalPrice: formData.totalPrice - formData.discount
    };

    if (editingQuotation) {
      updateQuotation(editingQuotation.id, data);
    } else {
      addQuotation(data);
    }

    navigate('/quotations');
  };

  return (
    <Card className="max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>{editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer</Label>
              <Select value={formData.customerId} onValueChange={(v: any) => setFormData({ ...formData, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.companyName ? ` (${c.companyName})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Package</Label>
              <Select value={formData.packageId} onValueChange={handlePackageChange}>
                <SelectTrigger><SelectValue placeholder="Select package" /></SelectTrigger>
                <SelectContent>
                  {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.basePrice}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Price ($)</Label>
              <Input
                type="number"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: Number(e.target.value), finalPrice: Number(e.target.value) - formData.discount })}
                required
              />
            </div>

            <div>
              <Label>Discount ($)</Label>
              <Input type="number" value={formData.discount} onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)} />
            </div>

            <div>
              <Label>Final Price ($)</Label>
              <Input value={formData.finalPrice} readOnly className="bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid Until</Label>
              <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => navigate('/quotations')}>Cancel</Button>
            <Button type="submit">{editingQuotation ? 'Update' : 'Create'} Quotation</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default QuotationForm;
