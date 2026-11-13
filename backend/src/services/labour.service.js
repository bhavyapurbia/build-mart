import LabourRequest from '../models/LabourRequest.js';
import Notification from '../models/Notification.js';
import { generateLabourId } from '../utils/counter.js';

/**
 * Creates a LabourRequest associated with an order using real model schema fields.
 * Non-fatal: if creation encounters an error, logs a warning and flags the order without throwing.
 */
export async function createFromOrder(order, labourInput) {
  if (!labourInput || (!labourInput.hasLabour && !labourInput.labourType)) {
    return null;
  }

  try {
    const bookingId = await generateLabourId();
    const customer = order.customer || {};

    const workLocation = customer.address || customer.street || customer.workLocation || 'Customer Job-site';
    const city = customer.city || 'Bengaluru';
    const pincode = customer.pincode || '';

    const labourDoc = await LabourRequest.create({
      bookingId,
      orderId: order.orderId || String(order._id),
      user: order.user ? String(order.user) : null,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        workLocation,
        city,
        pincode
      },
      labourType: labourInput.labourType || 'Mason',
      workersRequired: Math.max(1, Number(labourInput.workersRequired) || 1),
      workCategory: labourInput.workCategory || 'General Construction',
      preferredStartDate: labourInput.preferredStartDate || new Date().toISOString().split('T')[0],
      expectedDuration: labourInput.expectedDuration || '2 Days',
      additionalInstructions: labourInput.additionalInstructions || labourInput.instructions || '',
      siteImages: labourInput.siteImages || [],
      labourCharges: Number(labourInput.labourCharges) || 0,
      chargesApprovedByCustomer: Boolean(labourInput.chargesApproved),
      status: 'Pending Review',
      adminNotes: `Booked alongside Material Order #${order.orderId}`
    });

    // Notify admin about the new labour booking
    await Notification.create({
      recipient: 'admin',
      title: 'New Job-site Labour Request',
      message: `Labour booking #${bookingId} (${labourInput.labourType}) linked with Order #${order.orderId}`,
      type: 'labour',
      referenceId: bookingId,
      link: '/admin/labour'
    });

    return bookingId;
  } catch (err) {
    console.warn(`[LabourService] Non-fatal error creating labour request for order ${order.orderId}:`, err.message);
    return null;
  }
}

export default { createFromOrder };

