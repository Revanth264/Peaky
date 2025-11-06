"use strict";
/**
 * Send order receipt email (SendGrid or console fallback)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReceipt = sendReceipt;
const config_js_1 = require("../config.js");
/**
 * Send receipt email to user
 * Falls back to console log if SendGrid is not configured
 */
async function sendReceipt(order) {
    if (!(0, config_js_1.isEmailConfigured)()) {
        // Fallback: log to console
        console.log('📧 Receipt Email (SendGrid not configured):', {
            to: order.uid, // In production, fetch user email from profile
            subject: `Order Confirmation - ${order.orderNumber}`,
            orderNumber: order.orderNumber,
            total: `₹${order.total.toFixed(2)}`,
            items: order.items.map(item => `${item.name} x${item.quantity}`).join(', '),
        });
        return;
    }
    // TODO: Implement SendGrid email sending
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(CONFIG.email.sendgrid_key);
    // 
    // const msg = {
    //   to: userEmail,
    //   from: 'noreply@peakime.com',
    //   subject: `Order Confirmation - ${order.orderNumber}`,
    //   html: generateReceiptHTML(order),
    // };
    // 
    // await sgMail.send(msg);
    console.log('📧 Receipt email would be sent (SendGrid integration TODO)');
}
//# sourceMappingURL=sendReceipt.js.map