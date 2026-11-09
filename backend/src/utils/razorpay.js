import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn(
    '[Razorpay] WARNING: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. ' +
    'Razorpay payments will not function until configured.'
  );
} else {
  console.log('[Razorpay] Initialized in ' + (RAZORPAY_KEY_ID.startsWith('rzp_test') ? 'TEST' : 'LIVE') + ' mode.');
}

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

export default razorpay;
export { razorpay, RAZORPAY_KEY_ID };
