import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material';

import {
  CheckCircle2,
  CreditCard,
  FileText,
  History,
  Receipt,
  RefreshCcw
} from 'lucide-react';

import axios from 'axios';


// ==========================================================
// API BASE
// ==========================================================

const API_BASE =
  'http://localhost:5000/api';


// ==========================================================
// PAYMENT PAGE
// ==========================================================

const Payment = ({
  currentUser
}) => {

  const [
    serviceRequests,
    setServiceRequests
  ] = useState([]);


  const [
    paymentHistory,
    setPaymentHistory
  ] = useState([]);


  const [
    invoice,
    setInvoice
  ] = useState(null);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    payingId,
    setPayingId
  ] = useState(null);


  const [
    verifying,
    setVerifying
  ] = useState(false);


  const [
    error,
    setError
  ] = useState('');


  const [
    message,
    setMessage
  ] = useState('');


  // ========================================================
  // CURRENT CUSTOMER COMPLETED SERVICES
  // ========================================================

  const completedServices =
    useMemo(() => {

      return serviceRequests.filter(
        (request) =>

          request.customerId ===
            currentUser?.id &&

          String(
            request.status
          ).toUpperCase() ===
            'COMPLETED'
      );

    }, [
      serviceRequests,
      currentUser
    ]);


  // ========================================================
  // LOAD REQUESTS
  // ========================================================

  const loadServiceRequests =
    async () => {

      const response =
        await axios.get(
          `${API_BASE}/requests`
        );


      const requests =
        response?.data?.data ||
        response?.data ||
        [];


      setServiceRequests(
        Array.isArray(requests)
          ? requests
          : []
      );
    };


  // ========================================================
  // LOAD PAYMENT HISTORY
  // ========================================================

  const loadPaymentHistory =
    async () => {

      if (
        !currentUser?.id
      ) {
        return;
      }


      const response =
        await axios.get(
          `${API_BASE}/payments/customer/${currentUser.id}`
        );


      setPaymentHistory(
        response?.data?.data ||
        []
      );
    };


  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {

    const load =
      async () => {

        setLoading(true);

        setError('');


        try {

          await Promise.all([
            loadServiceRequests(),
            loadPaymentHistory()
          ]);

        } catch (err) {

          console.error(err);

          setError(
            err?.response?.data?.message ||
            'Unable to load payment information.'
          );

        } finally {

          setLoading(false);
        }
      };


    load();

  }, [currentUser]);


  // ========================================================
  // STRIPE SUCCESS / CANCEL REDIRECT
  // ========================================================

  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search
      );


    const paymentStatus =
      params.get(
        'payment'
      );


    const sessionId =
      params.get(
        'session_id'
      );


    if (
      paymentStatus ===
        'success' &&
      sessionId
    ) {

      verifyPayment(
        sessionId
      );
    }


    if (
      paymentStatus ===
      'cancelled'
    ) {

      setMessage('');

      setError(
        'Stripe payment was cancelled.'
      );


      window.history.replaceState(
        {},
        '',
        window.location.pathname
      );
    }

  }, []);


  // ========================================================
  // CREATE STRIPE CHECKOUT
  // ========================================================

  const handlePay =
    async (
      serviceRequest
    ) => {

      try {

        setPayingId(
          serviceRequest.id
        );

        setError('');

        setMessage('');


        const response =
          await axios.post(
            `${API_BASE}/payments/create-checkout-session`,
            {
              serviceRequestId:
                serviceRequest.id
            }
          );


        const checkoutUrl =
          response?.data?.data
            ?.checkoutUrl;


        if (
          !checkoutUrl
        ) {

          throw new Error(
            'Stripe Checkout URL was not returned.'
          );
        }


        window.location.href =
          checkoutUrl;


      } catch (err) {

        console.error(err);

        setError(
          err?.response?.data?.message ||
          err.message ||
          'Unable to start Stripe payment.'
        );

        setPayingId(null);
      }
    };


  // ========================================================
  // VERIFY STRIPE PAYMENT
  // ========================================================

  const verifyPayment =
    async (
      sessionId
    ) => {

      try {

        setVerifying(true);

        setError('');

        setMessage('');


        const response =
          await axios.get(
            `${API_BASE}/payments/verify/${sessionId}`
          );


        if (
          response?.data?.paid
        ) {

          const payment =
            response?.data?.data
              ?.payment;


          setMessage(
            'Payment completed and verified successfully.'
          );


          if (
            payment?.id
          ) {

            await loadInvoice(
              payment.id
            );
          }


          await loadPaymentHistory();


          window.history.replaceState(
            {},
            '',
            window.location.pathname
          );

        } else {

          setError(
            'Stripe payment has not been completed yet.'
          );
        }

      } catch (err) {

        console.error(err);

        setError(
          err?.response?.data?.message ||
          'Unable to verify Stripe payment.'
        );

      } finally {

        setVerifying(false);
      }
    };


  // ========================================================
  // LOAD INVOICE
  // ========================================================

  const loadInvoice =
    async (
      paymentId
    ) => {

      try {

        setError('');


        const response =
          await axios.get(
            `${API_BASE}/payments/${paymentId}/invoice`
          );


        setInvoice(
          response?.data?.data ||
          null
        );

      } catch (err) {

        console.error(err);

        setError(
          err?.response?.data?.message ||
          'Unable to load invoice.'
        );
      }
    };


  // ========================================================
  // FORMAT AMOUNT
  // ========================================================

  const formatAmount =
    (value) => {

      const amount =
        Number(
          value
        );


      if (
        Number.isNaN(
          amount
        )
      ) {

        return '৳0';
      }


      return `৳${amount.toFixed(2)}`;
    };


  // ========================================================
  // LOADING
  // ========================================================

  if (
    loading
  ) {

    return (

      <Box
        sx={{
          minHeight:
            '100vh',

          backgroundColor:
            '#0D1527',

          display:
            'flex',

          alignItems:
            'center',

          justifyContent:
            'center'
        }}
      >

        <CircularProgress />

      </Box>
    );
  }


  // ========================================================
  // PAGE
  // ========================================================

  return (

    <Box
      sx={{
        minHeight:
          '100vh',

        backgroundColor:
          '#0D1527',

        color:
          '#FFFFFF',

        p: {
          xs:
            2,

          md:
            4
        }
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Typography
        variant="caption"
        sx={{
          color:
            '#00A8FF',

          fontWeight:
            800
        }}
      >
        MODULE 2 • FEATURE 4
      </Typography>


      <Typography
        variant="h4"
        sx={{
          fontWeight:
            800,

          mt:
            0.5
        }}
      >
        Secure Payment & Invoice
      </Typography>


      <Typography
        sx={{
          color:
            '#94A3B8',

          mt:
            0.5,

          mb:
            3
        }}
      >
        Pay for completed services using Stripe Test Mode and view your digital invoices.
      </Typography>


      {/* ===================================================
          ALERTS
      =================================================== */}

      {error && (

        <Alert
          severity="error"
          sx={{
            mb:
              2
          }}
        >
          {error}
        </Alert>
      )}


      {message && (

        <Alert
          severity="success"
          sx={{
            mb:
              2
          }}
        >
          {message}
        </Alert>
      )}


      {verifying && (

        <Alert
          severity="info"
          icon={
            <CircularProgress
              size={18}
            />
          }
          sx={{
            mb:
              2
          }}
        >
          Verifying payment with Stripe...
        </Alert>
      )}


      {/* ===================================================
          COMPLETED SERVICES
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          p:
            3,

          mb:
            3,

          backgroundColor:
            '#172036',

          border:
            '1px solid #2A364F',

          borderRadius:
            3
        }}
      >

        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            gap:
              1,

            mb:
              2
          }}
        >

          <CreditCard
            size={22}
            color="#00A8FF"
          />


          <Typography
            variant="h6"
            sx={{
              fontWeight:
                800
            }}
          >
            Services Ready for Payment
          </Typography>

        </Box>


        {completedServices.length ===
          0 ? (

          <Typography
            sx={{
              color:
                '#94A3B8'
            }}
          >
            No completed service is currently ready for payment.
          </Typography>

        ) : (

          <Grid
            container
            spacing={2}
          >

            {completedServices.map(
              (request) => {

                const existingPaid =
                  paymentHistory.find(
                    (payment) =>

                      payment.serviceRequestId ===
                        request.id &&

                      payment.status ===
                        'PAID'
                  );


                return (

                  <Grid
                    item
                    xs={12}
                    md={6}
                    key={
                      request.id
                    }
                  >

                    <Paper
                      elevation={0}
                      sx={{
                        p:
                          2.5,

                        height:
                          '100%',

                        backgroundColor:
                          '#0F172A',

                        border:
                          existingPaid
                            ? '1px solid #10B981'
                            : '1px solid #334155',

                        borderRadius:
                          2
                      }}
                    >

                      <Box
                        sx={{
                          display:
                            'flex',

                          justifyContent:
                            'space-between',

                          gap:
                            2,

                          flexWrap:
                            'wrap'
                        }}
                      >

                        <Box>

                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                '#64748B'
                            }}
                          >
                            {
                              request.trackingId
                            }
                          </Typography>


                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight:
                                800,

                              mt:
                                0.5
                            }}
                          >
                            {
                              request.deviceCategory
                            } Support
                          </Typography>


                          <Typography
                            sx={{
                              color:
                                '#CBD5E1',

                              mt:
                                0.5
                            }}
                          >
                            {
                              request.title
                            }
                          </Typography>

                        </Box>


                        <Chip
                          label={
                            existingPaid
                              ? 'PAID'
                              : 'PAYMENT DUE'
                          }
                          sx={{
                            color:
                              existingPaid
                                ? '#10B981'
                                : '#F59E0B',

                            backgroundColor:
                              existingPaid
                                ? 'rgba(16,185,129,.12)'
                                : 'rgba(245,158,11,.12)',

                            fontWeight:
                              800
                          }}
                        />

                      </Box>


                      <Divider
                        sx={{
                          my:
                            2,

                          borderColor:
                            '#334155'
                        }}
                      />


                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            '#64748B'
                        }}
                      >
                        Service Method
                      </Typography>


                      <Typography
                        sx={{
                          fontWeight:
                            700,

                          mb:
                            2
                        }}
                      >
                        {
                          request.serviceMethod
                        }
                      </Typography>


                      {existingPaid ? (

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            <Receipt
                              size={18}
                            />
                          }
                          onClick={() =>
                            loadInvoice(
                              existingPaid.id
                            )
                          }
                          sx={{
                            borderColor:
                              '#10B981',

                            color:
                              '#10B981',

                            fontWeight:
                              800
                          }}
                        >
                          View Invoice
                        </Button>

                      ) : (

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={
                            payingId ===
                              request.id

                              ? (
                                <CircularProgress
                                  size={18}
                                  color="inherit"
                                />
                              )

                              : (
                                <CreditCard
                                  size={18}
                                />
                              )
                          }
                          disabled={
                            payingId !==
                            null
                          }
                          onClick={() =>
                            handlePay(
                              request
                            )
                          }
                          sx={{
                            backgroundColor:
                              '#00A8FF',

                            color:
                              '#06111F',

                            fontWeight:
                              800
                          }}
                        >
                          {
                            payingId ===
                            request.id

                              ? 'Opening Stripe...'

                              : 'Pay with Stripe'
                          }
                        </Button>

                      )}

                    </Paper>

                  </Grid>
                );
              }
            )}

          </Grid>
        )}

      </Paper>


      {/* ===================================================
          DIGITAL INVOICE
      =================================================== */}

      {invoice && (

        <Paper
          elevation={0}
          sx={{
            p:
              3,

            mb:
              3,

            maxWidth:
              900,

            backgroundColor:
              '#172036',

            border:
              '1px solid #10B981',

            borderRadius:
              3
          }}
        >

          <Box
            sx={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                1,

              mb:
                2
            }}
          >

            <CheckCircle2
              size={25}
              color="#10B981"
            />


            <Box>

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#10B981',

                  fontWeight:
                    800
                }}
              >
                DIGITAL INVOICE
              </Typography>


              <Typography
                variant="h5"
                sx={{
                  fontWeight:
                    800
                }}
              >
                {
                  invoice.invoiceNumber
                }
              </Typography>

            </Box>

          </Box>


          <Divider
            sx={{
              borderColor:
                '#334155',

              mb:
                2.5
            }}
          />


          <Grid
            container
            spacing={2.5}
          >

            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Customer
              </Typography>


              <Typography
                fontWeight={800}
              >
                {
                  invoice.customer?.name ||
                  'N/A'
                }
              </Typography>


              <Typography
                sx={{
                  color:
                    '#94A3B8'
                }}
              >
                {
                  invoice.customer?.email ||
                  'N/A'
                }
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Technician
              </Typography>


              <Typography
                fontWeight={800}
              >
                {
                  invoice.technician?.name ||
                  'N/A'
                }
              </Typography>


              <Typography
                sx={{
                  color:
                    '#94A3B8'
                }}
              >
                {
                  invoice.technician?.specialty ||
                  'N/A'
                }
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Service
              </Typography>


              <Typography
                fontWeight={800}
              >
                {
                  invoice.service?.title ||
                  'N/A'
                }
              </Typography>


              <Typography
                sx={{
                  color:
                    '#94A3B8'
                }}
              >
                {
                  invoice.service?.method ||
                  'N/A'
                }
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Amount
              </Typography>


              <Typography
                variant="h5"
                sx={{
                  color:
                    '#10B981',

                  fontWeight:
                    800
                }}
              >
                {
                  formatAmount(
                    invoice.amount
                  )
                }
              </Typography>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Payment Status
              </Typography>


              <Box
                sx={{
                  mt:
                    0.5
                }}
              >

                <Chip
                  label={
                    invoice.paymentStatus
                  }
                  sx={{
                    color:
                      invoice.paymentStatus ===
                        'PAID'
                        ? '#10B981'
                        : '#F59E0B',

                    backgroundColor:
                      '#0F172A',

                    fontWeight:
                      800
                  }}
                />

              </Box>

            </Grid>


            <Grid
              item
              xs={12}
              sm={6}
            >

              <Typography
                variant="caption"
                sx={{
                  color:
                    '#64748B'
                }}
              >
                Payment Method
              </Typography>


              <Typography
                fontWeight={800}
              >
                Stripe Test Mode
              </Typography>

            </Grid>

          </Grid>

        </Paper>
      )}


      {/* ===================================================
          PAYMENT HISTORY
      =================================================== */}

      <Paper
        elevation={0}
        sx={{
          p:
            3,

          backgroundColor:
            '#172036',

          border:
            '1px solid #2A364F',

          borderRadius:
            3
        }}
      >

        <Box
          sx={{
            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            flexWrap:
              'wrap',

            gap:
              1,

            mb:
              2
          }}
        >

          <Box
            sx={{
              display:
                'flex',

              alignItems:
                'center',

              gap:
                1
            }}
          >

            <History
              size={22}
              color="#00A8FF"
            />


            <Typography
              variant="h6"
              sx={{
                fontWeight:
                  800
              }}
            >
              Payment History
            </Typography>

          </Box>


          <Button
            size="small"
            variant="outlined"
            startIcon={
              <RefreshCcw
                size={16}
              />
            }
            onClick={
              loadPaymentHistory
            }
          >
            Refresh
          </Button>

        </Box>


        {paymentHistory.length ===
          0 ? (

          <Typography
            sx={{
              color:
                '#94A3B8'
            }}
          >
            No payment history found.
          </Typography>

        ) : (

          paymentHistory.map(
            (
              payment,
              index
            ) => (

              <Box
                key={
                  payment.id
                }
              >

                {index >
                  0 && (

                  <Divider
                    sx={{
                      my:
                        2,

                      borderColor:
                        '#334155'
                    }}
                  />

                )}


                <Box
                  sx={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap:
                      2,

                    flexWrap:
                      'wrap'
                  }}
                >

                  <Box>

                    <Box
                      sx={{
                        display:
                          'flex',

                        alignItems:
                          'center',

                        gap:
                          1
                      }}
                    >

                      <FileText
                        size={18}
                        color="#38BDF8"
                      />


                      <Typography
                        fontWeight={800}
                      >
                        {
                          payment.invoiceNumber
                        }
                      </Typography>

                    </Box>


                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          '#94A3B8',

                        mt:
                          0.4
                      }}
                    >
                      {
                        payment.serviceTitle
                      }
                      {' • '}
                      {
                        payment.serviceMethod
                      }
                    </Typography>

                  </Box>


                  <Box
                    sx={{
                      textAlign: {
                        xs:
                          'left',

                        sm:
                          'right'
                      }
                    }}
                  >

                    <Typography
                      fontWeight={800}
                    >
                      {
                        formatAmount(
                          payment.amount
                        )
                      }
                    </Typography>


                    <Chip
                      size="small"
                      label={
                        payment.status
                      }
                      sx={{
                        mt:
                          0.5,

                        color:
                          payment.status ===
                            'PAID'
                            ? '#10B981'
                            : '#F59E0B',

                        backgroundColor:
                          '#0F172A'
                      }}
                    />

                  </Box>


                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      loadInvoice(
                        payment.id
                      )
                    }
                    disabled={
                      payment.status !==
                      'PAID'
                    }
                  >
                    Invoice
                  </Button>

                </Box>

              </Box>
            )
          )
        )}

      </Paper>

    </Box>
  );
};


export { Payment };
export default Payment;