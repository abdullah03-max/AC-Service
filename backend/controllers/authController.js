const User = require('../models/User');
const Technician = require('../models/Technician');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const isEmailConfigured = () => {
  return Boolean(
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS &&
    process.env.EMAIL_PASS !== 'bkzk rpte amay dtgt'
  );
};

const allowConsoleFallback = () => process.env.EMAIL_FALLBACK_TO_CONSOLE !== 'false';

// Render a styled HTML email for OTP
const renderOtpEmailHtml = (name, code) => {
  const serviceName = process.env.SERVICE_NAME || 'FullCare AC Service';
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const safeName = name || 'Customer';
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fc; margin:0; padding:24px;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 18px rgba(12,30,66,0.08);">
          <tr style="background:linear-gradient(90deg,#0ea5a0,#3b82f6); color:#fff;">
            <td style="padding:20px 24px; text-align:left;">
              <h1 style="margin:0; font-size:20px; font-weight:700;">${serviceName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:#0f172a;">
              <p style="margin:0 0 12px 0; font-size:15px;">Hi ${safeName},</p>
              <p style="margin:0 0 20px 0; color:#475569;">Use the verification code below to confirm your email address. This code will expire in 10 minutes.</p>

              <div style="display:flex; align-items:center; justify-content:center; margin:18px 0;">
                <div style="background:linear-gradient(180deg,#fff 0,#f8fafc 100%); border:2px dashed #3b82f6; padding:16px 28px; border-radius:12px; text-align:center;">
                  <div style="font-size:12px; color:#64748b; margin-bottom:6px;">Your verification code</div>
                  <div style="font-size:42px; letter-spacing:6px; font-weight:800; color:#0b74ff;">${code}</div>
                </div>
              </div>

              <p style="margin:0 0 18px 0; color:#64748b;">If you didn't request this code, you can ignore this email. For help, reply to this message.</p>

              <p style="margin:0;">
                <a href="${clientUrl}/verify?email=${encodeURIComponent(safeName)}" style="display:inline-block; background:#0b74ff; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none; font-weight:600;">Verify your email</a>
              </p>
            </td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:16px 24px; font-size:13px; color:#94a3b8; text-align:center;">
              <div>${serviceName} • Trusted AC repair &amp; maintenance</div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

// Helper: send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Prevent self-assigning admin
    const assignedRole = role === 'admin' ? 'user' : role || 'user';

    let user = await User.findOne({ email });
    if (user && user.isActive) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (!user) {
      user = await User.create({ name, email, password, phone, address, role: assignedRole, isActive: false });
    } else {
      // update provided details and password if present
      user.name = name || user.name;
      if (password) user.password = password;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      user.role = assignedRole;
    }

    // generate 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    user.otpCode = code;
    user.otpExpire = Date.now() + 1000 * 60 * 10; // 10 minutes
    await user.save();

    let deliveredViaEmail = false;

    if (isEmailConfigured()) {
      try {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: `${process.env.SERVICE_NAME || 'FullCare AC Service'} <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `${process.env.SERVICE_NAME || 'FullCare AC Service'} - Your verification code`,
          text: `Your verification code is: ${code}. It expires in 10 minutes.`,
          html: renderOtpEmailHtml(name, code),
        });
        deliveredViaEmail = true;
      } catch (sendErr) {
        if (!allowConsoleFallback()) {
          return res.status(500).json({
            success: false,
            message: 'Gmail rejected the credentials. Use a Gmail App Password (with 2-Step Verification enabled) in backend/.env',
          });
        }
        console.warn(`[OTP fallback] ${email}: ${code}`);
      }
    } else if (allowConsoleFallback()) {
      console.warn(`[OTP fallback] ${email}: ${code}`);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Email is not configured. Set EMAIL_USER and a real Gmail App Password in backend/.env',
      });
    }

    res.status(200).json({
      success: true,
      message: deliveredViaEmail ? 'OTP sent' : 'OTP generated. Check the backend console for the code.',
      deliveredViaEmail,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('bookingHistory');
  res.json({ success: true, data: user });
};

// @desc    Update profile
// @route   PUT /api/auth/updateprofile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/changepassword
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ success: false, message: 'Current password incorrect' });

    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/auth/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// (Google sign-in removed)

// Helper: create nodemailer transporter
const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Number(process.env.EMAIL_PORT) === 465,
    requireTLS: Number(process.env.EMAIL_PORT) === 587,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

// @desc    Send OTP to email (for verification)
// @route   POST /api/auth/send-otp
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    let user = await User.findOne({ email });
    if (!user) {
      const randomPass = crypto.randomBytes(16).toString('hex');
      user = await User.create({ name: email.split('@')[0], email, password: randomPass, isActive: false });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    user.otpCode = code;
    user.otpExpire = Date.now() + 1000 * 60 * 10; // 10 minutes
    await user.save();

    let deliveredViaEmail = false;

    if (isEmailConfigured()) {
      try {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: `${process.env.SERVICE_NAME || 'FullCare AC Service'} <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `${process.env.SERVICE_NAME || 'FullCare AC Service'} - Your verification code`,
          text: `Your verification code is: ${code}. It expires in 10 minutes.`,
          html: renderOtpEmailHtml(user.name || email.split('@')[0], code),
        });
        deliveredViaEmail = true;
      } catch (sendErr) {
        if (!allowConsoleFallback()) {
          return res.status(500).json({
            success: false,
            message: 'Gmail rejected the credentials. Use a Gmail App Password (with 2-Step Verification enabled) in backend/.env',
          });
        }
        console.warn(`[OTP fallback] ${email}: ${code}`);
      }
    } else if (allowConsoleFallback()) {
      console.warn(`[OTP fallback] ${email}: ${code}`);
    } else {
      return res.status(500).json({
        success: false,
        message: 'Email is not configured. Set EMAIL_USER and a real Gmail App Password in backend/.env',
      });
    }

    res.json({ success: true, message: deliveredViaEmail ? 'OTP sent' : 'OTP generated. Check the backend console for the code.', deliveredViaEmail });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.otpCode) return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
    if (user.otpExpire < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });
    if (user.otpCode !== code) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.isActive = true;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
// @desc    Delete user (admin)
// @route   DELETE /api/auth/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user status (block/unblock admin)
// @route   PUT /api/auth/users/:id/status
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Prevent blocking self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot block yourself' });
    }

    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ success: true, message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;

    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `${process.env.SERVICE_NAME || 'Cool Care AC Tech'} <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password reset token',
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #00d4ff; text-align: center;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password for your <strong>Cool Care AC Tech</strong> account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #00d4ff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request this, please ignore this email. This link will expire in 10 minutes.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888888; text-align: center;">&copy; 2026 Cool Care AC Tech. All rights reserved.</p>
          </div>
        `,
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};
