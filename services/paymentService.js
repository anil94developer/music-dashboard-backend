const R = require("../utils/responseHelper");
const paymentModel = require("../models/paymentmodels");
const membershipModel = require("../models/membershipmodels");
const authModel = require("../models/authmodels");

// Initialize Cashfree SDK
const clientId = process.env.CASHFREE_CLIENT_ID || "10405831dd5ed9570add5f8cd203850401";
const clientSecret = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_374e6a023c598d69fb63d5e78fb3cf6b_9780be8d";
const environment = process.env.CASHFREE_ENV || "PRODUCTION"; // PRODUCTION or SANDBOX

// Import Cashfree SDK
const cashfreeSDK = require("cashfree-pg-sdk-nodejs");
const { OrdersApi, PaymentsApi, CFEnvironment } = cashfreeSDK;
const models = require("cashfree-pg-sdk-nodejs/dist/src/model/models");
const CFOrderRequest = models.CFOrderRequest;
const CFOrderMeta = models.CFOrderMeta;
const CFCustomerDetails = models.CFCustomerDetails;

// Configure Cashfree base path
const cashfreeBasePath = environment === "PRODUCTION" 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";

// Log configuration on module load
console.log("Cashfree Payment Gateway Initialized:", {
    environment: environment,
    basePath: cashfreeBasePath,
    clientIdPrefix: clientId.substring(0, 10) + "...",
    hasClientSecret: !!clientSecret
});

paymentService = {};

// Create payment order
paymentService.createPaymentOrder = async (req, res, next) => {
    try {
        const { membershipId, companyData } = req.body;

        if (!membershipId) {
            return R(res, false, "Membership ID is required", {}, 400);
        }

        // Get membership details
        const membership = await membershipModel.getMembershipById(membershipId);
        if (!membership || membership.is_active !== 1 || membership.is_deleted !== 0) {
            return R(res, false, "Invalid or inactive membership", {}, 400);
        }

        const amount = membership.price;
        if (amount <= 0) {
            return R(res, false, "Invalid membership price", {}, 400);
        }

        // Generate unique order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create payment order request object for Cashfree (using SDK model classes)
        // Generate alphanumeric customer ID (Cashfree requirement: alphanumeric with underscore/hyphen only, no special chars like @)
        const generateCustomerId = (email) => {
            if (!email) return `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
            // Remove special characters from email, keep only alphanumeric and replace with underscore
            const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
            // Limit length to 50 characters (Cashfree limit) and ensure it's not empty
            const customerId = cleanEmail.substring(0, 50) || `CUST_${Date.now()}`;
            return customerId;
        };
        
        const customerDetails = new CFCustomerDetails();
        customerDetails.customerId = generateCustomerId(companyData?.email) || `CUST_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        customerDetails.customerName = `${companyData?.firstName || ''} ${companyData?.lastName || ''}`.trim() || "Customer";
        customerDetails.customerEmail = companyData?.email || "";
        customerDetails.customerPhone = companyData?.phoneNumber || "";

        const orderMeta = new CFOrderMeta();
        orderMeta.returnUrl = `${process.env.FRONTEND_URL || "http://localhost/tunepluswebsite"}/payment-success.php?order_id={order_id}`;
        orderMeta.notifyUrl = `${process.env.BACKEND_URL || "http://localhost:8002"}/payment/webhook`;

        // ============================================
        // CASHFREE PAYMENT GATEWAY INTEGRATION
        // ============================================
        const orderRequest = new CFOrderRequest();
        orderRequest.orderId = orderId;
        orderRequest.orderAmount = amount;
        orderRequest.orderCurrency = "INR";
        orderRequest.orderNote = `Membership: ${membership.name}`;
        orderRequest.customerDetails = customerDetails;
        orderRequest.orderMeta = orderMeta;

        let paymentSession;
        try {
            // Create order using Cashfree SDK
            const ordersApiInstance = new OrdersApi(cashfreeBasePath);
            const apiVersion = "2023-08-01";
            
            console.log("Creating Cashfree order with:", {
                basePath: cashfreeBasePath,
                orderId: orderId,
                amount: amount,
                clientId: clientId.substring(0, 10) + "..."
            });
            
            // Call createOrder with all required parameters
            const orderResponse = await ordersApiInstance.createOrder(
                clientId,           // xClientId
                clientSecret,       // xClientSecret
                apiVersion,         // xApiVersion
                undefined,          // xIdempotencyReplayed (optional)
                undefined,          // xIdempotencyKey (optional)
                undefined,          // xRequestId (optional)
                orderRequest,       // cFOrderRequest
                undefined,          // requestTimeout (optional)
                undefined,          // webProxy (optional)
                {}                  // options (optional)
            );
            
            console.log("Cashfree order response:", JSON.stringify(orderResponse, null, 2));
            
            // Response structure: { cfHeaders: {...}, cfOrder: {...} }
            const cfOrder = orderResponse.cfOrder || orderResponse;
            
            if (!cfOrder || !cfOrder.paymentSessionId) {
                console.error("Cashfree response missing paymentSessionId:", orderResponse);
                return R(res, false, "Failed to create payment order - No payment session ID received", {}, 500);
            }

            paymentSession = cfOrder.paymentSessionId;
            console.log("Payment session created:", paymentSession);
        } catch (error) {
            console.error("Cashfree API Error Details:");
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
            
            // Check for HTTP error (Cashfree SDK uses HttpError)
            if (error.response) {
                console.error("HTTP Status:", error.response.statusCode);
                console.error("HTTP Body:", error.response.body);
                console.error("HTTP Headers:", error.response.headers);
            }
            
            // Check for request error
            if (error.request) {
                console.error("Request details:", error.request);
            }
            
            // Check if it's an HttpError from Cashfree SDK
            if (error.statusCode) {
                console.error("HTTP Status Code:", error.statusCode);
                console.error("HTTP Response Body:", error.body);
            }
            
            // More detailed error message
            let errorMessage = "Failed to create payment order";
            if (error.message) {
                errorMessage = error.message;
            } else if (error.body) {
                try {
                    const errorBody = typeof error.body === 'string' 
                        ? JSON.parse(error.body) 
                        : error.body;
                    errorMessage = errorBody.message || errorBody.error || errorBody.error_description || errorMessage;
                } catch (e) {
                    errorMessage = error.body.toString();
                }
            } else if (error.response && error.response.body) {
                try {
                    const errorBody = typeof error.response.body === 'string' 
                        ? JSON.parse(error.response.body) 
                        : error.response.body;
                    errorMessage = errorBody.message || errorBody.error || errorMessage;
                } catch (e) {
                    errorMessage = error.response.body.toString();
                }
            }
            
            return R(res, false, `Payment gateway error: ${errorMessage}`, {
                errorType: error.name || "Unknown",
                statusCode: error.statusCode || error.response?.statusCode,
                details: error.body || error.response?.body || error.message
            }, 500);
        }

        // Save payment record
        const paymentData = {
            membershipId: membershipId,
            orderId: orderId,
            paymentSessionId: paymentSession,
            amount: amount,
            currency: "INR",
            status: "PENDING",
            companyData: companyData || {}
        };

        const payment = await paymentModel.createPayment(paymentData);

        if (!payment) {
            return R(res, false, "Failed to save payment record", {}, 500);
        }

        return R(res, true, "Payment order created successfully", {
            orderId: orderId,
            paymentSessionId: paymentSession,
            amount: amount,
            membership: {
                name: membership.name,
                duration: membership.duration,
                durationType: membership.durationType
            }
        }, 200);

        // ============================================
        // BYPASS MODE: Direct company registration (COMMENTED OUT - Use only for testing)
        // ============================================
        /*
        console.log("⚠️ PAYMENT BYPASSED - Direct company registration mode");
        
        // Save payment record with SUCCESS status (for testing)
        const paymentData = {
            membershipId: membershipId,
            orderId: orderId,
            paymentSessionId: `BYPASS_${orderId}`,
            amount: amount,
            currency: "INR",
            status: "SUCCESS", // Mark as SUCCESS for testing
            companyData: companyData || {}
        };

        const payment = await paymentModel.createPayment(paymentData);

        if (!payment) {
            return R(res, false, "Failed to save payment record", {}, 500);
        }

        // Directly trigger company registration
        const companyService = require("./companyServices");
        
        const companyReq = {
            body: {
                ...companyData,
                membershipId: membershipId,
                role: "company",
                paymentId: payment._id // Pass payment ID for membershipusers table
            }
        };

        // Create company account directly
        try {
            let companyResult = null;
            let companyError = null;
            
            // Create a mock response handler
            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        companyResult = data;
                        return mockRes;
                    }
                })
            };
            
            // Call company service
            await companyService.addCompany(companyReq, mockRes, (err) => {
                if (err) {
                    companyError = err;
                }
            });

            // Check result
            if (companyError) {
                throw companyError;
            }

            if (companyResult && companyResult.status === true) {
                // Payment ID is available in payment._id
                return R(res, true, "Company registered successfully (Payment bypassed)", {
                    orderId: orderId,
                    paymentSessionId: `BYPASS_${orderId}`,
                    paymentId: payment._id, // Include payment ID
                    amount: amount,
                    membership: {
                        name: membership.name,
                        duration: membership.duration,
                        durationType: membership.durationType
                    },
                    company: companyResult.data
                }, 200);
            } else {
                return R(res, false, companyResult?.message || "Failed to register company", {}, 400);
            }
        } catch (error) {
            console.error("Error in direct company registration:", error);
            return R(res, false, `Company registration error: ${error.message || "Failed to register company"}`, {}, 500);
        }
        */

    } catch (error) {
        console.error("Error in createPaymentOrder:", error);
        return R(res, false, error.message || "Failed to create payment order", {}, 500);
    }
};

// Verify payment status
paymentService.verifyPayment = async (req, res, next) => {
    try {
        const { orderId } = req.query;

        if (!orderId) {
            return R(res, false, "Order ID is required", {}, 400);
        }

        // Get payment from database
        const payment = await paymentModel.getPaymentByOrderId(orderId);
        if (!payment) {
            return R(res, false, "Payment not found", {}, 404);
        }

        // Verify with Cashfree
        let orderStatus;
        try {
            const paymentsApiInstance = new PaymentsApi(cashfreeBasePath);
            const apiVersion = "2023-08-01";
            
            // Parameter order: xClientId, xClientSecret, orderId, xApiVersion, ...
            const orderResponse = await paymentsApiInstance.getPaymentsfororder(
                clientId,       // xClientId
                clientSecret,   // xClientSecret
                orderId,        // orderId
                apiVersion,     // xApiVersion
                undefined,      // xIdempotencyReplayed (optional)
                undefined,      // xIdempotencyKey (optional)
                undefined,      // xRequestId (optional)
                undefined,      // requestTimeout (optional)
                undefined,      // webProxy (optional)
                {}              // options (optional)
            );
            
            // Response structure: { cfHeaders: {...}, cfPaymentsForOrderResponse: {...} }
            const paymentsData = orderResponse.cfPaymentsForOrderResponse || orderResponse;
            orderStatus = paymentsData || [];
        } catch (error) {
            console.error("Cashfree verification error:", error);
            // Return database status if API fails
            return R(res, true, "Payment status retrieved", {
                orderId: payment.orderId,
                status: payment.status,
                amount: payment.amount,
                paymentId: payment.paymentId
            }, 200);
        }

        // Update payment status if changed
        if (orderStatus && orderStatus.length > 0) {
            const latestPayment = orderStatus[0];
            const newStatus = latestPayment.payment_status === "SUCCESS" ? "SUCCESS" : 
                            latestPayment.payment_status === "FAILED" ? "FAILED" : "PENDING";

            if (newStatus !== payment.status) {
                await paymentModel.updatePayment(orderId, {
                    status: newStatus,
                    paymentId: latestPayment.cf_payment_id,
                    paymentMethod: latestPayment.payment_method,
                    paymentTime: latestPayment.payment_time ? new Date(latestPayment.payment_time) : new Date(),
                    cashfreeResponse: latestPayment
                });

                // If payment successful, create company account
                if (newStatus === "SUCCESS" && payment.companyData) {
                    // Create company account here
                    // This will be handled in webhook or after verification
                }
            }
        }

        return R(res, true, "Payment status retrieved", {
            orderId: payment.orderId,
            status: payment.status,
            amount: payment.amount,
            paymentId: payment.paymentId,
            paymentMethod: payment.paymentMethod
        }, 200);

    } catch (error) {
        console.error("Error in verifyPayment:", error);
        return R(res, false, error.message || "Failed to verify payment", {}, 500);
    }
};

// Payment webhook handler
paymentService.paymentWebhook = async (req, res, next) => {
    try {
        const webhookData = req.body;

        if (!webhookData || !webhookData.data || !webhookData.data.order) {
            return R(res, false, "Invalid webhook data", {}, 400);
        }

        const orderId = webhookData.data.order.order_id;
        const paymentStatus = webhookData.data.payment.payment_status;
        const paymentId = webhookData.data.payment.cf_payment_id;

        // Get payment record
        const payment = await paymentModel.getPaymentByOrderId(orderId);
        if (!payment) {
            return R(res, false, "Payment not found", {}, 404);
        }

        // Update payment status
        const updateData = {
            status: paymentStatus === "SUCCESS" ? "SUCCESS" : 
                   paymentStatus === "FAILED" ? "FAILED" : "PENDING",
            paymentId: paymentId,
            cashfreeResponse: webhookData
        };

        if (paymentStatus === "SUCCESS") {
            updateData.paymentTime = new Date();
        }

        await paymentModel.updatePayment(orderId, updateData);

        // If payment successful, create company account
        if (paymentStatus === "SUCCESS" && payment.companyData && payment.status !== "SUCCESS") {
            // Import company service
            const companyService = require("./companyServices");
            
            // Create company account
            const companyReq = {
                body: {
                    ...payment.companyData,
                    membershipId: payment.membershipId,
                    role: "company"
                }
            };

            // Call company registration (without token for webhook)
            try {
                await companyService.addCompany(companyReq, res, next);
            } catch (error) {
                console.error("Error creating company after payment:", error);
            }
        }

        return R(res, true, "Webhook processed successfully", {}, 200);

    } catch (error) {
        console.error("Error in paymentWebhook:", error);
        return R(res, false, error.message || "Failed to process webhook", {}, 500);
    }
};

module.exports = paymentService;

