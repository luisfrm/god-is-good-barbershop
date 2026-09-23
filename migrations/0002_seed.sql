-- Seed: current hardcoded site content + business settings.
-- The app has NO silent content fallbacks — these rows are required.

INSERT OR REPLACE INTO content (section, data) VALUES (
  'site.meta',
  '{"name":"Gods Good BarberShop","shortName":"Gods Good","slogan":"Estilo Clásico, Toque Moderno","tagline":"Experiencia de barbería premium desde 2024","description":"Barbería de estilo clásico ofreciendo cortes de cabello y afeitados profesionales en un ambiente acogedor y vintage en Maracaibo.","since":2024,"keywords":["barbería Maracaibo","corte de pelo","afeitado","barbero","estilo clásico","Gods Good BarberShop"]}'
);

INSERT OR REPLACE INTO content (section, data) VALUES (
  'site.nav',
  '{"items":[{"text":"Inicio","href":"#home"},{"text":"Servicios","href":"#services"},{"text":"Sobre nosotros","href":"#about"},{"text":"Contacto","href":"#contact"},{"text":"Reservar","href":"/reservar"}]}'
);

INSERT OR REPLACE INTO content (section, data) VALUES (
  'home.hero',
  '{"eyebrow":"Barbería Clásica · Maracaibo","title":"Estilo Clásico, Toque Moderno","subtitle":"Experiencia de barbería premium desde 2024","ctaPrimaryText":"Reserva tu cita","ctaPrimaryHref":"/reservar","ctaSecondaryText":"Ver servicios","ctaSecondaryHref":"/#services","imageDesktop":"https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_1920,h_1080,ar_16:9/v1732250788/wp9441481_xecwvr.webp","imageMobile":"https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_385,h_684,ar_9:16/v1732250788/wp9441481_xecwvr.webp","imageAlt":"Interior de la barbería"}'
);

INSERT OR REPLACE INTO content (section, data) VALUES (
  'home.services',
  '{"eyebrow":"Lo que ofrecemos","title":"Nuestros Servicios","subtitle":"Servicios clásicos y modernos realizados con productos de primera calidad.","items":[{"name":"Corte de Pelo","price":"25€","description":"Corte personalizado según tu estilo y preferencias.","icon":"scissors"},{"name":"Arreglo de Barba","price":"15€","description":"Perfilado y cuidado profesional de tu barba.","icon":"beard"},{"name":"Lavado y Peinado","price":"10€","description":"Lavado con productos premium y peinado a tu gusto.","icon":"spray"}]}'
);

INSERT OR REPLACE INTO content (section, data) VALUES (
  'home.about',
  '{"eyebrow":"Sobre nosotros","title":"Sobre Nosotros","paragraphs":["Con más de 5 años de experiencia, nuestro equipo de barberos expertos se dedica a proporcionar cortes de pelo y servicios de barbería de la más alta calidad. Nos enorgullecemos de crear un ambiente acogedor y profesional donde cada cliente se sienta valorado y atendido.","Utilizamos técnicas modernas y productos de primera calidad para asegurar que cada visita a nuestra barbería sea una experiencia excepcional. Ya sea que busques un corte clásico o un estilo moderno, estamos aquí para ayudarte a lucir y sentirte lo mejor posible."],"image":"https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_684,h_684,ar_1:1/v1732254554/photo-1605497788044-5a32c7078486-compress_l4cbk7.webp","imageAlt":"Barbería Gods Good","ctaText":"Reserva tu cita","ctaHref":"/reservar"}'
);

INSERT OR REPLACE INTO content (section, data) VALUES (
  'home.contact',
  '{"eyebrow":"Estamos para servirte","title":"Contacto","whatsappText":"Reserva tu cita","mapText":"Ver ubicación","addressTitle":"Dirección","phoneTitle":"Teléfono","emailTitle":"Email"}'
);

INSERT OR REPLACE INTO settings (
  id, business_name, short_name, slogan, tagline, description, since,
  phone, phone_display, whatsapp_url, email, address, maps_url,
  work_hours, timezone, session_duration
) VALUES (
  1,
  'Gods Good BarberShop',
  'Gods Good',
  'Estilo Clásico, Toque Moderno',
  'Experiencia de barbería premium desde 2024',
  'Barbería de estilo clásico ofreciendo cortes de cabello y afeitados profesionales en un ambiente acogedor y vintage en Maracaibo.',
  2024,
  '+584246248690',
  '(+58) 424-6248690',
  'https://api.whatsapp.com/send?phone=584246248690',
  'info@barbershop.com',
  'Calle 89 Av. 7, Maracaibo',
  'https://maps.app.goo.gl/wMSAPhbnzKqrcQhY8',
  '[{"day":"tuesday","ranges":[{"start":"09:00","end":"18:00"}]},{"day":"wednesday","ranges":[{"start":"09:00","end":"18:00"}]},{"day":"thursday","ranges":[{"start":"09:00","end":"18:00"}]},{"day":"friday","ranges":[{"start":"09:00","end":"18:00"}]},{"day":"saturday","ranges":[{"start":"09:00","end":"18:00"}]}]',
  'America/Caracas',
  45
);
