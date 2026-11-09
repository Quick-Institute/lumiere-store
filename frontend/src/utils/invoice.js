import { jsPDF } from "jspdf";

const money = (n) => `Rs. ${Number(n).toLocaleString("en-LK")}`;

export function downloadInvoice(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 15;
  const right = 195;
  let y = 20;

  // ---- header ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(122, 85, 160);
  doc.text("Lumiere", left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text("Fashion for every you", left, y + 6);
  doc.text("Colombo, Sri Lanka  |  hello@lumiere.lk", left, y + 11);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("INVOICE", right, y, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Order: ${order.number}`, right, y + 7, { align: "right" });
  doc.text(`Date: ${order.date}`, right, y + 12, { align: "right" });
  doc.text(`Status: ${order.status}`, right, y + 17, { align: "right" });

  y += 30;
  doc.setDrawColor(220, 210, 232);
  doc.line(left, y, right, y);
  y += 9;

  // ---- bill to ----
  const a = order.address || {};
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text("Bill to", left, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  const lines = [
    a.name || order.customerName,
    a.phone,
    a.address,
    [a.city, a.postal].filter(Boolean).join(" "),
  ].filter(Boolean);
  lines.forEach((line, i) => doc.text(String(line), left, y + 6 + i * 5));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40);
  doc.text("Payment", 120, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(String(order.payment || ""), 120, y + 6);

  y += 6 + lines.length * 5 + 8;

  // ---- table header ----
  doc.setFillColor(243, 237, 249);
  doc.rect(left, y - 5, right - left, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text("Item", left + 2, y);
  doc.text("Size", 105, y);
  doc.text("Qty", 132, y, { align: "right" });
  doc.text("Price", 163, y, { align: "right" });
  doc.text("Total", right - 2, y, { align: "right" });
  y += 8;

  // ---- items ----
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  order.items.forEach((item) => {
    const nameLines = doc.splitTextToSize(String(item.name), 82);
    const height = nameLines.length * 5;

    if (y + height > 265) {
      doc.addPage();
      y = 20;
    }

    doc.text(nameLines, left + 2, y);
    doc.text(String(item.size || "-"), 105, y);
    doc.text(String(item.qty), 132, y, { align: "right" });
    doc.text(money(item.price), 163, y, { align: "right" });
    doc.text(money(item.price * item.qty), right - 2, y, { align: "right" });

    y += height + 2;
    doc.setDrawColor(235, 228, 242);
    doc.line(left, y - 3, right, y - 3);
  });

  // ---- totals ----
  y += 6;
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text("Subtotal", 150, y);
  doc.text(money(order.subtotal), right - 2, y, { align: "right" });
  y += 6;
  doc.text("Shipping", 150, y);
  doc.text(order.shipping === 0 ? "Free" : money(order.shipping), right - 2, y, {
    align: "right",
  });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text("Total", 150, y);
  doc.text(money(order.total), right - 2, y, { align: "right" });

  // ---- footer ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text("Thank you for shopping with Lumiere!", 105, 280, { align: "center" });

  doc.save(`Invoice-${String(order.number).replace("#", "")}.pdf`);
}