// Email Service
// Handles all transactional emails using Nodemailer
// Supports both Gmail SMTP and Ethereal (test) accounts

const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize email transporter
 * Uses Gmail if credentials provided, otherwise creates Ethereal test account
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production: Use configured SMTP (Gmail etc.)
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('📧 Email: Using configured SMTP');
  } else {
    // Development: Auto-create Ethereal test account
    // Emails won't actually be delivered but can be viewed at ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`📧 Email: Using Ethereal test account (${testAccount.user})`);
  }

  return transporter;
};

/**
 * Generate professional HTML email template for order confirmation
 * Styled to look like an actual e-commerce confirmation email
 */
const generateOrderEmailHTML = (order) => {
  const { id, items, shippingAddress, paymentMethod, total, tax, subtotal, estimatedDelivery } = order;
  
  const paymentLabel = {
    CARD: '💳 Credit/Debit Card',
    UPI: '📱 UPI Payment',
    COD: '💰 Cash on Delivery'
  }[paymentMethod];

  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">
        <strong style="color: #1a1a1a;">${item.name}</strong>
        <br>
        <small style="color: #666;">Qty: ${item.quantity}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right;">
        <strong>₹${(item.price * item.quantity).toLocaleString('en-IN')}</strong>
        <br>
        <small style="color: #666;">₹${item.price.toLocaleString('en-IN')} each</small>
      </td>
    </tr>
  `).join('');

  const deliveryDate = new Date(estimatedDelivery).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ShopX</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Arial, sans-serif;">
  
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #131921 0%, #232f3e 100%); padding: 24px 32px; text-align: center;">
      <h1 style="color: #ff9900; margin: 0; font-size: 28px; letter-spacing: -0.5px;">ShopX</h1>
      <p style="color: #ccc; margin: 4px 0 0; font-size: 13px;">Your trusted online shopping destination</p>
    </div>

    <!-- Success Banner -->
    <div style="background: #f0fff4; border-left: 4px solid #22c55e; padding: 20px 32px; display: flex; align-items: center;">
      <div>
        <h2 style="color: #15803d; margin: 0 0 4px; font-size: 20px;">✅ Order Confirmed!</h2>
        <p style="color: #166534; margin: 0; font-size: 14px;">Thank you for shopping with us. Your order has been placed successfully.</p>
      </div>
    </div>

    <!-- Order ID Banner -->
    <div style="background: #fff8e1; padding: 16px 32px; border-bottom: 1px solid #ffe082;">
      <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order ID</p>
      <p style="margin: 4px 0 0; color: #131921; font-size: 16px; font-weight: bold; font-family: monospace;">${id.toUpperCase()}</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      
      <!-- Delivery Estimate -->
      <div style="background: #e8f5e9; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
        <p style="margin: 0 0 4px; color: #2e7d32; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">🚚 Estimated Delivery</p>
        <p style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: bold;">${deliveryDate}</p>
      </div>

      <!-- Order Items -->
      <h3 style="color: #131921; font-size: 16px; border-bottom: 2px solid #ff9900; padding-bottom: 8px; margin: 0 0 16px;">Order Summary</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHTML}
        
        <!-- Totals -->
        <tr>
          <td style="padding: 12px; color: #666;">Subtotal</td>
          <td style="padding: 12px; text-align: right; color: #666;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 12px; color: #666;">Tax (18% GST)</td>
          <td style="padding: 12px; text-align: right; color: #666;">₹${tax.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding: 12px; color: #666;">Shipping</td>
          <td style="padding: 12px; text-align: right; color: #22c55e; font-weight: 600;">FREE</td>
        </tr>
        <tr style="border-top: 2px solid #131921;">
          <td style="padding: 16px 12px; font-size: 18px; font-weight: bold; color: #131921;">Total</td>
          <td style="padding: 16px 12px; text-align: right; font-size: 20px; font-weight: bold; color: #b12704;">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      </table>

      <!-- Payment & Shipping Info -->
      <div style="display: grid; gap: 16px; margin-top: 28px;">
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</p>
          <p style="margin: 0; font-weight: 600; color: #131921;">${paymentLabel}</p>
          ${paymentMethod === 'COD' ? '<p style="margin: 4px 0 0; color: #666; font-size: 13px;">Payment due at delivery</p>' : '<p style="margin: 4px 0 0; color: #22c55e; font-size: 13px;">✅ Payment Successful</p>'}
        </div>

        <div style="background: #f9f9f9; border-radius: 8px; padding: 16px 20px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</p>
          <p style="margin: 0; font-weight: 600; color: #131921;">${shippingAddress.name}</p>
          <p style="margin: 4px 0 0; color: #444; font-size: 14px; line-height: 1.6;">
            ${shippingAddress.address}<br>
            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.pincode}<br>
            📞 ${shippingAddress.phone}
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${id}" 
           style="background: #ff9900; color: #131921; text-decoration: none; padding: 14px 32px; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">
          Track Your Order →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #232f3e; padding: 24px 32px; text-align: center;">
      <p style="color: #aaa; margin: 0 0 8px; font-size: 13px;">Questions? Contact us at support@shopx.com</p>
      <p style="color: #666; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ShopX. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `;
};

/**
 * Send order confirmation email
 * Called after successful order placement
 * @param {Object} order - The complete order object with items
 */
const sendOrderConfirmationEmail = async (order) => {
  try {
    const transport = await initTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ShopX Store" <noreply@shopx.com>',
      to: order.customerEmail,
      subject: `✅ Order Confirmed: ${order.id.substring(0, 8).toUpperCase()} - ShopX`,
      html: generateOrderEmailHTML(order),
      // Plain text fallback
      text: `
Order Confirmed! - ShopX

Order ID: ${order.id}
Customer: ${order.customerName}

Items:
${order.items.map(i => `- ${i.name} x${i.quantity}: ₹${(i.price * i.quantity).toLocaleString('en-IN')}`).join('\n')}

Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}
Tax: ₹${order.tax.toLocaleString('en-IN')}
Total: ₹${order.total.toLocaleString('en-IN')}

Payment: ${order.paymentMethod}
Delivery to: ${order.shippingAddress.address}, ${order.shippingAddress.city}
Estimated Delivery: ${new Date(order.estimatedDelivery).toDateString()}

Thank you for shopping with ShopX!
      `
    };

    const info = await transport.sendMail(mailOptions);
    
    // Log preview URL for Ethereal test emails
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Email preview: ${previewUrl}`);
    }
    
    console.log(`✅ Order confirmation email sent to ${order.customerEmail}`);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    // Log but don't throw - email failure shouldn't block order creation
    console.error('❌ Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
