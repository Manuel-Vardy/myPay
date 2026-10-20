import "server-only";

export function wrapTemplate(heading: string, bodyHtml: string, ctaLabel: string, ctaUrl: string): string {
  return `
  <div style="background:#f6f7fb;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
      <p style="font-weight:800;font-size:18px;color:#000;margin:0 0 24px;">TRITE</p>
      <h1 style="font-size:20px;color:#000;margin:0 0 12px;">${heading}</h1>
      <div style="font-size:14px;line-height:1.6;color:#444;margin:0 0 24px;">${bodyHtml}</div>
      <a href="${ctaUrl}" style="display:inline-block;background:#22c55e;color:#fff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:12px;">${ctaLabel}</a>
      <p style="font-size:12px;color:#999;margin:24px 0 0;">If the button doesn't work, copy this link into your browser:<br />${ctaUrl}</p>
    </div>
  </div>`;
}

export function merchantTransactionEmail(data: {
  txIdDisplay: string;
  amount: string;
  currency: string;
  description?: string | null;
  paymentMethod: string;
  payerEmail?: string | null;
  payerPhone?: string | null;
  settledAt: string | Date;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Payment Received: ${data.currency} ${data.amount}`;
  
  const descriptionRow = data.description
    ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Description</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.description}</td>
      </tr>`
    : "";

  const bodyHtml = `
    <p>You have received a new payment. Here are the transaction details:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Transaction ID</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.txIdDisplay}</td>
      </tr>
      ${descriptionRow}
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Amount</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.currency} ${data.amount}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Payment Method</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.paymentMethod}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Payer Email</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.payerEmail || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Payer Phone</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.payerPhone || "N/A"}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Date</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${new Date(data.settledAt).toLocaleString()}</td>
      </tr>
    </table>
  `;

  const html = wrapTemplate("Payment Received", bodyHtml, "View Transaction", data.dashboardUrl);

  const text = `Payment Received: ${data.currency} ${data.amount}
Transaction ID: ${data.txIdDisplay}${data.description ? `\nDescription: ${data.description}` : ""}
Payment Method: ${data.paymentMethod}
Payer Email: ${data.payerEmail || "N/A"}
Payer Phone: ${data.payerPhone || "N/A"}
Date: ${new Date(data.settledAt).toLocaleString()}

View Transaction: ${data.dashboardUrl}`;

  return { subject, html, text };
}

export function payerConfirmationEmail(data: {
  merchantName: string;
  amount: string;
  currency: string;
  description?: string | null;
  txIdDisplay: string;
}): { subject: string; html: string; text: string } {
  const subject = `Payment Successful to ${data.merchantName}`;
  
  const descriptionRow = data.description
    ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Description</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.description}</td>
      </tr>`
    : "";

  const bodyHtml = `
    <p>Your payment to <strong>${data.merchantName}</strong> was successful. Thank you for your business!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Amount</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.currency} ${data.amount}</td>
      </tr>
      ${descriptionRow}
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#666;">Transaction ID</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${data.txIdDisplay}</td>
      </tr>
    </table>
  `;

  const html = `
  <div style="background:#f6f7fb;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
      <p style="font-weight:800;font-size:18px;color:#000;margin:0 0 24px;">TRITE</p>
      <h1 style="font-size:20px;color:#000;margin:0 0 12px;">Payment Successful</h1>
      <div style="font-size:14px;line-height:1.6;color:#444;margin:0 0 24px;">${bodyHtml}</div>
    </div>
  </div>`;

  const text = `Payment Successful to ${data.merchantName}
Amount: ${data.currency} ${data.amount}${data.description ? `\nDescription: ${data.description}` : ""}
Transaction ID: ${data.txIdDisplay}`;

  return { subject, html, text };
}
