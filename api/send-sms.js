// api/send-sms.js
const twilio = require('twilio');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { to, body } = req.body;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  const client = new twilio(accountSid, authToken);

  try {
    const message = await client.messages.create({
      body: body,
      to: to,
      from: twilioPhoneNumber,
    });

    res.status(200).json({ success: true, message: 'SMS sent successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};