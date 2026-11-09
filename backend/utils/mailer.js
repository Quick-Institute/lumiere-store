const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const money = (n) => "Rs. " + Number(n || 0).toLocaleString("en-US");

function buildInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const number = "#LM" + order.number;
    const date = new Date(order.createdAt || Date.now()).toISOString().slice(0, 10);
    const s = order.shipping || {};

    doc.fontSize(24).fillColor("#6b4fbb").text("Lumiere", 50, 50);
    doc.fontSize(10).fillColor("#666").text("Fashion for every you", 50, 80);
    doc.text("Colombo, Sri Lanka | hello@lumiere.lk", 50, 94);

    doc.fontSize(20).fillColor("#222").text("INVOICE", 350, 50, { width: 195, align: "right" });
    doc.fontSize(10).fillColor("#666");
    doc.text("Order: " + number, 350, 80, { width: 195, align: "right" });
    doc.text("Date: " + date, 350, 94, { width: 195, align: "right" });
    doc.text("Status: " + order.status, 350, 108, { width: 195, align: "right" });

    doc.fontSize(12).fillColor("#222").text("Bill to", 50, 150);
    doc.fontSize(10).fillColor("#555");
    doc.text(s.name || "", 50, 168);
    doc.text(s.phone || "", 50, 182);
    doc.text(s.address || "", 50, 196, { width: 250 });
    doc.text(((s.city || "") + " " + (s.postal || "")).trim(), 50, doc.y);

    doc.fontSize(12).fillColor("#222").text("Payment", 350, 150);
    doc.fontSize(10).fillColor("#555").text(order.paymentMethod || "Cash on Delivery", 350, 168);

    let y = 260;
    doc.rect(50, y, 495, 22).fill("#ece8f7");
    doc.fillColor("#222").fontSize(10);
    doc.text("Item", 58, y + 6);
    doc.text("Size", 300, y + 6);
    doc.text("Qty", 345, y + 6);
    doc.text("Price", 385, y + 6);
    doc.text("Total", 465, y + 6);
    y += 30;

    doc.fillColor("#444");
    (order.items || []).forEach((it) => {
      doc.text(it.name, 58, y, { width: 235 });
      doc.text(it.size || "-", 300, y);
      doc.text(String(it.qty), 345, y);
      doc.text(money(it.price), 385, y);
      doc.text(money(it.price * it.qty), 465, y);
      y += 24;
    });

    y += 15;
    doc.text("Subtotal", 385, y);
    doc.text(money(order.subtotal), 465, y);
    y += 18;
    doc.text("Shipping", 385, y);
    doc.text(order.shippingFee ? money(order.shippingFee) : "Free", 465, y);
    y += 22;
    doc.fontSize(12).fillColor("#222");
    doc.text("Total", 385, y);
    doc.text(money(order.total), 465, y);

    doc.fontSize(10).fillColor("#888").text("Thank you for shopping with Lumiere.", 50, 720, {
      width: 495,
      align: "center",
    });
    doc.end();
  });
}

async function sendInvoiceEmail(order, toEmail) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || !toEmail) {
    console.log("Email not sent: EMAIL_USER / EMAIL_PASS / recipient missing");
    return;
  }

   const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  const number = "#LM" + order.number;
  const pdf = await buildInvoicePdf(order);

  await transporter.sendMail({
    from: `"Lumiere" <${user}>`,
    to: toEmail,
    bcc: process.env.STORE_EMAIL || user,
    subject: `Your Lumiere invoice ${number}`,
    text: `Thank you for your order ${number}. Your invoice is attached.\nTotal: ${money(order.total)}`,
    attachments: [{ filename: `Invoice-${number.replace("#", "")}.pdf`, content: pdf }],
  });
  console.log("Invoice email sent for", number);
}

module.exports = { sendInvoiceEmail, buildInvoicePdf };