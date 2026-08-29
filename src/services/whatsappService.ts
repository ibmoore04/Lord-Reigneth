// ============================================================
// WhatsApp Service — all WhatsApp message generation.
// One source of truth for the WhatsApp number and message format.
// ============================================================

import { SITE_CONFIG } from '../config/site';
import type { CartItem, Location, OrderType } from '../types/database';

export interface WhatsAppOrderDetails {
  items: CartItem[];
  orderType: OrderType;
  location?: Location | null;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliveryLandmark?: string;
  specialRequest?: string;
}

/**
 * Generate a structured WhatsApp order message.
 * Prices are included only when available in the cart item.
 */
export function generateWhatsAppOrderMessage(details: WhatsAppOrderDetails): string {
  const { items, orderType, location, customerName, customerPhone, deliveryAddress, deliveryLandmark, specialRequest } = details;

  const hasAllPrices = items.every((i) => i.price > 0);

  const itemLines = items
    .map((item) => {
      const line = `• ${item.name} × ${item.quantity}`;
      return hasAllPrices
        ? `${line} — ₦${(item.price * item.quantity).toLocaleString()}`
        : line;
    })
    .join('\n');

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  let message = `Hello Lord Reigneth Foods 👋\nI would like to place an order.\n`;
  message += `\n*ORDER ITEMS*\n${itemLines}\n`;

  if (hasAllPrices) {
    message += `\n*SUBTOTAL*\n₦${subtotal.toLocaleString()}\n`;
  }

  message += `\n*ORDER TYPE*\n${orderType === 'delivery' ? 'Delivery' : 'Pickup'}\n`;

  if (location) {
    message += `\n*LOCATION*\n${location.name}`;
    if (location.address) message += ` — ${location.address}`;
    message += '\n';
  }

  if (customerName) message += `\n*CUSTOMER NAME*\n${customerName}\n`;
  if (customerPhone) message += `\n*PHONE*\n${customerPhone}\n`;

  if (orderType === 'delivery' && deliveryAddress) {
    message += `\n*DELIVERY ADDRESS*\n${deliveryAddress}`;
    if (deliveryLandmark) message += `\nLandmark: ${deliveryLandmark}`;
    message += '\n';
  }

  if (specialRequest) message += `\n*SPECIAL REQUEST*\n${specialRequest}\n`;

  message += `\nPlease confirm my order and send the total.`;

  return message;
}

/**
 * Build a WhatsApp single-item quick enquiry message.
 * Used when tapping "Order via WhatsApp" on a food card.
 */
export function generateItemEnquiryMessage(itemName: string): string {
  return `Hello Lord Reigneth Foods 👋\nI would like to order *${itemName}*.\nPlease send me the available options and price.`;
}

/**
 * Build the final wa.me deep-link URL.
 */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with a pre-built message.
 * Safe for both mobile and desktop.
 */
export function openWhatsApp(message: string): void {
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}
