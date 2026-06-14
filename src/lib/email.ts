import { BUSINESS_NAME, OWNER_EMAIL } from "@/lib/business";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail(payload: EmailPayload) {
  const apiUrl = process.env.ZEPTOMAIL_API_URL;
  const token = process.env.ZEPTOMAIL_API_TOKEN;
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL;

  if (!apiUrl || !token || !fromEmail) {
    return { skipped: true };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        address: fromEmail,
        name: BUSINESS_NAME,
      },
      to: [
        {
          email_address: {
            address: payload.to,
          },
        },
      ],
      subject: payload.subject,
      htmlbody: payload.html,
      textbody: payload.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed with status ${response.status}`);
  }

  return { skipped: false };
}

export function bookingAdminAlert({
  customerName,
  service,
  status,
}: {
  customerName: string;
  service: string;
  status: string;
}) {
  return sendTransactionalEmail({
    to: OWNER_EMAIL,
    subject: `New ${service} booking - ${customerName}`,
    html: `<p>A new booking came in for <strong>${service}</strong>.</p><p>Status: ${status}</p><p>Customer: ${customerName}</p>`,
    text: `A new booking came in for ${service}. Status: ${status}. Customer: ${customerName}.`,
  });
}
