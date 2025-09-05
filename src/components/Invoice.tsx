import React, { useRef } from 'react';
import type { Invoice } from '../types/reports';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

interface InvoiceProps {
    invoice: Invoice;
    type: 'simple' | 'detailed';
}

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceProps>(
    ({ invoice, type }, ref) => {
        return (
            <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-gray-600">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-xl text-gray-900">
                            {invoice.companyDetails.name}
                        </h2>
                        {type === 'detailed' && (
                            <>
                                <p className="text-gray-600">{invoice.companyDetails.address}</p>
                                <p className="text-gray-600">{invoice.companyDetails.email}</p>
                                <p className="text-gray-600">{invoice.companyDetails.phone}</p>
                                <p className="text-gray-600">Tax ID: {invoice.companyDetails.taxId}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="flex justify-between mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-700">Issue Date:</h3>
                        <p>{format(invoice.createdAt, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Due Date:</h3>
                        <p>{format(invoice.dueDate, 'MMM dd, yyyy')}</p>
                    </div>
                </div>

                {/* Addresses */}
                {type === 'detailed' && (
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
                            <div className="text-gray-600">
                                <p>{invoice.billingAddress.name}</p>
                                <p>{invoice.billingAddress.street}</p>
                                <p>
                                    {invoice.billingAddress.city}, {invoice.billingAddress.state}
                                </p>
                                <p>{invoice.billingAddress.country} {invoice.billingAddress.postalCode}</p>
                                <p>{invoice.billingAddress.email}</p>
                                <p>{invoice.billingAddress.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Ship To:</h3>
                            <div className="text-gray-600">
                                <p>{invoice.shippingAddress.name}</p>
                                <p>{invoice.shippingAddress.street}</p>
                                <p>
                                    {invoice.shippingAddress.city}, {invoice.shippingAddress.state}
                                </p>
                                <p>{invoice.shippingAddress.country} {invoice.shippingAddress.postalCode}</p>
                                <p>{invoice.shippingAddress.email}</p>
                                <p>{invoice.shippingAddress.phone}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="py-2 text-left">Item</th>
                            {type === 'detailed' && (
                                <>
                                    <th className="py-2 text-left">Size/Color</th>
                                    <th className="py-2 text-right">Unit Price</th>
                                </>
                            )}
                            <th className="py-2 text-right">Qty</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2">{item.name}</td>
                                {type === 'detailed' && (
                                    <>
                                        <td className="py-2">
                                            {item.size && `Size: ${item.size}`}
                                            {item.size && item.color && ', '}
                                            {item.color && `Color: ${item.color}`}
                                        </td>
                                        <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                                    </>
                                )}
                                <td className="py-2 text-right">{item.quantity}</td>
                                <td className="py-2 text-right">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end mb-8">
                    <div className="w-64">
                        <div className="flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span>${invoice.subtotal.toFixed(2)}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between mb-2 text-green-600">
                                <span>Discount{invoice.discountCode && ` (${invoice.discountCode})`}:</span>
                                <span>-${invoice.discount.toFixed(2)}</span>
                            </div>
                        )}
                        {type === 'detailed' && (
                            <div className="flex justify-between mb-2">
                                <span>Tax:</span>
                                <span>${invoice.tax.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                            <span>Total:</span>
                            <span>${invoice.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {type === 'detailed' && (
                    <div className="border-t border-gray-300 pt-4 text-gray-600">
                        <h4 className="font-semibold mb-2">Payment Information:</h4>
                        <p>Method: {invoice.paymentMethod}</p>
                        <p className="mt-4">Thank you for your business!</p>
                    </div>
                )}
            </div>
        );
    }
);

const Invoice = ({ invoice, type }: InvoiceProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        documentTitle: `Invoice-${invoice.invoiceNumber}`,
        onPrintError: (error) => console.error('Failed to print:', error),
        onBeforePrint: async () => console.log('Preparing to print...'),
        onAfterPrint: () => console.log('Print completed')
    }); return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        Invoice #{invoice.invoiceNumber}
                    </h2>
                    <button
                        onClick={handlePrint}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                    >
                        Print Invoice
                    </button>
                </div>
                <InvoiceTemplate ref={componentRef} invoice={invoice} type={type} />
            </div>
        </div>
    );
};

export default Invoice;
