// src/components/quotations/QuotationManagement.tsx
import React from 'react';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, Plus, Edit, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { User, Building, Download, Eye } from 'lucide-react';

export function QuotationManagement() {
  const { quotations, customers, packages, updateQuotation } = useData();
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'SENT': return <Send className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const draftQuotations = quotations.filter(q => q.status === 'DRAFT');
  const sentQuotations = quotations.filter(q => q.status === 'SENT');
  const approvedQuotations = quotations.filter(q => q.status === 'APPROVED');

  const QuotationTable = ({ quotations }: { quotations: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Package</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Valid Until</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((quotation) => {
          const customer = customers.find(c => c.id === quotation.customerId);
          const pkg = packages.find(p => p.id === quotation.packageId);

          return (
            <TableRow key={quotation.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {customer?.type === 'B2B_CLIENT' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <div>
                    <p className="text-sm">{customer?.name}</p>
                    {customer?.companyName && <p className="text-xs text-gray-600">{customer.companyName}</p>}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div>
                  <p className="text-sm">{pkg?.name}</p>
                  <p className="text-xs text-gray-600">{pkg?.duration} days</p>
                </div>
              </TableCell>

              <TableCell>
                <div>
                  <p className="text-sm">${quotation.finalPrice?.toLocaleString?.() ?? quotation.finalPrice}</p>
                  {quotation.discount > 0 && <p className="text-xs text-gray-600">Discount: ${quotation.discount}</p>}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">
                    {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : '-'}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(quotation.status)}
                  <Badge className={getStatusColor(quotation.status)}>{quotation.status}</Badge>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/quotations/${quotation.id}`)}>
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/quotations/view/${quotation.id}`)}>
                    <Eye className="w-3 h-3 mr-1" /> View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
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
                <FileText className="w-5 h-5" />
                <span>Quotation Management</span>
              </CardTitle>
              <CardDescription>Create and manage travel quotations for customers</CardDescription>
            </div>
            <div>
              <Button onClick={() => navigate('/quotations/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Quotation
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({quotations.length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({draftQuotations.length})</TabsTrigger>
              <TabsTrigger value="sent">Sent ({sentQuotations.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedQuotations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all"><QuotationTable quotations={quotations} /></TabsContent>
            <TabsContent value="draft"><QuotationTable quotations={draftQuotations} /></TabsContent>
            <TabsContent value="sent"><QuotationTable quotations={sentQuotations} /></TabsContent>
            <TabsContent value="approved"><QuotationTable quotations={approvedQuotations} /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuotationManagement;
