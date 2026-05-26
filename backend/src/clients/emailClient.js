const axios = require('axios');
const { env } = require('../config/env');

async function sendExitNotification(record) {
  if (!env.email.user || !env.email.password || env.email.to.length === 0) {
    return { sent: false, message: 'Configuracion de correo incompleta' };
  }

  try {
    const token = await getToken();
    const payload = {
      configParams: {
        idUser: env.email.idUser,
        idMessage: `salida-${record.id}-${Date.now()}`
      },
      receivers: {
        emailOrigen: env.email.from || null,
        to: env.email.to,
        copyTo: env.email.copyTo,
        hiddenCopyTo: env.email.hiddenCopyTo
      },
      email: {
        subject: `Salida de vehiculo ${record.plate}`,
        message: `Placa: ${record.plate}<br>Tipo: ${record.vehicleType}<br>Tiempo total: ${record.totalMinutes} minutos<br>Valor pagado: $${record.totalAmount}`,
        url_files: []
      }
    };

    const response = await axios.post(`${env.email.baseUrl}/api/email/sendEmail`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return { sent: true, message: getCoreResponseMessage(response.data) || 'Correo enviado' };
  } catch (error) {
    const message = getCoreResponseMessage(error.response?.data) || error.message || 'No fue posible enviar el correo';
    return { sent: false, message };
  }
}

async function getToken() {
  const response = await axios.post(
    `${env.email.baseUrl}/api/token`,
    { username: env.email.user, password: env.email.password },
    { timeout: 10000 }
  );

  const token = extractToken(response.data);
  if (!token) {
    throw new Error('La API de correo no retorno un token valido');
  }

  return token;
}

function extractToken(data) {
  if (typeof data === 'string') {
    return removeBearerPrefix(data);
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  const token = data.token || data.accessToken || data.access_token;
  if (token) {
    return removeBearerPrefix(token);
  }

  if (typeof data.data === 'string') {
    return removeBearerPrefix(data.data);
  }

  if (data.data && typeof data.data === 'object') {
    return extractToken(data.data);
  }

  return null;
}

function removeBearerPrefix(token) {
  return token.replace(/^Bearer\s+/i, '').trim();
}

function getCoreResponseMessage(data) {
  if (Array.isArray(data)) {
    return data.map((item) => item?.message).filter(Boolean).join(' | ');
  }

  if (typeof data === 'string') {
    return data;
  }

  return data?.message || null;
}

module.exports = { sendExitNotification };
