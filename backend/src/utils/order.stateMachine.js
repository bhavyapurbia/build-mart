import { ApiError } from './ApiError.js';

/**
 * Valid order status states and their allowable next transitions.
 */
export const ALLOWED_TRANSITIONS = {
  'Pending Review': ['Quotation Sent', 'Confirmed', 'Cancelled'],
  'Quotation Sent': ['Confirmed', 'Cancelled'],
  'Awaiting Customer Approval': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Processing', 'Cancelled'],
  'Processing': ['Ready for Dispatch', 'Cancelled'],
  'Ready for Dispatch': ['Out for Delivery'], // Cancellation not allowed after ready for dispatch
  'Out for Delivery': ['Delivered'],
  'Delivered': [], // Terminal
  'Cancelled': []  // Terminal
};

/**
 * Validates if a transition from currentStatus to nextStatus is permissible.
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @throws {ApiError} 409 Conflict if transition is not allowed.
 */
export function validateOrderTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new ApiError(
      409,
      `Invalid order status transition from "${currentStatus}" to "${nextStatus}". Allowed transitions: ${allowed.join(', ') || 'None (Terminal state)'}`
    );
  }
  return true;
}

export function canCustomerCancel(status) {
  const cancellableStatuses = ['Pending Review', 'Quotation Sent', 'Awaiting Customer Approval', 'Confirmed', 'Processing'];
  return cancellableStatuses.includes(status);
}

export default {
  ALLOWED_TRANSITIONS,
  validateOrderTransition,
  canCustomerCancel
};

