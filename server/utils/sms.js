const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const sendOrderUpdateSMS = async (toPhone, status, orderId) => {
    try {
        const shortOrderId = orderId.toString().slice(-4).toUpperCase();
        let message = `Aber Pizza: Your order #${shortOrderId} is now ${status}`;

        await client.messages.create({
            body: message,
            from: `whatsapp:${fromPhone}`,
            to: `whatsapp:${toPhone}`
        });

        console.log(`WhatsApp message sent successfully to ${toPhone}`);
    } catch (error) {
        console.error("Twilio WhatsApp Error:", error.message);
    }
};

module.exports = {sendOrderUpdateSMS};