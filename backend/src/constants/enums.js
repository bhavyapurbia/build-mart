/**
 * Central domain enums for BuildMart platform.
 */
export const ORDER_STATUS = {
  PENDING_REVIEW: 'Pending Review',
  QUOTATION_SENT: 'Quotation Sent',
  AWAITING_APPROVAL: 'Awaiting Customer Approval',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  READY_FOR_DISPATCH: 'Ready for Dispatch',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partially Refunded',
  FAILED: 'Failed'
};

export const PAYMENT_METHOD = {
  COD: 'COD',
  ONLINE: 'Online',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_ON_APPROVAL: 'Credit on Approval',
  RAZORPAY: 'Razorpay'
};

export const PAYMENT_GATEWAY_STATUS = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  PROCESSING: 'processing',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
  NEEDS_ATTENTION: 'needs_attention',
  EXPIRED: 'expired'
};

export const QUOTATION_STATUS = {
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CONVERTED_TO_ORDER: 'Converted to Order'
};

export const MATERIAL_REQUEST_STATUS = {
  PENDING_REVIEW: 'Pending Review',
  QUOTATION_SENT: 'Quotation Sent',
  QUOTATION_ACCEPTED: 'Quotation Accepted',
  QUOTATION_REJECTED: 'Quotation Rejected',
  CONVERTED_TO_ORDER: 'Converted to Order',
  CANCELLED: 'Cancelled'
};

export const LABOUR_TYPE = {
  MASON: 'Mason',
  TILE_WORKER: 'Tile worker',
  PLUMBER: 'Plumber',
  GENERAL_CONSTRUCTION: 'General construction worker',
  WATERPROOFING: 'Waterproofing worker',
  OTHER: 'Other'
};

export const LABOUR_STATUS = {
  PENDING_REVIEW: 'Pending Review',
  QUOTED: 'Quoted',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled'
};

export const BULK_ENQUIRY_STATUS = {
  RECEIVED: 'Received',
  UNDER_REVIEW: 'Under Review',
  QUOTATION_SENT: 'Quotation Sent',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CONVERTED_TO_ORDER: 'Converted to Order'
};

export const USER_ROLE = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SUPPORT: 'support'
};

export const NOTIFICATION_RECIPIENT = {
  ADMIN: 'admin',
  CUSTOMER: 'customer'
};

export const NOTIFICATION_TYPE = {
  MATERIAL_REQUEST: 'material_request',
  QUOTATION: 'quotation',
  ORDER: 'order',
  LABOUR: 'labour',
  BULK: 'bulk',
  STOCK: 'stock',
  PAYMENT: 'payment',
  REVIEW: 'review'
};

export default {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_GATEWAY_STATUS,
  QUOTATION_STATUS,
  MATERIAL_REQUEST_STATUS,
  LABOUR_TYPE,
  LABOUR_STATUS,
  BULK_ENQUIRY_STATUS,
  USER_ROLE,
  NOTIFICATION_RECIPIENT,
  NOTIFICATION_TYPE
};
