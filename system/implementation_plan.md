# Plan de Rediseño Estético y Adaptación a `nuevo_css.jpeg` - Micelia

Este plan detalla la reestructuración completa y adaptación visual de la página principal de Micelia ([`system/dashboard/index.html`](file:///home/jnovoas/Proyectos/micellia/system/dashboard/index.html) y [`system/dashboard/public.css`](file:///home/jnovoas/Proyectos/micellia/system/dashboard/public.css)) siguiendo la maqueta corporativa enviada por el cliente ([`nuevo_css.jpeg`](file:///home/jnovoas/Proyectos/micellia/Documentos%20Micelia/nuevo_css.jpeg)).

---

## User Review Required

> [!IMPORTANT]
> **Cambios Visuales Principales:**
> 1. **Tipografía Elegante Serif:** Se incorpora la fuente Google Font `Cormorant Garamond` (o `Playfair Display`) para encabezados principales y títulos de sección, conservando `Outfit` / `Inter` para textos de cuerpo y navegación.
> 2. **Paleta de Colores Dual Orgánica:** Fondo crema / beige cálido (`#f5f1ea`) para secciones claras del cuerpo y Verde Bosque profundo (`#1b2e21` / `#16251b`) para Navbar, banners oscuros y tarjetas destacadas, con acentos en Oro Champán (`#c3b59f`).
> 3. **Preservación de Requisitos Regla AGENTS.md:**
>    - Acceso rápido WhatsApp para Pack Adulto Mayor (`"Hola Micelia, quisiera pedir el Pack Adulto Mayor de setas de 500g"`).
>    - Telemetría de sensores S60 (Humedad 85%-95%, CO₂ < 900 ppm, Temp 18°C-22°C).
>    - Despliegue en servidor de producción `fan` (`157.254.174.40`) mediante `make -C system deploy`.

---

## Proposed Changes

---

### Dashboard Web Public (`system/dashboard`)

#### [MODIFY] [index.html](file:///home/jnovoas/Proyectos/micellia/system/dashboard/index.html)
- **Carga de Fuentes:** Importar `Cormorant Garamond` desde Google Fonts.
- **Header / Navbar:** 
  - Rediseñar en verde bosque oscuro con subtítulo corporativo *"CULTIVO TÉCNICO DE HONGO OSTRA"*.
  - Enlaces de navegación centrado: `Inicio`, `Sobre Micelia`, `Nuestro Hongo`, `Proceso`, `Tienda`, `Camino Micelia`, `Contacto`.
  - Iconos de usuario y carrito con contador.
- **Sección Héroe (Hero):**
  - Fondo crema cálido.
  - Columna izquierda: Subtítulo `DESDE CURANILAHUE, PROVINCIA DE ARAUCO`, título Serif `Cultivamos bienestar de forma sostenible`, párrafo descriptivo, botones `CONOCE NUESTRO HONGO` (verde píldora) e `IR A LA TIENDA` (outline), e íconos de pilares (Sostenible, Saludable, Local).
  - Columna derecha: Imagen destacada de hongos ostra con insignia flotante *"HONGO 100% NATURAL"*.
- **Sección "Camino Micelia" (Revista / Educación):**
  - Contenedor verde bosque con esquinas redondeadas.
  - Imagen del sendero del bosque, descripción, botón de acción champán `LEER REVISTAS ->` y carrusel de portadas `Camino Micelia N°1, N°2, N°3`.
- **Sección "Nuestro Proceso":**
  - 6 pasos horizontales con íconos vectoriales y flechas de flujo: `Sustrato Local` → `Preparación` → `Inoculación` → `Incubación` → `Fructificación` → `Cosecha`.
- **Sección Nutricional & Newsletter:**
  - Banner verde de 4 pilares: `Alto en Nutrientes`, `Bajo en Calorías`, `Fortalece tu Sistema Inmune`, `Apoya tu Bienestar`.
  - Tarjeta de suscripción *Sé Parte del Camino* con input de email y botón verde.
- **Pie de Página (Footer):**
  - Copyright, enlaces a redes sociales, ubicación `Curanilahue, Provincia de Arauco` y firma de desarrollo comunitario.

#### [MODIFY] [public.css](file:///home/jnovoas/Proyectos/micellia/system/dashboard/public.css)
- Actualizar variables de color CSS (`:root`):
  - `--bg-warm`: `#f5f1ea`
  - `--bg-dark-forest`: `#1b2e21`
  - `--bg-dark-card`: `#16251b`
  - `--accent-gold`: `#c3b59f`
  - `--text-dark`: `#1f2d22`
  - `--font-serif`: `'Cormorant Garamond', serif`
- Definir estilos responsive para la grilla del Hero, las tarjetas del Camino Micelia, la tubería del proceso en 6 pasos y la tarjeta de suscripción.

---

## Verification Plan

### Manual & Visual Verification
1. **Inspección Visual del Rediseño:**
   - Verificar la coherencia estética de las tipografías Serif y colores de la imagen [`nuevo_css.jpeg`](file:///home/jnovoas/Proyectos/micellia/Documentos%20Micelia/nuevo_css.jpeg).
   - Verificar que todos los botones, carrusel y flujos interactivos funcionen suavemente.
2. **Pruebas de Despliegue Remoto en Producción:**
   - Ejecutar `make -C system deploy` para enviar los cambios al servidor de producción (`157.254.174.40`).
   - Comprobar la carga correcta en `https://pinguinoseguro.cl/micelia/` (o la IP del servidor).
