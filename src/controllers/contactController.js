const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const contactValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^[0-9+\s\-().]{7,20}$/).withMessage('Téléphone invalide'),
  body('subject').trim().isLength({ min: 2, max: 200 }).escape(),
  body('message').trim().isLength({ min: 10, max: 2000 }).escape(),
  body('event_type').optional().trim().isIn(['mariage', 'association', 'entreprise', 'particulier', 'autre']),
];

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendContact(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Données invalides', details: errors.array() });
  }

  const { name, email, phone, subject, message, event_type } = req.body;

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Site Maison Cherblanc" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `
        <h2>Nouveau message via maisoncherblanc.fr</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Nom</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
          ${phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Téléphone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>` : ''}
          ${event_type ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Type d'événement</td><td style="padding:8px;border:1px solid #ddd">${event_type}</td></tr>` : ''}
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Sujet</td><td style="padding:8px;border:1px solid #ddd">${subject}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${message.replace(/\n/g, '<br>')}</td></tr>
        </table>
      `,
    });

    // E-mail de confirmation à l'expéditeur
    await transporter.sendMail({
      from: `"Maison Cherblanc" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Votre message a bien été reçu — Maison Cherblanc',
      html: `
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement,<br><strong>L'équipe Maison Cherblanc</strong></p>
      `,
    });

    return res.json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
}

module.exports = { sendContact, contactValidation };
