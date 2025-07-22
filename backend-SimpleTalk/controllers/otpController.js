const nodemailer = require('nodemailer');
require('dotenv').config();
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOtp = async (req, res) => {
    const { email} = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 10 * 60 * 1000; 
    otpStore[email] = { otp, expiresAt, attempts: 0 };
    console.log(otpStore);

    const mailOptions = {
        from: `"SimpleTalk Support" <${process.env.EMAIL_USER}>`,
        to: email, 
        subject: 'Kode OTP Verifikasi Anda - SimpleTalk',
        html: `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Verifikasi Akun Anda</h2>
            <p>Halo <strong>Pengguna</strong>,</p>
            <p>Terima kasih telah menggunakan SimpleTalk. Berikut adalah <strong>Kode OTP</strong> Anda untuk verifikasi:</p>
            
            <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 3px; background-color: #f2f2f2; border-radius: 8px;">
                ${otp}
            </span>
            </div>

            <p>Kode OTP ini hanya berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>
            <p>Jika Anda tidak meminta kode ini, silakan abaikan email ini.</p>

            <br/>
            <p>Hormat kami,<br/>Tim SimpleTalk</p>

            <hr style="margin-top: 40px;" />
            <small style="color: #888;">Email ini dikirim secara otomatis, mohon untuk tidak membalas.</small>
        </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (e) {
        console.error(`Error sending OTP: ${e.message}`);
        return res.status(500).json({ error: 'Failed to send OTP' });
    }
} 

exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore[email];

    if (!record) {
        return res.status(400).json({ message: 'OTP tidak ditemukan atau belum diminta' });
    }

    if (Date.now() > record.expiresAt) {
        delete otpStore[email];
        return res.status(400).json({ message: 'OTP telah kedaluwarsa' });
    }

    if (record.attempts >= 5) {
        delete otpStore[email];
        return res.status(429).json({ message: 'Terlalu banyak percobaan, Silakan request OTP baru' });
    }

    if (otp.toString() !== record.otp.toString()) {
        otpStore[email].attempts++;
        console.log(`Failed OTP attempt for ${email}. Attempts: ${otpStore[email].attempts}`);
        return res.status(400).json({ message: 'OTP salah' });
    }

    delete otpStore[email];
    return res.status(200).json({ message: 'OTP berhasil diverifikasi' });
}