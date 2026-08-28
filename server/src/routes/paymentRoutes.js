import express from 'express';

import {
  createCheckoutSession,
  verifyStripePayment,
  getCustomerPayments,
  getPaymentInvoice
} from '../controllers/paymentController.js';


const router =
  express.Router();


// ==========================================================
// MODULE 2 FEATURE 4
// SECURE PAYMENT & INVOICE SYSTEM
// ==========================================================


// Create Stripe Checkout Session
router.post(
  '/create-checkout-session',
  createCheckoutSession
);


// Verify Stripe payment after success redirect
router.get(
  '/verify/:sessionId',
  verifyStripePayment
);


// Customer payment history
router.get(
  '/customer/:customerId',
  getCustomerPayments
);


// Digital invoice
router.get(
  '/:paymentId/invoice',
  getPaymentInvoice
);


export default router;