export function printBill(order: any) {
  const win = window.open('', '_blank', 'width=420,height=630');
  if (!win) {
    alert('Please allow popups for this site to print bills.');
    return;
  }

  const inr = (paise: number) =>
    '₹' + ((paise || 0) / 100).toLocaleString('en-IN');

  const fmtDate = (d: any) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const addr = order.address || {};
  const isCOD = order.paymentMethod === 'COD';
  const hasStitching = Array.isArray(order.customStitching) && order.customStitching.length > 0;

  const itemRows = (order.items || []).map((item: any) => `
    <tr>
      <td>
        <div class="item-name">${item.product?.name || 'Product'}</div>
        <div class="item-meta">${item.variant?.color || ''}</div>
        ${item.customStitchingId ? '<div class="custom-badge">✂ CUSTOM</div>' : ''}
      </td>
      <td>${item.variant?.size || '—'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${inr(item.price)}</td>
      <td style="text-align:right">${inr(item.total || item.price * item.quantity)}</td>
    </tr>
    ${item.customStitchingId ? `<tr><td colspan="4" style="font-size:7pt;color:#555;padding-left:4mm;">✂ Custom Stitching</td><td style="text-align:right;font-size:7pt;">₹249</td></tr>` : ''}
  `).join('');

  const stitchingSection = hasStitching ? order.customStitching.map((cs: any) => {
    const linkedItem = (order.items || []).find((i: any) => i.id === cs.orderItemId);
    const measurementRows = Object.entries(cs.measurements as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== '')
      .map(([k, v]) => `<div class="mrow"><span class="mkey">${k.replace(/([A-Z])/g, ' $1').trim()}:</span> <span class="mval">${v}"</span></div>`)
      .join('');
    return `
      <div class="stitch-box">
        <div class="stitch-title">✂ ${cs.garmentType}${linkedItem ? ` — ${linkedItem.product?.name}` : ''}</div>
        <div class="meas">${measurementRows}</div>
        ${cs.specialInstructions ? `<div class="special">📝 ${cs.specialInstructions}</div>` : ''}
      </div>
    `;
  }).join('') : '';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>QOTN — ${order.orderNumber}</title>
<style>
@page { size: 4in 6in; margin: 0; }
*{margin:0;padding:0;box-sizing:border-box}
body{width:4in;height:6in;font-family:Arial,sans-serif;font-size:9pt;color:#000;background:#fff;padding:5mm;position:relative}
.header{text-align:center;border-bottom:2px solid #000;padding-bottom:3mm;margin-bottom:3mm}
.brand{font-size:22pt;font-weight:300;letter-spacing:0.2em}
.brand-sub{font-size:6.5pt;letter-spacing:0.12em;color:#555;margin-top:1mm}
.row2{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3mm;font-size:8pt}
.order-num{font-weight:700;font-size:11pt}
.badges{display:flex;gap:2mm;margin-bottom:3mm;flex-wrap:wrap}
.badge{font-size:6.5pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1.5px solid #000;padding:1mm 3mm}
.badge.paid{background:#000;color:#fff}
.addr-grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:3mm;font-size:7.5pt;line-height:1.5}
.addr-lbl{font-size:6.5pt;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#555;margin-bottom:1mm}
.sec-title{font-size:7pt;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:1mm;margin:3mm 0 2mm}
table{width:100%;border-collapse:collapse;font-size:8pt;margin-bottom:3mm}
th{font-size:6.5pt;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-bottom:1px solid #000;padding:1.5mm 1mm;text-align:left}
td{padding:1.5mm 1mm;border-bottom:1px dashed #ccc;vertical-align:top;line-height:1.4}
.item-name{font-weight:500}
.item-meta{font-size:7pt;color:#555}
.custom-badge{font-size:6pt;background:#000;color:#fff;padding:0.5mm 2mm;display:inline-block;margin-top:1mm}
.totals{margin-left:auto;width:50%;font-size:8pt}
.trow{display:flex;justify-content:space-between;padding:1mm 0;border-bottom:1px dashed #ddd}
.trow.grand{font-weight:700;font-size:10pt;border-top:2px solid #000;border-bottom:2px solid #000;padding:2mm 0;margin-top:1mm}
.stitch-box{border:1.5px solid #000;padding:2mm 3mm;margin:2mm 0;font-size:7.5pt}
.stitch-title{font-weight:700;font-size:8pt;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:2mm}
.meas{display:grid;grid-template-columns:1fr 1fr;gap:1mm}
.mrow{font-size:7pt}.mkey{color:#555}.mval{font-weight:600}
.special{margin-top:2mm;font-size:7pt;font-style:italic;border-top:1px dashed #ccc;padding-top:1mm}
.footer{position:absolute;bottom:5mm;left:5mm;right:5mm;text-align:center;border-top:1px solid #000;padding-top:2mm;font-size:6pt;color:#555;letter-spacing:0.06em}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
</head>
<body>

<div class="header">
  <div class="brand">QOTN</div>
  <div class="brand-sub">PURE COTTON · NOTHING ELSE · MADE IN INDIA</div>
</div>

<div class="row2">
  <div>
    <div class="order-num">${order.orderNumber}</div>
    <div style="font-size:7pt;color:#555;margin-top:1mm">${fmtDate(order.createdAt)}</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:6.5pt;color:#555">Invoice</div>
    <div style="font-weight:700;font-size:9pt">${order.orderNumber.replace('QOTN-', 'INV-')}</div>
  </div>
</div>

<div class="badges">
  <div class="badge ${isCOD ? '' : 'paid'}">${isCOD ? 'CASH ON DELIVERY' : 'PAID ONLINE'}</div>
  <div class="badge">${(order.status || '').toUpperCase()}</div>
  <div class="badge">${(order.deliveryMethod || 'STANDARD').toUpperCase()}</div>
  ${hasStitching ? '<div class="badge paid">✂ CUSTOM STITCH</div>' : ''}
</div>

<div class="addr-grid">
  <div>
    <div class="addr-lbl">Ship To</div>
    <div style="font-weight:600">${addr.firstName || ''} ${addr.lastName || ''}</div>
    <div>${addr.addressLine1 || ''}</div>
    ${addr.addressLine2 ? `<div>${addr.addressLine2}</div>` : ''}
    <div>${addr.city || ''}, ${addr.state || ''} – ${addr.pincode || ''}</div>
    <div>📞 ${addr.phone || '—'}</div>
  </div>
  <div>
    <div class="addr-lbl">From</div>
    <div style="font-weight:600">QOTN</div>
    <div>Helloqotn@gmail.com</div>
    <div>qotn.in</div>
  </div>
</div>

<div class="sec-title">Order Items</div>
<table>
  <thead>
    <tr>
      <th style="width:42%">Item</th>
      <th>Size</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Price</th>
      <th style="text-align:right">Total</th>
    </tr>
  </thead>
  <tbody>${itemRows}</tbody>
</table>

<div class="totals">
  <div class="trow"><span>Subtotal</span><span>${inr(order.subtotal)}</span></div>
  ${order.shippingCharge === 0
    ? '<div class="trow"><span>Shipping</span><span>FREE</span></div>'
    : `<div class="trow"><span>${isCOD ? 'COD + Shipping' : 'Shipping'}</span><span>${inr(order.shippingCharge)}</span></div>`
  }
  ${(order.discount || 0) > 0 ? `<div class="trow"><span>Discount</span><span>−${inr(order.discount)}</span></div>` : ''}
  <div class="trow grand"><span>TOTAL</span><span>${inr(order.total)}</span></div>
</div>

${stitchingSection}

<div class="footer">
  QOTN · qotn.in · Helloqotn@gmail.com · Pure Cotton. Nothing Else.<br>
  Returns within 24 hrs (damaged items only) · No returns on custom orders
</div>

</body>
</html>`;

  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 500);
}
