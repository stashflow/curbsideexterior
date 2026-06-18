import { BUSINESS_NAME, BUSINESS_PHONE_DISPLAY, BUSINESS_INSTAGRAM_HANDLE, OWNER_EMAIL, PAYMENT_OPERATOR_NAME } from "@/lib/business";
import { formatBoolean, formatCurrency, formatDateOnly, formatDateTime, formatServiceList, formatTitle, parseQuoteJson } from "@/lib/format";
import type { BookingRecord } from "@/lib/bookings";
import { getCampaignForMonth } from "@/lib/marketing";
import { SITE_URL } from "@/lib/site";
import type { SubscriberRecord } from "@/lib/subscribers";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function emailShell({
  eyebrow,
  title,
  body,
  footer,
}: {
  eyebrow: string;
  title: string;
  body: string;
  footer?: string;
}) {
  return `
  <div style="background:#02060B;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#FFFFFF;">
    <div style="max-width:620px;margin:0 auto;background:linear-gradient(180deg,rgba(7,17,29,0.98),rgba(2,6,11,0.98));border:1px solid rgba(18,182,255,0.18);border-radius:24px;overflow:hidden;">
      <div style="padding:28px 28px 0 28px;">
        <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(18,182,255,0.12);border:1px solid rgba(18,182,255,0.18);font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B6E9FF;font-weight:700;">
          ${eyebrow}
        </div>
        <h1 style="margin:18px 0 0 0;font-size:34px;line-height:1.02;text-transform:uppercase;font-family:Teko,Arial Narrow,Arial,sans-serif;letter-spacing:0.04em;color:#FFFFFF;">
          ${title}
        </h1>
      </div>
      <div style="padding:24px 28px 12px 28px;color:#D9E3EE;font-size:16px;line-height:1.7;">
        ${body}
      </div>
      <div style="padding:0 28px 28px 28px;color:#A7B0BE;font-size:14px;line-height:1.7;">
        ${footer ?? `${BUSINESS_NAME}<br />${BUSINESS_PHONE_DISPLAY}<br />Instagram ${BUSINESS_INSTAGRAM_HANDLE}<br />Payments are processed securely by ${PAYMENT_OPERATOR_NAME} through Stripe.`}
      </div>
    </div>
  </div>`;
}

function quoteSummaryTable(booking: BookingRecord) {
  const quote = parseQuoteJson(booking.quote_json);
  const lineItems = quote?.lineItems ?? [];

  const rows = lineItems
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);color:#FFFFFF;">${item.label}</td>
        <td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);color:#B6E9FF;text-align:right;">${item.amount > 0 ? formatCurrency(item.amount) : "Manual review"}</td>
      </tr>`,
    )
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:18px;overflow:hidden;">
      ${rows}
      <tr>
        <td style="padding:12px;color:#FFFFFF;font-weight:700;">Estimated total</td>
        <td style="padding:12px;color:#B6E9FF;text-align:right;font-weight:700;">${formatCurrency(booking.quote_total)}</td>
      </tr>
    </table>
  `;
}

function bookingPhotoLinks(booking: BookingRecord) {
  const photoUrls = Array.isArray(booking.photo_urls) ? booking.photo_urls : [];
  if (photoUrls.length === 0) return "";

  const links = photoUrls
    .map(
      (url, index) =>
        `<li style="margin:0 0 8px 0;"><a href="${url}" style="color:#B6E9FF;">Photo ${index + 1}</a></li>`,
    )
    .join("");

  return `
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin:18px 0;">
      <p style="margin:0 0 12px 0;"><strong>Uploaded photos:</strong></p>
      <ul style="margin:0;padding-left:18px;">${links}</ul>
    </div>
  `;
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

export function bookingAdminAlert(booking: BookingRecord) {
  const body = `
    <p style="margin:0 0 18px 0;">A new booking came in and needs review.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Customer:</strong> ${booking.customer_name}</p>
      <p style="margin:0 0 8px 0;"><strong>Phone:</strong> ${booking.phone}</p>
      <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${booking.email}</p>
      <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${formatServiceList(booking.primary_service)}</p>
      <p style="margin:0 0 8px 0;"><strong>Requested time:</strong> ${formatDateOnly(booking.preferred_date)} (${booking.preferred_time_window})</p>
      <p style="margin:0 0 8px 0;"><strong>Address:</strong> ${booking.address_line_1}, ${booking.city}, ${booking.state} ${booking.zip}</p>
      <p style="margin:0;"><strong>Status:</strong> ${formatTitle(booking.status)}</p>
    </div>
    ${quoteSummaryTable(booking)}
    ${bookingPhotoLinks(booking)}
  `;

  return sendTransactionalEmail({
    to: OWNER_EMAIL,
    subject: `New booking: ${booking.customer_name}`,
    html: emailShell({
      eyebrow: "New Booking",
      title: "A New Request Needs Review",
      body,
    }),
    text: `New booking from ${booking.customer_name}. Service: ${formatServiceList(booking.primary_service)}. Status: ${formatTitle(booking.status)}. Phone: ${booking.phone}.`,
  });
}

export function customerRequestEmail(booking: BookingRecord) {
  const paymentLine =
    booking.deposit_due > 0
      ? `Today’s payment: ${formatCurrency(booking.deposit_due)}`
      : "This request will be reviewed before any payment is needed.";

  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">We got your request. Thank you for reaching out to ${BUSINESS_NAME}.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${formatServiceList(booking.primary_service)}</p>
      <p style="margin:0 0 8px 0;"><strong>Preferred date:</strong> ${formatDateOnly(booking.preferred_date)}</p>
      <p style="margin:0 0 8px 0;"><strong>Preferred time:</strong> ${booking.preferred_time_window}</p>
      <p style="margin:0;"><strong>${paymentLine}</strong></p>
    </div>
    ${quoteSummaryTable(booking)}
    ${bookingPhotoLinks(booking)}
    <p style="margin:18px 0 0 0;">If we need anything else, we will keep it simple and reach out by text, email, or Instagram DM.</p>
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: "We got your CURBSIDE request",
    html: emailShell({
      eyebrow: "Request Received",
      title: "We Got Your Request",
      body,
    }),
    text: `Hi ${booking.customer_name}, we got your request for ${formatServiceList(booking.primary_service)}. Preferred date: ${booking.preferred_date}. ${paymentLine}`,
  });
}

export function customerPaymentReceivedEmail(booking: BookingRecord) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">We received your payment.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${formatServiceList(booking.primary_service)}</p>
      <p style="margin:0 0 8px 0;"><strong>Status:</strong> Pending final confirmation</p>
      <p style="margin:0;"><strong>Next step:</strong> We will confirm your date and time window as soon as possible.</p>
    </div>
    <p style="margin:0;">If you need to add anything, reply to this email or send an Instagram DM.</p>
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: "Payment received for your CURBSIDE booking",
    html: emailShell({
      eyebrow: "Payment Received",
      title: "Your Payment Went Through",
      body,
    }),
    text: `Hi ${booking.customer_name}, we received your payment. Your booking is now pending final confirmation.`,
  });
}

export function bookingStatusEmail(booking: BookingRecord) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">Your booking has been updated.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Status:</strong> ${formatTitle(booking.status)}</p>
      <p style="margin:0 0 8px 0;"><strong>Scheduled date:</strong> ${formatDateOnly(booking.scheduled_date) === "Not set" ? "Not set yet" : formatDateOnly(booking.scheduled_date)}</p>
      <p style="margin:0;"><strong>Time window:</strong> ${booking.scheduled_time_window ?? "Not set yet"}</p>
    </div>
    <p style="margin:0;">We will keep communication clear and simple. If something looks wrong, contact us and we will help.</p>
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: `Your ${BUSINESS_NAME} booking was updated`,
    html: emailShell({
      eyebrow: "Booking Update",
      title: "Your Booking Was Updated",
      body,
    }),
    text: `Hi ${booking.customer_name}, your booking status is now ${formatTitle(booking.status)}.`,
  });
}

export function customerJobAcceptedEmail(
  booking: BookingRecord,
  paymentLinks?: { depositUrl?: string | null; fullUrl?: string | null },
) {
  const payDeposit = paymentLinks?.depositUrl
    ? `<a href="${paymentLinks.depositUrl}" style="display:inline-block;margin:10px 8px 0 0;padding:12px 18px;border-radius:999px;background:#0B67F0;color:#FFFFFF;text-decoration:none;font-weight:800;">Pay upfront fee</a>`
    : "";
  const payFull = paymentLinks?.fullUrl
    ? `<a href="${paymentLinks.fullUrl}" style="display:inline-block;margin:10px 0 0 0;padding:12px 18px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:#FFFFFF;text-decoration:none;font-weight:800;">Pay in full</a>`
    : "";
  const paymentCopy =
    payDeposit || payFull
      ? `<p style="margin:18px 0 8px 0;">Your job is approved. Choose how you want to lock it in:</p>${payDeposit}${payFull}`
      : `<p style="margin:18px 0 0 0;">Your job is approved and no online payment is needed right now.</p>`;

  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">Good news — we accepted your ${BUSINESS_NAME} request.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${formatServiceList(booking.primary_service)}</p>
      <p style="margin:0 0 8px 0;"><strong>Scheduled date:</strong> ${formatDateOnly(booking.scheduled_date || booking.preferred_date)}</p>
      <p style="margin:0 0 8px 0;"><strong>Time window:</strong> ${booking.scheduled_time_window || booking.preferred_time_window}</p>
      <p style="margin:0;"><strong>Total:</strong> ${formatCurrency(booking.quote_total)}</p>
    </div>
    ${quoteSummaryTable(booking)}
    ${paymentCopy}
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: "Your CURBSIDE job was accepted",
    html: emailShell({
      eyebrow: "Job Accepted",
      title: "You Are Approved",
      body,
    }),
    text: `Hi ${booking.customer_name}, your CURBSIDE job was accepted. Total: ${formatCurrency(booking.quote_total)}.`,
  });
}

export function customerJobDeclinedEmail(booking: BookingRecord) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">Thank you for reaching out. We reviewed the request and cannot take this job as submitted.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Service:</strong> ${formatServiceList(booking.primary_service)}</p>
      <p style="margin:0;"><strong>Status:</strong> Not accepted</p>
    </div>
    <p style="margin:0;">If you think something was entered wrong, reply to this email or message us on Instagram and we can take another look.</p>
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: "Update on your CURBSIDE request",
    html: emailShell({
      eyebrow: "Request Update",
      title: "We Cannot Take This One",
      body,
    }),
    text: `Hi ${booking.customer_name}, we reviewed your CURBSIDE request and cannot take this job as submitted.`,
  });
}

export function customerRescheduleRequestedEmail(booking: BookingRecord) {
  const token = booking.customer_action_token;
  const responseUrl = `${SITE_URL}/book/respond?token=${token}`;
  const acceptUrl = `${SITE_URL}/api/bookings/respond?token=${token}&action=accept`;
  const declineUrl = `${SITE_URL}/api/bookings/respond?token=${token}&action=decline`;

  const body = `
    <p style="margin:0 0 14px 0;">Hi ${booking.customer_name},</p>
    <p style="margin:0 0 14px 0;">We need to adjust your appointment time. Please review this proposed slot:</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>New date:</strong> ${formatDateOnly(booking.scheduled_date)}</p>
      <p style="margin:0;"><strong>New time:</strong> ${booking.scheduled_time_window ?? "Not set yet"}</p>
    </div>
    <a href="${acceptUrl}" style="display:inline-block;margin:6px 8px 0 0;padding:12px 18px;border-radius:999px;background:#0B67F0;color:#FFFFFF;text-decoration:none;font-weight:800;">Accept this time</a>
    <a href="${responseUrl}" style="display:inline-block;margin:6px 8px 0 0;padding:12px 18px;border-radius:999px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.16);color:#FFFFFF;text-decoration:none;font-weight:800;">Choose another time</a>
    <a href="${declineUrl}" style="display:inline-block;margin:6px 0 0 0;padding:12px 18px;border-radius:999px;background:rgba(244,63,94,0.16);border:1px solid rgba(244,63,94,0.28);color:#FFFFFF;text-decoration:none;font-weight:800;">Cancel request</a>
  `;

  return sendTransactionalEmail({
    to: booking.email,
    subject: "Please confirm your new CURBSIDE time",
    html: emailShell({
      eyebrow: "Reschedule",
      title: "Does This Time Work?",
      body,
    }),
    text: `Hi ${booking.customer_name}, please confirm your new CURBSIDE time: ${formatDateOnly(booking.scheduled_date)} ${booking.scheduled_time_window}. ${responseUrl}`,
  });
}

function marketingFooter(subscriber: SubscriberRecord) {
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
  return `${BUSINESS_NAME}<br />${BUSINESS_PHONE_DISPLAY}<br />Instagram ${BUSINESS_INSTAGRAM_HANDLE}<br />You can unsubscribe from email updates any time: <a href="${unsubscribeUrl}" style="color:#7DD3FC;">Unsubscribe</a>`;
}

export function sendMarketingWelcomeEmail(subscriber: SubscriberRecord) {
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${subscriber.first_name || "there"},</p>
    <p style="margin:0 0 14px 0;">You are on the CURBSIDE email list.</p>
    <p style="margin:0 0 14px 0;">We use this list for useful seasonal reminders, simple service offers, and occasional cleanup ideas for homeowners in and around Marietta.</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>What to expect:</strong> a light, seasonal email rhythm instead of constant promotions.</p>
      <p style="margin:0;"><strong>Any time:</strong> you can unsubscribe with one click at the bottom of every email.</p>
    </div>
    <p style="margin:0;">If you want a quote sooner, you can book online or text us directly.</p>
  `;

  return sendTransactionalEmail({
    to: subscriber.email,
    subject: "You are on the CURBSIDE list",
    html: emailShell({
      eyebrow: "Email List",
      title: "Thanks For Signing Up",
      body,
      footer: marketingFooter(subscriber),
    }),
    text: `Hi ${subscriber.first_name || "there"}, you are on the CURBSIDE email list. We send occasional seasonal service emails, and you can unsubscribe at any time.`,
  });
}

export function marketingCampaignEmail(subscriber: SubscriberRecord, month = new Date().getMonth() + 1) {
  const campaign = getCampaignForMonth(month);
  const body = `
    <p style="margin:0 0 14px 0;">Hi ${subscriber.first_name || "there"},</p>
    <p style="margin:0 0 14px 0;">${campaign.body}</p>
    <div style="padding:18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);margin-bottom:18px;">
      <p style="margin:0 0 8px 0;"><strong>Good fit for:</strong> driveways, walkways, patios, siding, fences, and trash can cleaning.</p>
      <p style="margin:0;"><strong>Best next step:</strong> book online, text us, or DM @curbsideexterior.</p>
    </div>
    <p style="margin:0;"><a href="${SITE_URL}/book" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#12B6FF_0%,#009DFF_55%,#0567D8_100%);color:#FFFFFF;text-decoration:none;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${campaign.cta}</a></p>
  `;

  return sendTransactionalEmail({
    to: subscriber.email,
    subject: campaign.subject,
    html: emailShell({
      eyebrow: campaign.preview,
      title: campaign.headline,
      body,
      footer: marketingFooter(subscriber),
    }),
    text: `${campaign.headline}. ${campaign.body} ${campaign.cta}: ${SITE_URL}/book`,
  });
}

export function customerInfoList(booking: BookingRecord) {
  return [
    ["Booking ID", booking.id],
    ["Created", formatDateTime(booking.created_at)],
    ["Customer", booking.customer_name],
    ["Phone", booking.phone],
    ["Email", booking.email],
    ["Instagram", booking.instagram_handle || "None given"],
    ["Status", formatTitle(booking.status)],
    ["Service", formatServiceList(booking.primary_service)],
    ["Frequency", formatTitle(booking.frequency)],
    ["Property type", formatTitle(booking.property_type)],
    ["Address", `${booking.address_line_1}, ${booking.city}, ${booking.state} ${booking.zip}`],
    ["Preferred date", formatDateOnly(booking.preferred_date)],
    ["Preferred time", booking.preferred_time_window],
    ["Scheduled date", formatDateOnly(booking.scheduled_date)],
    ["Scheduled time", booking.scheduled_time_window || "Not set"],
    ["Distance", booking.distance_miles != null ? `${booking.distance_miles} miles` : "Unknown"],
    ["Travel fee", booking.travel_surcharge > 0 ? formatCurrency(booking.travel_surcharge) : "None"],
    ["Stain level", booking.heavy_stain_level ? formatTitle(booking.heavy_stain_level) : "Not given"],
    ["Bins", booking.bins_count ? String(booking.bins_count) : "None"],
    ["Gate code needed", formatBoolean(booking.gate_code_needed)],
    ["Gate code", booking.gate_code || "None given"],
    ["Driveway sqft", booking.driveway_sqft ? String(booking.driveway_sqft) : "Not given"],
    ["Walkway sqft", booking.walkway_sqft ? String(booking.walkway_sqft) : "Not given"],
    ["Patio sqft", booking.patio_sqft ? String(booking.patio_sqft) : "Not given"],
    ["House sqft", booking.house_sqft ? String(booking.house_sqft) : "Not given"],
    ["Fence linear feet", booking.fence_linear_feet ? String(booking.fence_linear_feet) : "Not given"],
    ["Uploaded photos", Array.isArray(booking.photo_urls) && booking.photo_urls.length > 0 ? `${booking.photo_urls.length} photo(s)` : "None"],
    ["Referral source", booking.referral_source || "Not given"],
    ["Customer notes", booking.notes || "None"],
    ["Owner notes", booking.owner_notes || "None"],
    ["SMS opt-in", formatBoolean(booking.sms_opt_in)],
    ["Email opt-in", formatBoolean(booking.email_opt_in)],
    ["Terms accepted", formatBoolean(booking.terms_accepted)],
    ["Privacy accepted", formatBoolean(booking.privacy_accepted)],
    ["Payment mode", formatTitle(booking.payment_mode)],
    ["Payment status", booking.stripe_payment_status ? formatTitle(booking.stripe_payment_status) : "Not paid yet"],
    ["Quote total", formatCurrency(booking.quote_total)],
    ["Deposit due", booking.deposit_due > 0 ? formatCurrency(booking.deposit_due) : "None"],
  ] as const;
}
