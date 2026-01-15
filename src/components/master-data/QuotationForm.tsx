import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function QuotationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState<boolean>(!!isEdit);
  const [saving, setSaving] = useState<boolean>(false);
  const { quotations, addQuotation, updateQuotation, customers, packages } = useData();
  const { user } = useAuth();

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
    if (!isEdit) return;
    (async () => {
      try {
        setLoading(true);
        const quotation = quotations.find(q => q.id === id);
        if (quotation) {
          setFormData({
            customerId: quotation.customerId,
            packageId: quotation.packageId,
            totalPrice: quotation.totalPrice,
            discount: quotation.discount,
            finalPrice: quotation.finalPrice,
            validUntil: quotation.validUntil ? quotation.validUntil.split('T')[0] : '',
            status: quotation.status,
            notes: quotation.notes || ''
          });
        }
      } catch (e) {
        console.error('Failed to load quotation', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, quotations]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        finalPrice: formData.totalPrice - formData.discount
      };

      if (isEdit) {
        updateQuotation(String(id), data);
      } else {
        addQuotation(data);
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
                  <Label htmlFor="customerId">Customer</Label>
                  <Select value={formData.customerId} onValueChange={(v: any) => setFormData({ ...formData, customerId: v })}>
                    <SelectTrigger id="customerId"><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}{c.companyName ? ` (${c.companyName})` : ''}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="packageId">Package</Label>
                  <Select value={formData.packageId} onValueChange={handlePackageChange}>
                    <SelectTrigger id="packageId"><SelectValue placeholder="Select package" /></SelectTrigger>
                    <SelectContent>
                      {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - ${p.basePrice}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                  <Input id="discount" type="number" value={formData.discount} onChange={(e) => handleDiscountChange(Number(e.target.value) || 0)} />
                </div>

                <div>
                  <Label htmlFor="finalPrice">Final Price ($)</Label>
                  <Input id="finalPrice" value={formData.finalPrice} readOnly className="bg-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input id="validUntil" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
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
