const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Cool Care AC Tech" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    if (process.env.EMAIL_FALLBACK_TO_CONSOLE === 'true') {
      console.log('--- EMAIL FALLBACK ---');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Body:', options.html);
      console.log('-----------------------');
    }
    return false;
  }
};

// --- Email Templates ---

const getBaseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0a0f1e 0%, #1a233a 100%); color: #ffffff; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; color: #00d4ff; }
    .content { padding: 40px 30px; }
    .footer { background: #f8fafc; color: #94a3b8; padding: 20px; text-align: center; font-size: 12px; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #00d4ff; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
    .details { background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #00d4ff; }
    .details p { margin: 5px 0; font-size: 14px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #e2e8f0; color: #475569; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cool Care AC Tech</h1>
      <p style="margin-top: 10px; color: #94a3b8; font-size: 14px;">Professional AC Services at Your Door</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© 2024 Cool Care AC Tech. All rights reserved.</p>
      <p>Karachi, Pakistan | 0300-FULLCARE</p>
    </div>
  </div>
</body>
</html>
`;

exports.sendBookingConfirmation = async (user, booking) => {
  const content = `
    <h2>Booking Received!</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for choosing Cool Care AC Tech. Your booking request has been received and is currently being processed by our team.</p>
    
    <div class="details">
      <p><strong>Booking Number:</strong> #${booking.bookingNumber}</p>
      <p><strong>Service:</strong> ${booking.service.name}</p>
      <p><strong>Scheduled Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
      <p><strong>Scheduled Time:</strong> ${booking.scheduledTime}</p>
      <p><strong>Total Amount:</strong> Rs. ${booking.totalAmount}</p>
    </div>

    <p>We will notify you as soon as a technician is assigned to your request.</p>
    <a href="${process.env.CLIENT_URL}/bookings" class="btn">View Booking Details</a>
  `;
  
  return sendEmail({
    email: user.email,
    subject: `Booking Confirmation - #${booking.bookingNumber}`,
    html: getBaseTemplate(content),
  });
};

exports.sendBookingStatusUpdate = async (user, booking, status, technician = null) => {
  let statusText = status.replace('_', ' ');
  let title = 'Booking Update';
  let message = `The status of your booking <strong>#${booking.bookingNumber}</strong> has been updated to:`;
  let extraContent = '';

  if (status === 'assigned' && technician) {
    title = 'Technician Assigned!';
    message = `Great news! A technician has been assigned to your booking <strong>#${booking.bookingNumber}</strong>.`;
    extraContent = `
      <div class="details" style="border-left-color: #10b981;">
        <h4 style="margin-top:0">Technician Details:</h4>
        <p><strong>Name:</strong> ${technician.user.name}</p>
        <p><strong>Contact:</strong> ${technician.user.phone}</p>
      </div>
    `;
  } else if (status === 'in_progress') {
    title = 'Service In Progress';
    message = `Our technician is now working on your AC for booking <strong>#${booking.bookingNumber}</strong>.`;
  } else if (status === 'completed') {
    title = 'Service Completed!';
    message = `Your booking <strong>#${booking.bookingNumber}</strong> is now completed. We hope you are satisfied with our service!`;
    extraContent = `
      <p>Your digital invoice is now available in your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/bookings" class="btn">View Invoice</a>
    `;
  }

  const content = `
    <h2 style="color: #0369a1;">${title}</h2>
    <p>Hi ${user.name},</p>
    <p>${message}</p>
    
    <div style="margin: 20px 0;">
      <span class="badge ${status === 'completed' ? 'badge-success' : 'badge-info'}">${statusText}</span>
    </div>

    ${extraContent}

    <p>Thank you for trusting Cool Care AC Tech!</p>
  `;

  return sendEmail({
    email: user.email,
    subject: `${title} - #${booking.bookingNumber}`,
    html: getBaseTemplate(content),
  });
};
