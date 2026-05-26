require('dotenv').config();

const env = {
  port: Number(process.env.PORT || 3000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:4200',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parqueadero_db'
  },
  email: {
    baseUrl: process.env.EMAIL_API_BASE_URL || 'https://dev-sites.similtech.co/api-email',
    user: process.env.EMAIL_API_USER || '',
    password: process.env.EMAIL_API_PASSWORD || '',
    idUser: process.env.EMAIL_API_ID_USER || 'parqueadero',
    from: process.env.EMAIL_FROM || '',
    to: splitEmails(process.env.EMAIL_TO),
    copyTo: splitEmails(process.env.EMAIL_COPY_TO),
    hiddenCopyTo: splitEmails(process.env.EMAIL_HIDDEN_COPY_TO)
  }
};

function splitEmails(value = '') {
  return value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
}

module.exports = { env };
