import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// ==========================================================
// STRIPE CLIENT
// ==========================================================

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);


// ==========================================================
// GENERATE INVOICE NUMBER
// ==========================================================

const generateInvoiceNumber = () => {

  const year =
    new Date().getFullYear();

  const random =
    Math.floor(
      1000 +
      Math.random() * 9000
    );

  return `INV-${year}-${random}`;
};


// ==========================================================
// GET SERVICE PRICE
//
// PROJECT PRICE:
//
// Live Chat  = ৳50
// Video Call = ৳100
// Home Visit = ৳300
//
// Ei amount DB + Invoice-e thakbe.
// ==========================================================

const getServiceAmount = (
  serviceMethod
) => {

  const method =
    String(
      serviceMethod || ''
    )
      .toLowerCase()
      .trim();


  if (
    method.includes('video')
  ) {

    return 100;
  }


  if (
    method.includes('home') ||
    method.includes('visit')
  ) {

    return 300;
  }


  return 50;
};


// ==========================================================
// STRIPE TEST CHECKOUT AMOUNT
//
// Project-er actual service price change korchi na.
//
// Stripe sandbox minimum charge issue avoid korar jonno
// test checkout-e USD amount use korchi.
//
// Live Chat  -> $1.00 test payment
// Video Call -> $2.00 test payment
// Home Visit -> $3.00 test payment
//
// Actual TechAid invoice:
// ৳50 / ৳100 / ৳300
// ==========================================================

const getStripeTestAmount = (
  serviceMethod
) => {

  const method =
    String(
      serviceMethod || ''
    )
      .toLowerCase()
      .trim();


  if (
    method.includes('video')
  ) {

    // $2.00 = 200 cents
    return 200;
  }


  if (
    method.includes('home') ||
    method.includes('visit')
  ) {

    // $3.00 = 300 cents
    return 300;
  }


  // Live Chat
  // $1.00 = 100 cents
  return 100;
};


// ==========================================================
// CREATE STRIPE CHECKOUT SESSION
//
// POST /api/payments/create-checkout-session
// ==========================================================

export const createCheckoutSession =
  async (
    req,
    res
  ) => {

    try {

      const {
        serviceRequestId
      } = req.body;


      // ----------------------------------------------------
      // VALIDATION
      // ----------------------------------------------------

      if (
        !serviceRequestId
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Service request ID is required.'
        });
      }


      if (
        !process.env.STRIPE_SECRET_KEY
      ) {

        return res.status(500).json({

          success: false,

          message:
            'Stripe secret key is not configured.'
        });
      }


      // ----------------------------------------------------
      // FIND SERVICE REQUEST
      // ----------------------------------------------------

      const serviceRequest =
        await prisma.serviceRequest.findUnique({

          where: {

            id:
              serviceRequestId
          },

          include: {

            customer:
              true
          }
        });


      if (
        !serviceRequest
      ) {

        return res.status(404).json({

          success: false,

          message:
            'Service request not found.'
        });
      }


      // ----------------------------------------------------
      // PAYMENT ONLY AFTER SERVICE COMPLETED
      // ----------------------------------------------------

      if (
        String(
          serviceRequest.status
        ).toUpperCase() !==
        'COMPLETED'
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Payment is available only after the service is completed.'
        });
      }


      // ----------------------------------------------------
      // GET ACCEPTED TECHNICIAN
      // ----------------------------------------------------

      const assignment =
        await prisma.technicianAssignment.findFirst({

          where: {

            serviceRequestId:
              serviceRequest.id,

            status:
              'ACCEPTED'
          },

          orderBy: {

            attempt:
              'desc'
          }
        });


      if (
        !assignment
      ) {

        return res.status(404).json({

          success: false,

          message:
            'Accepted technician assignment not found.'
        });
      }


      const technician =
        await prisma.technician.findUnique({

          where: {

            id:
              assignment.technicianId
          },

          include: {

            user:
              true
          }
        });


      if (
        !technician
      ) {

        return res.status(404).json({

          success: false,

          message:
            'Assigned technician not found.'
        });
      }


      // ----------------------------------------------------
      // CHECK EXISTING PAID PAYMENT
      // ----------------------------------------------------

      const alreadyPaid =
        await prisma.payment.findFirst({

          where: {

            serviceRequestId:
              serviceRequest.id,

            status:
              'PAID'
          }
        });


      if (
        alreadyPaid
      ) {

        return res.status(409).json({

          success: false,

          alreadyPaid: true,

          message:
            'Payment for this service has already been completed.',

          data:
            alreadyPaid
        });
      }


      // ----------------------------------------------------
      // PROJECT SERVICE AMOUNT
      //
      // This remains BDT for TechAid DB + invoice.
      // ----------------------------------------------------

      const amount =
        getServiceAmount(
          serviceRequest.serviceMethod
        );


      // ----------------------------------------------------
      // STRIPE TEST AMOUNT
      //
      // Stripe unit_amount uses smallest currency unit.
      //
      // 100 = $1.00
      // 200 = $2.00
      // 300 = $3.00
      // ----------------------------------------------------

      const stripeAmount =
        getStripeTestAmount(
          serviceRequest.serviceMethod
        );


      // ----------------------------------------------------
      // INVOICE NUMBER
      // ----------------------------------------------------

      let invoiceNumber =
        generateInvoiceNumber();


      let invoiceExists =
        await prisma.payment.findUnique({

          where: {

            invoiceNumber
          }
        });


      while (
        invoiceExists
      ) {

        invoiceNumber =
          generateInvoiceNumber();


        invoiceExists =
          await prisma.payment.findUnique({

            where: {

              invoiceNumber
            }
          });
      }


      // ----------------------------------------------------
      // CREATE PENDING PAYMENT RECORD
      //
      // Actual project payment amount BDT-te save hobe.
      // ----------------------------------------------------

      const payment =
        await prisma.payment.create({

          data: {

            customerId:
              serviceRequest.customerId,

            technicianId:
              technician.id,

            serviceRequestId:
              serviceRequest.id,

            serviceTitle:
              serviceRequest.title,

            serviceMethod:
              serviceRequest.serviceMethod,

            amount,

            currency:
              'bdt',

            status:
              'PENDING',

            invoiceNumber,

            paymentMethod:
              'STRIPE_TEST'
          }
        });


      const clientUrl =
        process.env.CLIENT_URL ||
        'http://localhost:3000';


      // ====================================================
      // DEBUG STRIPE CHECKOUT VALUES
      //
      // Terminal-e exact amount/currency dekhabe.
      // ====================================================

      console.log(
        '============================================'
      );

      console.log(
        'STRIPE CHECKOUT DEBUG:',
        {
          serviceRequestId:
            serviceRequest.id,

          serviceMethod:
            serviceRequest.serviceMethod,

          projectAmountBDT:
            amount,

          stripeAmount:
            stripeAmount,

          stripeCurrency:
            'usd',

          customerEmail:
            serviceRequest.customer?.email ||
            null
        }
      );

      console.log(
        '============================================'
      );


      // ----------------------------------------------------
      // CREATE REAL STRIPE TEST CHECKOUT SESSION
      // ----------------------------------------------------

      const session =
        await stripe.checkout.sessions.create({

          mode:
            'payment',

          payment_method_types: [
            'card'
          ],

          customer_email:
            serviceRequest.customer?.email ||
            undefined,

          line_items: [

            {

              price_data: {

                // Stripe sandbox charge currency
                currency:
                  'usd',

                product_data: {

                  name:
                    `TechAid - ${serviceRequest.deviceCategory} Support`,

                  description:
                    `${serviceRequest.serviceMethod} with ${technician.name} | TechAid service fee: ৳${amount}`
                },

                unit_amount:
                  stripeAmount
              },

              quantity:
                1
            }
          ],

          metadata: {

            paymentId:
              payment.id,

            serviceRequestId:
              serviceRequest.id,

            customerId:
              serviceRequest.customerId,

            technicianId:
              technician.id,

            invoiceNumber,

            actualServiceAmountBDT:
              String(
                amount
              )
          },

          success_url:
            `${clientUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${clientUrl}/?payment=cancelled`
        });


      // ----------------------------------------------------
      // SAVE STRIPE SESSION ID
      // ----------------------------------------------------

      const updatedPayment =
        await prisma.payment.update({

          where: {

            id:
              payment.id
          },

          data: {

            stripeSessionId:
              session.id
          }
        });


      return res.status(201).json({

        success: true,

        message:
          'Stripe Checkout Session created successfully.',

        data: {

          payment:
            updatedPayment,

          checkoutSessionId:
            session.id,

          checkoutUrl:
            session.url,


          // Actual TechAid service amount
          actualAmount: {

            amount,

            currency:
              'BDT'
          },


          // Stripe sandbox test transaction amount
          stripeTestAmount: {

            amount:
              stripeAmount / 100,

            currency:
              'USD'
          },


          technician: {

            id:
              technician.id,

            name:
              technician.name,

            specialty:
              technician.specialty
          },


          serviceRequest: {

            id:
              serviceRequest.id,

            trackingId:
              serviceRequest.trackingId,

            title:
              serviceRequest.title,

            deviceCategory:
              serviceRequest.deviceCategory,

            serviceMethod:
              serviceRequest.serviceMethod
          }
        }
      });


    } catch (error) {

      console.error(
        '============================================'
      );

      console.error(
        'Create Stripe checkout session error:'
      );

      console.error(
        'MESSAGE:',
        error?.message
      );

      console.error(
        'TYPE:',
        error?.type
      );

      console.error(
        'CODE:',
        error?.code
      );

      console.error(
        'STATUS CODE:',
        error?.statusCode
      );

      console.error(
        'FULL ERROR:',
        error
      );

      console.error(
        '============================================'
      );


      return res.status(500).json({

        success: false,

        message:
          'Unable to create Stripe Checkout Session.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// VERIFY STRIPE PAYMENT
//
// GET /api/payments/verify/:sessionId
// ==========================================================

export const verifyStripePayment =
  async (
    req,
    res
  ) => {

    try {

      const {
        sessionId
      } = req.params;


      if (
        !sessionId
      ) {

        return res.status(400).json({

          success: false,

          message:
            'Stripe session ID is required.'
        });
      }


      // ----------------------------------------------------
      // RETRIEVE SESSION DIRECTLY FROM STRIPE
      // ----------------------------------------------------

      const session =
        await stripe.checkout.sessions.retrieve(
          sessionId
        );


      const payment =
        await prisma.payment.findUnique({

          where: {

            stripeSessionId:
              sessionId
          }
        });


      if (
        !payment
      ) {

        return res.status(404).json({

          success: false,

          message:
            'Payment record not found.'
        });
      }


      // ----------------------------------------------------
      // STRIPE PAYMENT SUCCESS
      // ----------------------------------------------------

      if (
        session.payment_status ===
        'paid'
      ) {

        const updatedPayment =
          await prisma.payment.update({

            where: {

              id:
                payment.id
            },

            data: {

              status:
                'PAID',

              stripePaymentIntentId:
                typeof session.payment_intent ===
                'string'
                  ? session.payment_intent
                  : null,

              paidAt:
                payment.paidAt ||
                new Date()
            }
          });


        return res.json({

          success: true,

          paid: true,

          message:
            'Payment verified successfully.',

          data: {

            payment:
              updatedPayment,

            stripe: {

              sessionId:
                session.id,

              paymentStatus:
                session.payment_status,

              customerEmail:
                session.customer_details
                  ?.email ||
                session.customer_email ||
                null
            }
          }
        });
      }


      // ----------------------------------------------------
      // PAYMENT NOT YET PAID
      // ----------------------------------------------------

      return res.json({

        success: true,

        paid: false,

        message:
          'Stripe payment has not been completed yet.',

        data: {

          payment,

          stripe: {

            sessionId:
              session.id,

            paymentStatus:
              session.payment_status
          }
        }
      });


    } catch (error) {

      console.error(
        'Verify Stripe payment error:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Unable to verify Stripe payment.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET CUSTOMER PAYMENT HISTORY
//
// GET /api/payments/customer/:customerId
// ==========================================================

export const getCustomerPayments =
  async (
    req,
    res
  ) => {

    try {

      const {
        customerId
      } = req.params;


      const payments =
        await prisma.payment.findMany({

          where: {

            customerId
          },

          orderBy: {

            createdAt:
              'desc'
          }
        });


      return res.json({

        success: true,

        count:
          payments.length,

        data:
          payments
      });


    } catch (error) {

      console.error(
        'Get payment history error:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Unable to load payment history.',

        details:
          error.message
      });
    }
  };


// ==========================================================
// GET DIGITAL INVOICE
//
// GET /api/payments/:paymentId/invoice
// ==========================================================

export const getPaymentInvoice =
  async (
    req,
    res
  ) => {

    try {

      const {
        paymentId
      } = req.params;


      const payment =
        await prisma.payment.findUnique({

          where: {

            id:
              paymentId
          }
        });


      if (
        !payment
      ) {

        return res.status(404).json({

          success: false,

          message:
            'Payment invoice not found.'
        });
      }


      const serviceRequest =
        await prisma.serviceRequest.findUnique({

          where: {

            id:
              payment.serviceRequestId
          },

          include: {

            customer:
              true
          }
        });


      const technician =
        await prisma.technician.findUnique({

          where: {

            id:
              payment.technicianId
          },

          include: {

            user:
              true
          }
        });


      return res.json({

        success: true,

        data: {

          invoiceNumber:
            payment.invoiceNumber,

          paymentId:
            payment.id,

          paymentStatus:
            payment.status,

          paymentMethod:
            payment.paymentMethod,

          amount:
            payment.amount,

          currency:
            payment.currency,

          paidAt:
            payment.paidAt,

          createdAt:
            payment.createdAt,


          service: {

            serviceRequestId:
              payment.serviceRequestId,

            trackingId:
              serviceRequest?.trackingId ||
              null,

            title:
              payment.serviceTitle,

            deviceCategory:
              serviceRequest?.deviceCategory ||
              null,

            method:
              payment.serviceMethod
          },


          customer: {

            id:
              payment.customerId,

            name:
              serviceRequest?.customer?.name ||
              null,

            email:
              serviceRequest?.customer?.email ||
              null,

            phone:
              serviceRequest?.customer?.phone ||
              null
          },


          technician: {

            id:
              payment.technicianId,

            name:
              technician?.name ||
              null,

            specialty:
              technician?.specialty ||
              null,

            email:
              technician?.user?.email ||
              null,

            phone:
              technician?.user?.phone ||
              null
          },


          stripe: {

            sessionId:
              payment.stripeSessionId,

            paymentIntentId:
              payment.stripePaymentIntentId
          }
        }
      });


    } catch (error) {

      console.error(
        'Get invoice error:',
        error
      );


      return res.status(500).json({

        success: false,

        message:
          'Unable to load payment invoice.',

        details:
          error.message
      });
    }
  };