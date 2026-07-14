const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOTPEmail = async (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'HouseBuddy - Mã OTP xác nhận đăng ký',
        html: `
            <h2>Chào bạn!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản HouseBuddy.</p>
            <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
            <p>Mã này sẽ hết hạn sau 2 phút.</p>
            <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
        `
    };
    await transporter.sendMail(mailOptions);
};