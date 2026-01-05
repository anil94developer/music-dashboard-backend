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

        // Check if email already exists before creating payment order
        if (companyData && companyData.email) {
            const authModel = require("../models/authmodels");
            const isUserExist = await authModel.checkAvailablity(companyData.email);
            if (isUserExist && isUserExist.length > 0) {
                return R(res, false, "Email already exists. Please use a different email or login with existing account.", {}, 400);
            }
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

        // ============================================
        // BYPASS MODE: Skip Cashfree payment for testing
        // Set BYPASS_PAYMENT=true in environment variables to enable
        // ============================================
        const BYPASS_PAYMENT = process.env.BYPASS_PAYMENT === 'true' || process.env.BYPASS_PAYMENT === '1';
        
        if (BYPASS_PAYMENT) {
            console.log("⚠️ ========================================");
            console.log("⚠️ PAYMENT BYPASS MODE ENABLED");
            console.log("⚠️ Skipping Cashfree payment gateway");
            console.log("⚠️ Directly registering company...");
            console.log("⚠️ ========================================");
            
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
            
            // Prepare company registration request
            const companyReq = {
                body: {
                    ...companyData,
                    membershipId: membershipId,
                    paymentId: payment._id.toString()
                }
            };

            // Create a mock response object to capture the result
            let registrationResult = null;
            let registrationError = null;

            try {
                // Call company registration directly using a promise wrapper
                await new Promise((resolve, reject) => {
                    const mockRes = {
                        status: (code) => ({
                            json: (data) => {
                                registrationResult = { statusCode: code, data: data };
                                resolve(data);
                            }
                        })
                    };
                    
                    // Call the addCompany function (companyService exports auth object directly)
                    companyService.addCompany(companyReq, mockRes, (err) => {
                        if (err) {
                            registrationError = err;
                            reject(err);
                        } else {
                            // If no error and no result yet, resolve anyway
                            if (!registrationResult) {
                                resolve({ statusCode: 200, data: { message: "Registration completed" } });
                            }
                        }
                    });
                });
            } catch (err) {
                if (!registrationError) {
                    registrationError = err;
                }
                console.error("Error in direct company registration:", err);
            }

            if (registrationError) {
                console.error("❌ Company registration failed:", registrationError.message);
                return R(res, false, `Company registration failed: ${registrationError.message}`, {}, 500);
            }

            if (registrationResult && registrationResult.statusCode === 200) {
                console.log("✅ Company registered successfully (Payment bypassed)");
                console.log("✅ Email should be sent to:", companyData?.email);
                console.log("✅ Registration response:", registrationResult.data);
                
                return R(res, true, "Company registered successfully (Payment bypassed for testing)", {
                    orderId: orderId,
                    paymentSessionId: `BYPASS_${orderId}`,
                    paymentUrl: null, // No payment URL in bypass mode
                    amount: amount,
                    membership: {
                        name: membership.name,
                        duration: membership.duration,
                        durationType: membership.durationType
                    },
                    bypassMode: true,
                    registrationData: registrationResult.data,
                    message: "Payment bypassed - Company registered directly. Check email for login credentials."
                }, 200);
            } else {
                console.error("❌ Company registration returned unexpected result:", registrationResult);
                return R(res, false, "Company registration failed", registrationResult?.data || {}, 500);
            }
        }

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
        // Set return URL - Cashfree will replace {order_id} with actual order ID
        const frontendUrl = process.env.FRONTEND_URL || "https://tuneplusmusic.com/tunepluswebsite";
        orderMeta.returnUrl = `${frontendUrl}/payment-success.php?order_id={order_id}`;
        orderMeta.notifyUrl = `https://music-dashboard-backend-yh7q.onrender.com/payment/webhook`;
        
        console.log("Payment return URL:", orderMeta.returnUrl);
        console.log("Payment webhook URL:", orderMeta.notifyUrl);

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
        let paymentUrl = null; // Declare outside try block to fix scope issue
        
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
            console.log("Full Cashfree order response:", JSON.stringify(cfOrder, null, 2));
            console.log("Cashfree order response keys:", Object.keys(cfOrder || {}));
            
            // Check if Cashfree response includes payment URL
            // Cashfree might return paymentUrl, payment_url, paymentLink, payment_link, or paymentLink in response
            paymentUrl = cfOrder.paymentUrl 
                         || cfOrder.payment_url 
                         || cfOrder.paymentLink 
                         || cfOrder.payment_link
                         || (cfOrder.orderMeta && cfOrder.orderMeta.paymentUrl)
                         || (cfOrder.orderMeta && cfOrder.orderMeta.payment_url);
            
            console.log("Payment URL from response:", paymentUrl);
            
            // If payment URL is not in response, construct it based on environment
            if (!paymentUrl && paymentSession) {
                // Cashfree payment URL format for PG SDK
                if (environment === "PRODUCTION") {
                    paymentUrl = `https://payments.cashfree.com/forms/v2/${paymentSession}`;
                } else {
                    paymentUrl = `https://sandbox.cashfree.com/pg/forms/v2/${paymentSession}`;
                }
            }
            
            console.log("Final Payment URL:", paymentUrl);
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

        // Ensure payment URL is set before returning
        // Construct payment URL if not already set (fallback)
        if (!paymentUrl && paymentSession) {
            if (environment === "PRODUCTION") {
                paymentUrl = `https://payments.cashfree.com/forms/v2/${paymentSession}`;
            } else {
                paymentUrl = `https://sandbox.cashfree.com/pg/forms/v2/${paymentSession}`;
            }
            console.log("Constructed payment URL (fallback):", paymentUrl);
        }

        // Validate that we have both paymentSession and paymentUrl
        if (!paymentSession) {
            return R(res, false, "Failed to create payment order - Payment session ID not available", {}, 500);
        }

        if (!paymentUrl) {
            return R(res, false, "Failed to create payment order - Payment URL could not be generated", {}, 500);
        }

        return R(res, true, "Payment order created successfully", {
            orderId: orderId,
            paymentSessionId: paymentSession,
            paymentUrl: paymentUrl, // Include payment URL in response
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
        if (paymentStatus === "SUCCESS" && payment.companyData) {
            // Check if company already registered (to avoid duplicate registration)
            const existingPayment = await paymentModel.getPaymentByOrderId(orderId);
            if (existingPayment && existingPayment.status === "SUCCESS") {
                // Check if company was already created
                const authModel = require("../models/authmodels");
                const existingUser = await authModel.checkAvailablity(payment.companyData.email);
                
                if (existingUser && existingUser.length > 0) {
                    console.log("Company already registered for this payment");
                    return R(res, true, "Webhook processed - Company already registered", {}, 200);
                }
            }
            
            // Import company service
            const companyService = require("./companyServices");
            
            // Create company account
            const companyReq = {
                body: {
                    ...payment.companyData,
                    membershipId: payment.membershipId,
                    role: "company",
                    paymentId: payment._id // Pass payment ID for membershipusers table
                }
            };

            // Create a mock response handler to capture the result
            let companyResult = null;
            let companyError = null;
            
            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        companyResult = data;
                        return mockRes;
                    }
                })
            };

            // Call company registration (without token for webhook)
            try {
                await companyService.addCompany(companyReq, mockRes, (err) => {
                    if (err) {
                        companyError = err;
                    }
                });
                
                if (companyError) {
                    console.error("Error creating company after payment:", companyError);
                    return R(res, false, "Payment successful but company registration failed", {}, 500);
                }
                
                if (companyResult && companyResult.status === true) {
                    console.log("Company registered successfully after payment");
                    return R(res, true, "Webhook processed - Company registered successfully", {}, 200);
                } else {
                    console.error("Company registration failed:", companyResult);
                    return R(res, false, "Payment successful but company registration failed", {}, 500);
                }
            } catch (error) {
                console.error("Error creating company after payment:", error);
                return R(res, false, "Payment successful but company registration failed", {}, 500);
            }
        }

        return R(res, true, "Webhook processed successfully", {}, 200);

    } catch (error) {
        console.error("Error in paymentWebhook:", error);
        return R(res, false, error.message || "Failed to process webhook", {}, 500);
    }
};

module.exports = paymentService;

