export function generateCourseTemplate(templateId, course, refUsername) {
  const { title, description, objectives, images, user, category_name } = course;
  const authorName = user ? `${user.name} ${user.last_name || ''}`.trim() : 'Autor Destacado';
  const authorBio = user?.biography || 'Experto en su campo con años de experiencia impartiendo conocimientos transformadores.';
  const authorImage = user?.profile_photo_path || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random';
  const heroImage = images && images.length > 0 ? images[0].image : 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';
  const ctaUrl = `/preregistro/${refUsername}?lado=automatico`;
  
  if (templateId === 'demo-light-clean') {
    return generateLightClean(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  } else if (templateId === 'demo-minimal-impact') {
    return generateMinimalImpact(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  } else {
    // Default to Dark Pro
    return generateDarkPro(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  }
}

function generateDarkPro(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
  const logoUrl = typeof window !== 'undefined' ? window.location.origin + '/images/logo-principal.png' : '/images/logo-principal.png';
  const faviconUrl = typeof window !== 'undefined' ? window.location.origin + '/images/logo/favicon.ico' : '/images/logo/favicon.ico';
  return `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" type="image/svg+xml" href="${faviconUrl}" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: { sans: ['Inter', 'sans-serif'] },
            colors: {
              background: '#0a0a0a',
              card: '#171717',
              border: '#262626'
            }
          }
        }
      }
    </script>
    <style>
      body { background-color: #0a0a0a; color: #a3a3a3; }
      .text-glow { text-shadow: 0 0 20px rgba(255,255,255,0.1); }
    </style>
</head>
<body class="antialiased">

  <!-- Navbar / Header Brand -->
  <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10">
    <div class="flex items-center opacity-90">
      <img src="${logoUrl}" alt="Promolider" class="h-9 md:h-11 object-contain">
    </div>
  </div>

  <div class="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-12 lg:gap-20">
    
    <!-- Columna Principal (Izquierda) -->
    <div class="lg:w-[60%] xl:w-[65%]">
      
      <!-- Imagen / Flyer -->
      <div class="w-full aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden mb-8 shadow-2xl">
        <img src="${heroImage}" alt="Flyer del evento" class="w-full h-full object-cover">
      </div>
      
      <!-- Encabezado -->
      <div class="mb-4">
        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5" data-editable="true" data-field="categoria">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          ${categoryName || 'Inscripciones abiertas'}
        </span>
      </div>
      <h1 class="text-3xl md:text-[42px] font-bold text-white mb-4 leading-[1.1] tracking-tight" data-editable="true" data-field="titulo">
        ${title || 'Master Class de los Nervios al Impacto'}
      </h1>
      
      <div class="flex items-center gap-2 mb-8 text-sm">
        <span>Creado por</span>
        <div class="flex items-center gap-2 text-white font-medium">
          <img src="${authorImage}" class="w-6 h-6 rounded-full object-cover" alt="Autor">
          <span data-editable="true" data-field="docente_nombre">${authorName}</span>
        </div>
      </div>
      
      <!-- Descripción principal -->
      <div class="text-[17px] mb-10 leading-relaxed text-gray-300" data-editable="true" data-field="subtitulo">
        <p>${description || 'Formas parte de la comunidad exclusiva, y por eso, tienes acceso prioritario a una Master Class memorable. Aprende las técnicas exactas para dominar el escenario y transmitir tu mensaje con total seguridad.'}</p>
      </div>
      
      <!-- Objetivos -->
      <div class="mb-16 bg-card border border-border p-8 rounded-2xl">
        <h2 class="text-2xl font-bold text-white mb-4">Lo que lograrás</h2>
        <div class="text-gray-400 leading-relaxed whitespace-pre-line" data-editable="true" data-field="objetivos">${objectives || 'En este programa aprenderás a estructurar tus ideas, comunicar con impacto y conseguir resultados extraordinarios paso a paso.'}</div>
      </div>
      
      <!-- Detalles Grid (Fecha / Ubicación) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16 border-y border-border py-8">
        <div class="flex gap-4 items-start">
          <div class="bg-card p-3 rounded-xl border border-border text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <h4 class="text-white text-sm font-semibold mb-0.5">Disponibilidad</h4>
            <p class="text-xs text-gray-400">Acceso Inmediato</p>
          </div>
        </div>
        <div class="flex gap-4 items-start">
          <div class="bg-card p-3 rounded-xl border border-border text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <div>
            <h4 class="text-white text-sm font-semibold mb-0.5">Ubicación virtual</h4>
            <p class="text-xs text-gray-400">Disponible al completar tu registro.</p>
          </div>
        </div>
      </div>
      
      <!-- Acerca del creador -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-white mb-8">Acerca del creador</h2>
        <div class="flex flex-col sm:flex-row gap-6 items-start">
          <img src="${authorImage}" class="w-24 h-24 rounded-full border border-border object-cover" alt="Autor">
          <div>
            <h3 class="text-xl font-bold text-white mb-3" data-editable="true" data-field="docente_nombre">${authorName}</h3>
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="text-[10px] uppercase font-bold tracking-wider bg-card border border-border px-3 py-1.5 rounded-full text-gray-300">#MENTOR</span>
              <span class="text-[10px] uppercase font-bold tracking-wider bg-card border border-border px-3 py-1.5 rounded-full text-gray-300">#EXPERT</span>
            </div>
            <p class="text-sm text-gray-400 leading-relaxed" data-editable="true" data-field="docente_bio">${authorBio || 'Mentor, Escritor y Fundador con más de 15 años de experiencia formando líderes. Un estratega que entiende la comunicación como un diseño divino y ha decodificado las leyes del impacto.'}</p>
          </div>
        </div>
      </div>
      
      <!-- Lo que dicen otros -->
      <div class="mb-16">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold text-white">Lo que dicen otros</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" data-repeatable-list="testimonios">
           <!-- Testimonio 1 -->
           <div class="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between" data-repeatable-item="testimonios">
             <div>
               <div class="text-5xl text-gray-700 font-serif leading-none mb-2">"</div>
               <p class="text-sm text-gray-400 italic mb-6" data-editable="true" data-field="testimonio_1_texto">"El enfoque y las técnicas compartidas transformaron por completo mi seguridad al hablar. Antes el miedo me paralizaba, hoy conecto con mi audiencia desde el primer segundo."</p>
             </div>
             <div class="flex items-center gap-3 mt-auto">
               <div class="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-800/50">M</div>
               <span class="text-sm font-semibold text-white" data-editable="true" data-field="testimonio_1_autor">Miranda Rivero</span>
             </div>
           </div>
           <!-- Testimonio 2 -->
           <div class="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between" data-repeatable-item="testimonios">
             <div>
               <div class="text-5xl text-gray-700 font-serif leading-none mb-2">"</div>
               <p class="text-sm text-gray-400 italic mb-6" data-editable="true" data-field="testimonio_2_texto">"Siempre sentí que mi mensaje era poderoso, pero no lograba transmitirlo. Este programa me dio la estructura exacta para impactar y vender mis ideas."</p>
             </div>
             <div class="flex items-center gap-3 mt-auto">
               <div class="w-8 h-8 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-800/50">E</div>
               <span class="text-sm font-semibold text-white" data-editable="true" data-field="testimonio_2_autor">Esteban G.</span>
             </div>
           </div>
        </div>
      </div>
      
      <!-- Preguntas frecuentes -->
      <div class="mb-10">
        <h2 class="text-2xl font-bold text-white mb-8">Preguntas frecuentes</h2>
        <div class="space-y-3" data-repeatable-list="faqs">
          <!-- Item 1 -->
          <div class="bg-card border border-border rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer" data-repeatable-item="faqs">
            <h4 class="text-white text-sm font-semibold flex justify-between items-center">
              <span data-editable="true" data-field="faq_1">¿Para quién es este evento?</span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h4>
          </div>
          <!-- Item 2 -->
          <div class="bg-card border border-border rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer" data-repeatable-item="faqs">
            <h4 class="text-white text-sm font-semibold flex justify-between items-center">
              <span data-editable="true" data-field="faq_2">No soy bueno hablando y me pongo muy nervioso. ¿Esto me servirá?</span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h4>
          </div>
          <!-- Item 3 -->
          <div class="bg-card border border-border rounded-xl p-5 hover:border-gray-600 transition-colors cursor-pointer" data-repeatable-item="faqs">
            <h4 class="text-white text-sm font-semibold flex justify-between items-center">
              <span data-editable="true" data-field="faq_3">¿El acceso es realmente gratuito?</span>
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </h4>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Columna Lateral (Derecha) - Sticky Card -->
    <div class="lg:w-[40%] xl:w-[35%] relative">
      <div class="sticky top-10 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-2xl">
        <span class="text-gray-400 text-sm mb-1 block">Plan completo</span>
        <h2 class="text-[40px] font-bold text-white mb-4 leading-none">Gratis</h2>
        
        <div class="flex flex-wrap gap-2 items-center mb-6">
          <span class="bg-[#262626] text-gray-300 text-xs font-medium px-2.5 py-1 rounded">Acceso Inmediato</span>
          <span class="text-xs text-gray-400 hover:text-white cursor-pointer transition-colors">ver más ▾</span>
        </div>
        
        <!-- Alerta de cupos -->
        <div class="bg-amber-950/30 border border-amber-500/20 text-amber-500 text-[13px] px-4 py-3.5 rounded-xl flex items-center gap-3 mb-6">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span class="font-medium">Las inscripciones están por cerrar</span>
        </div>
        
        <!-- Botón CTA -->
        <div class="flex gap-3 mb-6">
          <button class="w-12 h-12 flex-shrink-0 rounded-xl border border-border bg-[#1f1f1f] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          </button>
          <button class="w-12 h-12 flex-shrink-0 rounded-xl border border-border bg-[#1f1f1f] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </button>
          <a href="${ctaUrl}" class="flex-1 bg-white text-black text-center font-bold text-[15px] py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" data-editable="true" data-field="cta_texto">
            Obtener gratis
          </a>
        </div>
        
        <div class="text-center">
          <p class="flex items-center justify-center gap-1.5 mb-4 text-xs font-medium text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Pago 100% seguro y encriptado
          </p>
          <div class="flex justify-center items-center gap-2 opacity-50">
             <div class="w-8 h-5 bg-gray-700 rounded-sm"></div>
             <div class="w-8 h-5 bg-gray-700 rounded-sm"></div>
             <div class="w-8 h-5 bg-gray-700 rounded-sm"></div>
             <div class="w-8 h-5 bg-gray-700 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
  
  <footer class="border-t border-border mt-16 py-10 text-center text-[11px] text-gray-500 font-medium">
    <div class="flex items-center justify-center gap-2 mb-4">
      <span class="text-gray-400">Plataforma impulsada por</span>
      <img src="${logoUrl}" alt="Promolider" class="h-7 object-contain">
    </div>
    <div class="flex justify-center gap-4">
      <a href="#" class="hover:text-gray-300 transition-colors">Privacidad</a>
      <span>|</span>
      <a href="#" class="hover:text-gray-300 transition-colors">Condiciones</a>
      <span>|</span>
      <a href="#" class="hover:text-gray-300 transition-colors">Reportar anuncio</a>
    </div>
  </footer>

</body>
</html>`;
}

function generateLightClean(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #0ea5e9; --text: #334155; --heading: #0f172a; --bg: #f8fafc; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background-color: var(--bg); color: var(--text); line-height: 1.7; }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 24px; }
        
        .nav { padding: 24px 0; text-align: center; }
        .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: var(--primary); border-radius: 4px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        
        .hero { text-align: center; padding: 60px 0 40px; }
        h1 { font-size: 3rem; font-weight: 700; color: var(--heading); margin: 24px 0; line-height: 1.2; }
        .hero-desc { font-size: 1.2rem; max-width: 700px; margin: 0 auto 40px; color: #64748b; }
        
        .hero-img-container { width: 100%; max-width: 800px; margin: 0 auto 60px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .hero-img { width: 100%; display: block; }
        
        .btn { display: inline-block; padding: 16px 36px; background: var(--primary); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem; transition: all 0.3s; }
        .btn:hover { background: #0284c7; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(14, 165, 233, 0.2); }
        
        .content-box { background: white; border-radius: 16px; padding: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        h2 { color: var(--heading); font-size: 1.8rem; margin-bottom: 20px; }
        
        .author-row { display: flex; align-items: center; gap: 24px; margin-top: 40px; padding-top: 40px; border-top: 1px solid #e2e8f0; }
        .author-img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
        .author-info h4 { color: var(--heading); font-size: 1.2rem; margin-bottom: 4px; }
        .author-info p { font-size: 0.95rem; color: #64748b; }
        
        .bottom-cta { text-align: center; padding: 60px 0 80px; }
        
        @media (max-width: 768px) { h1 { font-size: 2.2rem; } .author-row { flex-direction: column; text-align: center; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav">
            <span class="badge" data-editable="true" data-field="categoria">${categoryName || 'Material Exclusivo'}</span>
        </div>
        
        <header class="hero">
            <h1 data-editable="true" data-field="titulo">${title || 'Título del Contenido'}</h1>
            <p class="hero-desc" data-editable="true" data-field="subtitulo">Una guía clara y estructurada para alcanzar tus objetivos sin complicaciones.</p>
            <a href="${ctaUrl}" class="btn" data-editable="true" data-field="cta_texto">Obtener Acceso</a>
        </header>
        
        <div class="hero-img-container">
            <img src="${heroImage}" alt="Portada" class="hero-img">
        </div>
        
        <main class="content-box">
            <h2>Sobre este contenido</h2>
            <p data-editable="true" data-field="descripcion">${description || 'Descripción...'}</p>
            
            <h2 style="margin-top: 30px;">Lo que lograrás</h2>
            <p data-editable="true" data-field="objetivos" style="white-space: pre-line; margin-bottom: 30px;">${objectives || 'Aprenderás conceptos clave, desarrollarás habilidades prácticas y obtendrás las herramientas necesarias para alcanzar tus metas.'}</p>
            
            <div class="author-row">
                <img src="${authorImage}" alt="Autor" class="author-img">
                <div class="author-info">
                    <h4 data-editable="true" data-field="docente_nombre">${authorName}</h4>
                    <p data-editable="true" data-field="docente_bio">${authorBio}</p>
                </div>
            </div>
        </main>
        
        <div class="bottom-cta">
            <a href="${ctaUrl}" class="btn" data-editable="true" data-field="cta_texto_secundario">Sí, quiero registrarme</a>
        </div>
    </div>
</body>
</html>`;
}

function generateMinimalImpact(title, description, objectives, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #eab308; --bg: #ffffff; --text: #171717; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Roboto', sans-serif; }
        body { background-color: var(--bg); color: var(--text); }
        .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
        
        .split-hero { display: flex; min-height: 100vh; }
        .hero-img-side { flex: 1; background: url('${heroImage}') center/cover; position: relative; }
        .hero-img-side::after { content: ''; position: absolute; inset: 0; background: rgba(0,0,0,0.2); }
        
        .hero-content-side { flex: 1; padding: 60px; display: flex; flex-direction: column; justify-content: center; }
        
        .tag { font-weight: 900; color: #525252; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; margin-bottom: 16px; display: block; }
        h1 { font-size: 3.5rem; font-weight: 900; line-height: 1; margin-bottom: 24px; text-transform: uppercase; }
        .desc { font-size: 1.1rem; color: #404040; margin-bottom: 40px; line-height: 1.6; border-left: 4px solid var(--primary); padding-left: 16px; }
        
        .btn { display: inline-block; padding: 18px 40px; background: var(--text); color: white; text-decoration: none; font-weight: 900; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; transition: background 0.2s; border: none; cursor: pointer; text-align: center; }
        .btn:hover { background: var(--primary); color: var(--text); }
        
        .author-block { margin-top: 60px; }
        .author-block h4 { font-size: 0.9rem; text-transform: uppercase; color: #737373; margin-bottom: 10px; }
        .author-details { display: flex; align-items: center; gap: 16px; }
        .author-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; filter: grayscale(100%); }
        .author-name { font-weight: 700; font-size: 1.1rem; }
        
        @media (max-width: 900px) {
            .split-hero { flex-direction: column; }
            .hero-img-side { min-height: 40vh; }
            .hero-content-side { padding: 40px 20px; }
            h1 { font-size: 2.5rem; }
        }
    </style>
</head>
<body>
    <div class="split-hero">
        <div class="hero-img-side"></div>
        <div class="hero-content-side">
            <div>
                <span class="tag" data-editable="true" data-field="categoria">${categoryName || 'Workshop'}</span>
                <h1 data-editable="true" data-field="titulo">${title || 'Título'}</h1>
                <div class="desc" data-editable="true" data-field="descripcion">${description || 'Descripción...'}</div>
                
                <h3 style="margin-bottom: 12px; font-weight: 700; text-transform: uppercase; font-size: 1rem; color: #404040;">Lo que lograrás</h3>
                <div class="desc" data-editable="true" data-field="objetivos" style="border-left-color: #404040; white-space: pre-line;">${objectives || 'Transformarás tu perspectiva y desarrollarás habilidades clave aplicables desde el primer día.'}</div>
                
                <a href="${ctaUrl}" class="btn" data-editable="true" data-field="cta_texto">Ingresar Ahora</a>
                
                <div class="author-block">
                    <h4>Impartido por</h4>
                    <div class="author-details">
                        <img src="${authorImage}" alt="Autor" class="author-img">
                        <span class="author-name" data-editable="true" data-field="docente_nombre">${authorName}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
