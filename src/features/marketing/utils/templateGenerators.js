export function generateCourseTemplate(templateId, course, refUsername) {
  const { title, description, images, user, category_name } = course;
  const authorName = user ? `${user.name} ${user.last_name || ''}`.trim() : 'Autor Destacado';
  const authorBio = user?.biography || 'Experto en su campo con años de experiencia impartiendo conocimientos transformadores.';
  const authorImage = user?.profile_photo_path || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName) + '&background=random';
  const heroImage = images && images.length > 0 ? images[0].image : 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80';
  const ctaUrl = `/preregistro/${refUsername}?lado=automatico`;
  
  if (templateId === 'demo-light-clean') {
    return generateLightClean(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  } else if (templateId === 'demo-minimal-impact') {
    return generateMinimalImpact(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  } else {
    // Default to Dark Pro
    return generateDarkPro(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, category_name);
  }
}

function generateDarkPro(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #18D600; --bg: #0f172a; --text: #f8fafc; --surface: #1e293b; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
        body { background-color: var(--bg); color: var(--text); line-height: 1.6; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
        
        /* Hero */
        .hero { position: relative; padding: 100px 0; display: flex; align-items: center; min-height: 80vh; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; z-index: -2; background: url('${heroImage}') center/cover no-repeat; opacity: 0.3; }
        .hero-overlay { position: absolute; inset: 0; z-index: -1; background: linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.7)); }
        
        .badge { display: inline-block; padding: 6px 12px; background: rgba(24, 214, 0, 0.2); color: var(--primary); border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 20px; letter-spacing: 1px; text-transform: uppercase; }
        
        .hero-content { max-width: 650px; }
        h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
        .hero-desc { font-size: 1.25rem; color: #cbd5e1; margin-bottom: 40px; }
        
        /* Buttons */
        .btn { display: inline-block; padding: 16px 32px; background: var(--primary); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem; transition: transform 0.2s, box-shadow 0.2s; border: none; cursor: pointer; text-align: center; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(24, 214, 0, 0.3); }
        
        /* Two Column Section */
        .section-split { display: flex; flex-wrap: wrap; gap: 40px; padding: 80px 0; align-items: center; }
        .col { flex: 1; min-width: 300px; }
        h2 { font-size: 2.2rem; margin-bottom: 20px; }
        .col p { color: #94a3b8; font-size: 1.1rem; margin-bottom: 20px; }
        
        /* Author Card */
        .author-card { background: var(--surface); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.05); }
        .author-flex { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        .author-img { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); }
        .author-info h3 { font-size: 1.5rem; margin-bottom: 4px; }
        .author-info span { color: var(--primary); font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        
        /* CTA Section */
        .cta-section { text-align: center; padding: 100px 20px; background: linear-gradient(to top, rgba(24,214,0,0.1), transparent); }
        .cta-section h2 { font-size: 2.5rem; margin-bottom: 30px; }
        
        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .hero { padding: 60px 0; text-align: center; }
            .hero-content { margin: 0 auto; }
            .hero-bg { opacity: 0.2; }
            .hero-overlay { background: linear-gradient(to bottom, rgba(15,23,42,0.8), rgba(15,23,42,0.95)); }
        }
    </style>
</head>
<body>

    <header class="hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="container hero-content">
            <span class="badge" data-editable="true" data-field="categoria">${categoryName || 'Curso Exclusivo'}</span>
            <h1 data-editable="true" data-field="titulo">${title || 'Título del Curso'}</h1>
            <p class="hero-desc" data-editable="true" data-field="subtitulo">Aprende con los mejores y lleva tus habilidades al siguiente nivel.</p>
            <a href="${ctaUrl}" class="btn" data-editable="true" data-field="cta_texto">¡Quiero Registrarme Ahora!</a>
        </div>
    </header>

    <section class="container section-split">
        <div class="col">
            <h2>Acerca de este programa</h2>
            <p data-editable="true" data-field="descripcion">${description || 'Descripción del curso...'}</p>
        </div>
        <div class="col">
            <div class="author-card">
                <div class="author-flex">
                    <img src="${authorImage}" alt="Autor" class="author-img">
                    <div class="author-info">
                        <h3 data-editable="true" data-field="docente_nombre">${authorName}</h3>
                        <span>Creador / Instructor</span>
                    </div>
                </div>
                <p data-editable="true" data-field="docente_bio">${authorBio}</p>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>¿Listo para empezar tu transformación?</h2>
            <a href="${ctaUrl}" class="btn" data-editable="true" data-field="cta_texto_secundario">Acceder al Programa</a>
        </div>
    </section>

</body>
</html>`;
}

function generateLightClean(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
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

function generateMinimalImpact(title, description, authorName, authorBio, authorImage, heroImage, ctaUrl, categoryName) {
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
