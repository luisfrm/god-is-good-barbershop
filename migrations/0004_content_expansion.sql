-- Content expansion: gallery, testimonials, FAQ, closing CTA and the two
-- legal pages. New rows use INSERT OR IGNORE so re-applying never clobbers
-- content edited from the panel.

INSERT OR IGNORE INTO content (section, data) VALUES (
  'home.gallery',
  '{"eyebrow":"Nuestra barbería","title":"Galería","subtitle":"Un vistazo al ambiente y a los acabados que nos definen.","items":[{"src":"https://res.cloudinary.com/dw4ecbwo9/image/upload/c_fill,w_900,h_900,ar_1:1/v1732250788/wp9441481_xecwvr.webp","alt":"Interior de la barbería Gods Good"},{"src":"https://res.cloudinary.com/dw4ecbwo9/image/upload/c_fill,w_800,h_800,ar_1:1/v1732254554/photo-1605497788044-5a32c7078486-compress_l4cbk7.webp","alt":"Barbero trabajando un corte clásico"}]}'
);

INSERT OR IGNORE INTO content (section, data) VALUES (
  'home.testimonials',
  '{"eyebrow":"Lo que dicen","title":"Nuestros clientes","subtitle":"Opiniones reales de quienes se sientan en nuestra silla.","items":[{"author":"Carlos M.","meta":"Cliente desde 2024","rating":5,"text":"El mejor corte que me han hecho en Maracaibo. Puntualidad, trato cercano y un acabado impecable."},{"author":"Andrés R.","meta":"Maracaibo","rating":5,"text":"Reservé en línea y llegué directo a la silla. Ambiente clásico y atención de primera."},{"author":"Luis P.","meta":"Cliente frecuente","rating":4,"text":"Excelente arreglo de barba y siempre salgo con ganas de volver."}]}'
);

INSERT OR IGNORE INTO content (section, data) VALUES (
  'home.faq',
  '{"eyebrow":"Dudas frecuentes","title":"Preguntas frecuentes","subtitle":"Todo lo que necesitas saber antes de tu visita.","items":[{"question":"¿Necesito cita previa?","answer":"Recomendamos reservar en línea para asegurar tu horario, pero si hay disponibilidad también atendemos sin cita."},{"question":"¿Cuánto dura cada cita?","answer":"Cada cita dura aproximadamente 45 minutos, tiempo suficiente para un corte, arreglo de barba o ambos."},{"question":"¿Qué métodos de pago aceptan?","answer":"Efectivo, Pago Móvil y transferencia bancaria. Consulta por WhatsApp si necesitas otra opción."},{"question":"¿Puedo cambiar o cancelar mi cita?","answer":"Sí. Escríbenos por WhatsApp con al menos 2 horas de anticipación y reprogramamos tu visita sin costo."},{"question":"¿Atienden niños?","answer":"Sí, atendemos a toda la familia. Escríbenos para reservar una silla infantil."}]}'
);

INSERT OR IGNORE INTO content (section, data) VALUES (
  'home.cta',
  '{"eyebrow":"Agenda hoy","title":"¿Listo para tu mejor corte?","subtitle":"Reserva en menos de un minuto y asegura tu silla. Si prefieres, escríbenos por WhatsApp.","primaryText":"Reservar cita","primaryHref":"/reservar","secondaryText":"Escribir por WhatsApp","secondaryHref":""}'
);

INSERT OR IGNORE INTO content (section, data) VALUES (
  'legal.terms',
  '{"title":"Términos y Condiciones","updatedAt":"2026-09-23","intro":"Estos términos regulan el uso del sitio web y la reserva de citas en Gods Good BarberShop. Al reservar una cita aceptas las condiciones descritas a continuación.","sections":[{"heading":"Uso del sitio","body":"El sitio permite consultar servicios, horarios y disponibilidad, y solicitar citas en línea. Te comprometes a proporcionar información veraz y actualizada al reservar.\n\nNo está permitido usar el sitio para fines fraudulentos, automatizados o que afecten su funcionamiento."},{"heading":"Reservas y confirmaciones","body":"Toda reserva queda registrada en estado pendiente y se confirma por WhatsApp o correo electrónico. La cita se considera confirmada únicamente cuando recibe respuesta de nuestro equipo.\n\nSi la información de contacto es incorrecta o incompleta, podemos liberar el horario reservado."},{"heading":"Cancelaciones y reprogramaciones","body":"Puedes cancelar o reprogramar tu cita escribiéndonos con al menos 2 horas de anticipación. Las citas no atendidas y no canceladas podrán ser ocupadas por otro cliente.\n\nNos reservamos el derecho de reprogramar una cita por causas de fuerza mayor, avisando por los canales de contacto disponibles."},{"heading":"Precios y pagos","body":"Los precios publicados son de referencia y pueden actualizarse sin previo aviso. El monto final se confirma al momento del servicio.\n\nAceptamos efectivo, Pago Móvil y transferencia bancaria."},{"heading":"Limitación de responsabilidad","body":"Trabajamos con productos y protocolos profesionales, pero no respondemos por reacciones alérgicas derivadas de condiciones no informadas por el cliente antes del servicio.\n\nTampoco respondemos por interrupciones del servicio derivadas de fallas de terceros (hosting, red o proveedores de mensajería)."},{"heading":"Modificaciones","body":"Podemos actualizar estos términos para reflejar cambios operativos o legales. La versión vigente es la publicada en esta página, con su fecha de última actualización."}]}'
);

INSERT OR IGNORE INTO content (section, data) VALUES (
  'legal.privacy',
  '{"title":"Política de Privacidad","updatedAt":"2026-09-23","intro":"En Gods Good BarberShop cuidamos tus datos personales. Esta política explica qué información recopilamos, para qué la usamos y cómo puedes ejercer tus derechos.","sections":[{"heading":"Responsable del tratamiento","body":"El responsable del tratamiento es Gods Good BarberShop, con domicilio en Maracaibo, Venezuela. Para cualquier consulta sobre privacidad puedes escribirnos a nuestro correo de contacto."},{"heading":"Datos que recopilamos","body":"Al reservar una cita recopilamos tu nombre, correo electrónico, número de teléfono y, de forma opcional, un mensaje con detalles de tu solicitud.\n\nTambién registramos la fecha y hora de la cita y datos técnicos mínimos (como la zona horaria) necesarios para gestionar la agenda."},{"heading":"Finalidad del tratamiento","body":"Usamos tus datos exclusivamente para gestionar y confirmar tu cita, recordarte el servicio y atender consultas relacionadas.\n\nNo utilizamos tus datos para publicidad de terceros ni los vendemos o cedemos con fines comerciales."},{"heading":"Servicios de terceros","body":"Para agendar y recordar citas podemos sincronizar la información con Google Calendar. Los enlaces de WhatsApp y los mapas embebidos son provistos por Meta y Google, respectivamente, y se rigen por sus propias políticas de privacidad."},{"heading":"Conservación de los datos","body":"Conservamos los datos de tus citas mientras exista una relación de servicio o durante el tiempo necesario para cumplir obligaciones administrativas. Después los eliminamos o anonimizamos."},{"heading":"Seguridad","body":"Aplicamos medidas técnicas y organizativas razonables para proteger tu información, incluyendo acceso restringido al panel de administración y conexiones cifradas."},{"heading":"Tus derechos","body":"Puedes solicitar acceso, corrección, actualización o eliminación de tus datos personales escribiéndonos por correo electrónico o WhatsApp. Responderemos en un plazo razonable.\n\nTambién puedes solicitar que dejemos de contactarte por cualquiera de nuestros canales."},{"heading":"Cambios en esta política","body":"Podemos actualizar esta política para reflejar mejoras en nuestros procesos. Publicaremos la versión vigente en esta misma página indicando la fecha de última actualización."}]}'
);

-- home.contact: add the new fields without touching existing (edited) values.
UPDATE content
SET data = json_set(
  data,
  '$.hoursTitle', COALESCE(json_extract(data, '$.hoursTitle'), 'Horario de atención'),
  '$.formTitle', COALESCE(json_extract(data, '$.formTitle'), 'Escríbenos'),
  '$.formSubtitle', COALESCE(json_extract(data, '$.formSubtitle'), 'Cuéntanos qué necesitas y te respondemos al instante.'),
  '$.formButtonText', COALESCE(json_extract(data, '$.formButtonText'), 'Enviar mensaje')
)
WHERE section = 'home.contact';
