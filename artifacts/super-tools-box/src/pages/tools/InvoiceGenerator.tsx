import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2 } from "lucide-react";

interface LineItem {
  id: number;
  desc: string;
  qty: string;
  rate: string;
}

export default function InvoiceGenerator() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [yourName, setYourName] = useState("");
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<LineItem[]>([{ id: 1, desc: "", qty: "1", rate: "" }]);
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  const addItem = () => setItems((p) => [...p, { id: Date.now(), desc: "", qty: "1", rate: "" }]);
  const removeItem = (id: number) => setItems((p) => p.filter((i) => i.id !== id));
  const updateItem = (id: number, field: keyof LineItem, val: string) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  const total = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);
  const fmt = (n: number) => "₹" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229);
      doc.text("INVOICE", margin, y);
      doc.setTextColor(0, 0, 0);

      doc.setFontSize(10);
      doc.text(`Invoice No: ${invoiceNo}`, 140, y);
      y += 7;
      doc.text(`Date: ${date}`, 140, y);
      y += 15;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("From:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(yourName || "Your Name / Business", margin + 15, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Bill To:", margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(clientName || "Client Name", margin + 20, y);
      if (clientEmail) { y += 6; doc.text(clientEmail, margin + 20, y); }
      y += 15;

      // Table header
      doc.setFillColor(237, 233, 254);
      doc.rect(margin, y, 170, 9, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Description", margin + 2, y + 6);
      doc.text("Qty", 120, y + 6);
      doc.text("Rate (₹)", 135, y + 6);
      doc.text("Amount (₹)", 158, y + 6);
      y += 12;

      doc.setFont("helvetica", "normal");
      items.forEach((item) => {
        const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
        doc.text(item.desc || "-", margin + 2, y);
        doc.text(item.qty, 122, y);
        doc.text((parseFloat(item.rate) || 0).toFixed(2), 137, y);
        doc.text(amt.toFixed(2), 160, y);
        y += 8;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y - 2, 190, y - 2);
      });

      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setFillColor(237, 233, 254);
      doc.rect(130, y, 60, 10, "F");
      doc.text(`Total: ${fmt(total)}`, 132, y + 7);
      y += 20;

      if (notes) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Notes:", margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(notes, margin, y + 6, { maxWidth: 170 });
      }

      doc.save(`Invoice_${invoiceNo}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ToolLayout
      toolId="invoice"
      instructions={
        <ul className="list-disc pl-5 space-y-1">
          <li>Fill in your name, client name, and line items.</li>
          <li>Add multiple items using "Add Line Item".</li>
          <li>Click "Download Invoice PDF" to generate and save. 100% offline – no data shared.</li>
        </ul>
      }
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">From (You)</h3>
            <div className="space-y-2">
              <Label htmlFor="yourName">Your Name / Business</Label>
              <Input id="yourName" placeholder="Your Name or Business" value={yourName} onChange={(e) => setYourName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Bill To (Client)</h3>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" placeholder="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email (Optional)</Label>
              <Input id="clientEmail" type="email" placeholder="client@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Invoice Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Line Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <Input className="col-span-6" placeholder="Item / Service description" value={item.desc} onChange={(e) => updateItem(item.id, "desc", e.target.value)} />
                <Input className="col-span-2" type="number" min="1" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)} />
                <Input className="col-span-3" type="number" min="0" placeholder="Rate (₹)" value={item.rate} onChange={(e) => updateItem(item.id, "rate", e.target.value)} />
                <Button variant="ghost" size="icon" className="col-span-1" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="h-4 w-4" /> Add Line Item
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Input placeholder="Payment terms, bank details, thank you message..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl">
          <span className="font-bold text-lg">Total Amount</span>
          <span className="font-bold text-2xl text-primary">{fmt(total)}</span>
        </div>

        <Button className="w-full gap-2" size="lg" onClick={generatePDF} disabled={generating}>
          <Download className="h-5 w-5" />
          {generating ? "Generating PDF..." : "Download Invoice PDF"}
        </Button>
      </div>
    </ToolLayout>
  );
}
