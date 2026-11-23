// WhatsApp integration helper for Cafe-Connect-Hub

// Default Cafe WhatsApp business number (can be customized by owner)
export const CAFE_WHATSAPP_NUMBER = "919168583306";
export const CAFE_NAME = "Bean & Brew";

/**
 * Generate a clean wa.me direct chat link
 * @param {string} phone - Target phone number with country code (no + or spaces)
 * @param {string} message - Pre-filled message
 */
export function createWhatsAppLink(phone = CAFE_WHATSAPP_NUMBER, message = "") {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
}

/**
 * Format full order receipt into an elegant WhatsApp message
 */
export function formatOrderReceiptWhatsApp({
  orderId,
  tableNumber,
  items,
  total,
  customerName,
  mobileNumber,
  paymentMode,
  notes,
  orderType = "Dine-in"
}) {
  const itemListText = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.name} (₹${(Number(item.price) * item.quantity).toFixed(2)})`
    )
    .join("\n");

  const tableInfo = tableNumber ? `🪑 *Table Number:* Table #${tableNumber}\n` : "";
  const notesInfo = notes ? `📝 *Special Requests:* ${notes}\n` : "";

  return (
    `☕ *${CAFE_NAME} - Order Confirmation*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🧾 *Order ID:* #${orderId}\n` +
    `🛎️ *Order Type:* ${tableNumber ? "Dine-in (Table Service)" : orderType}\n` +
    tableInfo +
    `👤 *Customer:* ${customerName} (${mobileNumber})\n` +
    `💳 *Payment Mode:* ${paymentMode || "Pay at Counter"}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🍽️ *Ordered Items:*\n` +
    `${itemListText}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Total Amount:* ₹${Number(total).toFixed(2)}\n` +
    notesInfo +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Thank you for ordering with ${CAFE_NAME}! We're preparing your food now._`
  );
}

/**
 * Quick assistance messages
 */
export const QUICK_WHATSAPP_MESSAGES = [
  {
    title: "Need Table Service / Waiter",
    text: (table) => `Hi ${CAFE_NAME}, I'm at Table #${table || "..."} and I need assistance from a waiter.`,
  },
  {
    title: "Wi-Fi Password",
    text: () => `Hi ${CAFE_NAME}, could you please share the café Wi-Fi password?`,
  },
  {
    title: "Check Order Status",
    text: (table) => `Hi, I would like to check on my order${table ? ` for Table #${table}` : ""}.`,
  },
  {
    title: "General Inquiry",
    text: () => `Hi ${CAFE_NAME}, I have a question about your menu and reservations.`,
  },
];
