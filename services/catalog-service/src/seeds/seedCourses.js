require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Course = require('../models/Course');

const categoriesData = [
  {
    name: 'Programación & Desarrollo Web',
    slug: 'programacion',
    description: 'Cursos completos de Full Stack, Python, React, Spring Boot, APIs y DevOps.',
    icon: 'Code',
    order: 1,
    isActive: true
  },
  {
    name: 'Oficios & Soldadura Profesional',
    slug: 'soldadura-oficios',
    description: 'Capacitación práctica en soldadura SMAW, TIG, MIG/MAG, normas AWS y herrería moderna.',
    icon: 'Wrench',
    order: 2,
    isActive: true
  },
  {
    name: 'Diseño Gráfico & Modelado 3D',
    slug: 'diseno-3d',
    description: 'Domina Blender 3D, Figma, UI/UX, animación digital y modelado para videojuegos.',
    icon: 'Palette',
    order: 3,
    isActive: true
  },
  {
    name: 'Inteligencia Artificial & Datos',
    slug: 'ia-datos',
    description: 'Machine Learning práctico, prompts avanzados, LLMs, Computer Vision y Data Science.',
    icon: 'Cpu',
    order: 4,
    isActive: true
  },
  {
    name: 'Ciberseguridad & Redes',
    slug: 'ciberseguridad',
    description: 'Ethical Hacking, pentesting, seguridad en Linux, redes Cisco y defensa cibernética.',
    icon: 'Shield',
    order: 5,
    isActive: true
  },
  {
    name: 'Marketing & Negocios Digitales',
    slug: 'negocios-marketing',
    description: 'E-commerce, tráfico pago con Meta & Google Ads, embudos de venta y automatización.',
    icon: 'TrendingUp',
    order: 6,
    isActive: true
  }
];

const seedDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://admin:adminsecretpassword@localhost:27017/omnitron_catalog?authSource=admin';

  try {
    await mongoose.connect(mongoURI);
    console.log('🌱 Conectado a MongoDB...');

    // Limpiar colecciones anteriores
    await Category.deleteMany();
    await Course.deleteMany();
    console.log('🗑️  Colecciones de categorías y cursos limpiadas.');

    // 1. Insertar Categorías de Cursos
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`✅ ${createdCategories.length} categorías de cursos creadas.`);

    const catMap = {};
    createdCategories.forEach(cat => {
      catMap[cat.slug] = cat._id;
    });

    // 2. Insertar Cursos con temarios detallados y enlaces Drive
    const coursesData = [
      // --- PROGRAMACIÓN ---
      {
        title: 'Master en JavaScript Moderno, Node.js y React 19',
        slug: 'master-javascript-react-node',
        description: 'Domina el ecosistema JavaScript desde cero hasta nivel Senior. Aprende ECMAScript moderno, TypeScript, Node.js con Express, React 19 con Hooks avanzados, Zustand, TailwindCSS y despliegue en producción.',
        imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80',
        price: 89.99,
        discountPrice: 29.99,
        category: catMap['programacion'],
        isFeatured: true,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Master_JS_React_VIP_Folder',
        syllabus: [
          {
            title: 'Módulo 1: Fundamentos Modernos de ECMAScript 2024+',
            description: 'Sintaxis avanzada, closures, scope léxico, promesas, async/await y manipulación del DOM.'
          },
          {
            title: 'Módulo 2: Backend con Node.js, Express y MongoDB',
            description: 'Arquitectura MVC, autenticación JWT stateless, validaciones con Zod y bases de datos NoSQL.'
          },
          {
            title: 'Módulo 3: React 19 Fullstack & Server Components',
            description: 'Hooks nativos, gestión de estado con Zustand, optimización con memoización y consumo de APIs.'
          },
          {
            title: 'Módulo 4: Proyecto Real y Despliegue en Servidores Linux',
            description: 'Containerización con Docker, configuración de Nginx como Reverse Proxy y CI/CD en GitHub Actions.'
          }
        ]
      },
      {
        title: 'Arquitectura de Microservicios con Spring Boot 3 y Docker',
        slug: 'microservicios-spring-boot-docker',
        description: 'Aprende a diseñar sistemas distribuidos resilientes, escalables y seguros utilizando Java 21, Spring Boot 3, Spring Security con JWT, Apache Kafka, PostgreSQL y Docker Compose.',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        price: 99.99,
        discountPrice: 34.99,
        category: catMap['programacion'],
        isFeatured: true,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Spring_Boot_Microservices_Folder',
        syllabus: [
          {
            title: 'Módulo 1: Fundamentos de Arquitectura Hexagonal y DDD',
            description: 'Domain-Driven Design, puertos y adaptadores, patrones de desacoplamiento e inyección de dependencias.'
          },
          {
            title: 'Módulo 2: Seguridad y Autenticación Stateless con Spring Security 6',
            description: 'Filtros JWT, Refresh Tokens, CORS global y roles RBAC (Admin, Manager, User).'
          },
          {
            title: 'Módulo 3: Comunicación Asíncrona con Apache Kafka',
            description: 'Productores, consumidores, particionado de tópicos, manejo de eventos y garantía de entrega.'
          },
          {
            title: 'Módulo 4: API Gateway, Observabilidad y Despliegue en Contenedores',
            description: 'Spring Cloud Gateway, Prometheus, Grafana, Docker multi-stage y orquestación con Docker Compose.'
          }
        ]
      },

      // --- OFICIOS & SOLDADURA ---
      {
        title: 'Curso Profesional de Soldadura Industrial: TIG, MIG/MAG y SMAW',
        slug: 'curso-profesional-soldadura-industrial',
        description: 'Capacitación exhaustiva y 100% práctica en técnicas de soldadura por electrodo revestido (SMAW), proceso TIG para aceros inoxidables y aluminio, y sistema MIG/MAG para calderería y herrería de alta resistencia. Basado en código AWS D1.1.',
        imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
        price: 79.99,
        discountPrice: 24.99,
        category: catMap['soldadura-oficios'],
        isFeatured: true,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Soldadura_Industrial_Full_AWS',
        syllabus: [
          {
            title: 'Módulo 1: Seguridad Industrial, EPP y Metalurgia Básica',
            description: 'Normas de seguridad en taller caliente, selección de gases de protección (Argón, CO2, mezclas) y tipos de aceros.'
          },
          {
            title: 'Módulo 2: Soldadura por Arco Eléctrico con Electrodo Revestido (SMAW)',
            description: 'Clasificación de electrodos (E6011, E6013, E7018), regulación de amperaje, encendido de arco y posiciones 1G a 4G.'
          },
          {
            title: 'Módulo 3: Soldadura Semiautomática MIG/MAG (GMAW / FCAW)',
            description: 'Ajuste de velocidad de alambre y voltaje, técnicas de empuje y arrastre, soldeo de perfiles y tubos estructurales.'
          },
          {
            title: 'Módulo 4: Soldadura TIG de Precisión (GTAW)',
            description: 'Afilado de electrodo de tungsteno, uso de pedal de alta frecuencia, adición de material de aporte en acero inoxidable y aluminio.'
          },
          {
            title: 'Módulo 5: Inspección Visual y Ensayos No Destructivos (END)',
            description: 'Detección de defectos comunes (porosidad, falta de penetración, socavado) según estándares AWS D1.1.'
          }
        ]
      },
      {
        title: 'Taller de Cerrajería Metálica y Fabricación de Estructuras',
        slug: 'taller-cerrajeria-metalica-estructuras',
        description: 'Aprende a diseñar, cortar, nivelar y ensamblar puertas, portones corredizos, rejas de seguridad, escaleras metálicas y muebles industriales de estilo nórdico combinando hierro y madera.',
        imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        price: 69.99,
        discountPrice: 19.99,
        category: catMap['soldadura-oficios'],
        isFeatured: false,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Cerrajeria_Estructuras_Metalicas',
        syllabus: [
          {
            title: 'Módulo 1: Herramientas de Taller y Metrología',
            description: 'Manejo seguro de amoladora angular, tronzadora, escuadras magnéticas y calibrador vernier.'
          },
          {
            title: 'Módulo 2: Técnicas de Corte y Biselado',
            description: 'Corte a 45 y 90 grados en caños estructurales y perfiles en U/L sin deformaciones.'
          },
          {
            title: 'Módulo 3: Construcción de Portones Levadizos y Corredizos',
            description: 'Instalación de guías, ruedas de fundición, cerraduras electromagnéticas y contrapesos.'
          },
          {
            title: 'Módulo 4: Acabado, Pintura Electrostática y Presupuestos',
            description: 'Desengrasado con thinner fosfatizante, aplicación de fondos anticorrosivos epoxi y cálculo de costos y cotizaciones a clientes.'
          }
        ]
      },

      // --- DISEÑO DIGITAL & 3D ---
      {
        title: 'Masterclass en Blender 3D: Modelado, Texturizado y Animación',
        slug: 'masterclass-blender-3d-modelado-animacion',
        description: 'Crea personajes estilizados, entornos fotorrealistas y assets para videojuegos de última generación utilizando Blender 4.x, Substance Painter y motores de render Cycles y EEVEE Next.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        price: 79.99,
        discountPrice: 27.99,
        category: catMap['diseno-3d'],
        isFeatured: true,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Blender_3D_Masterclass_Complete',
        syllabus: [
          {
            title: 'Módulo 1: Interfaz y Flujo de Trabajo en Blender 4',
            description: 'Navegación espacial 3D, atajos de teclado esenciales, modificadores no destructivos y modelado hard-surface.'
          },
          {
            title: 'Módulo 2: Escultura Digital de Personajes',
            description: 'Uso de Dyntopo, pinceles de escultura anatómica, remesh cuadrangular y retopología optimizada para juegos.'
          },
          {
            title: 'Módulo 3: Mapeo UV y Texturizado PBR Fotorrealista',
            description: 'Despliegue de islas UV limpias, shaders procedurales en Shader Editor y mapas de Normales y Rugosidad.'
          },
          {
            title: 'Módulo 4: Iluminación de Estudio y Render Final en Cycles',
            description: 'Esquemas de 3 puntos de luz, HDRI ambientales, composición y exportación de pases de render (OpenEXR).'
          }
        ]
      },
      {
        title: 'Diseño de Interfaces UI/UX Profesional con Figma',
        slug: 'diseno-ui-ux-profesional-figma',
        description: 'Conviértete en Diseñador de Producto Digital. Aprende arquitectura de la información, investigación de usuarios (UX Research), creación de Design Systems escalables y prototipado interactivo de alta fidelidad.',
        imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        price: 69.99,
        discountPrice: 22.99,
        category: catMap['diseno-3d'],
        isFeatured: false,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Figma_UI_UX_Design_System',
        syllabus: [
          {
            title: 'Módulo 1: Principios de Experiencia de Usuario (UX)',
            description: 'Heurísticas de Nielsen, Customer Journey Maps, Wireframing y pruebas de usabilidad.'
          },
          {
            title: 'Módulo 2: Figma a Nivel Avanzado',
            description: 'Auto Layout 5.0, variables de color/espaciado, tokens de diseño y componentes con variantes interactivas.'
          },
          {
            title: 'Módulo 3: Construcción de un Design System Completo',
            description: 'Tipografía fluida, paletas accesibles WCAG AAA, estados de botones y librerías compartidas de equipo.'
          },
          {
            title: 'Módulo 4: Prototipado Inteligente y Handoff para Desarrolladores',
            description: 'Microinteracciones con Smart Animate, especificaciones de código CSS y exportación de assets vectoriales.'
          }
        ]
      },

      // --- INTELIGENCIA ARTIFICIAL & DATOS ---
      {
        title: 'Inteligencia Artificial Práctica: Creación de Agentes y Automatizaciones con Python',
        slug: 'ia-practica-agentes-python-llm',
        description: 'Aprende a integrar modelos de lenguaje avanzados (OpenAI GPT-4o, Google Gemini, Anthropic Claude) en aplicaciones del mundo real. Construye agentes autónomos con LangChain, sistemas RAG con bases vectoriales y flujos automatizados.',
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
        price: 94.99,
        discountPrice: 32.99,
        category: catMap['ia-datos'],
        isFeatured: true,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_AI_Python_Agents_LLM_RAG',
        syllabus: [
          {
            title: 'Módulo 1: Fundamentos de LLMs y Prompt Engineering Avanzado',
            description: 'Modelos probabilísticos, control de temperatura, Few-Shot prompting, Chain of Thought y estructuración de respuestas JSON.'
          },
          {
            title: 'Módulo 2: Sistemas RAG (Retrieval Augmented Generation)',
            description: 'Chunking de documentos PDF, embeddings semánticos, bases vectoriales (ChromaDB / Pinecone) y búsqueda híbrida.'
          },
          {
            title: 'Módulo 3: Agentes Autónomos con Llamadas a Herramientas (Function Calling)',
            description: 'Diseño de agentes que ejecutan código, consultan bases SQL externas y navegan APIs mediante herramientas custom.'
          },
          {
            title: 'Módulo 4: Despliegue de Aplicaciones de IA con FastAPI y Streamlit',
            description: 'Creación de interfaces de chat en tiempo real con WebSockets/SSE y contención de costos de tokens en producción.'
          }
        ]
      },

      // --- CIBERSEGURIDAD & REDES ---
      {
        title: 'Ethical Hacking y Pentesting de Aplicaciones Web desde Cero',
        slug: 'ethical-hacking-pentesting-web',
        description: 'Domina las metodologías de pruebas de penetración siguiendo el estándar OWASP Top 10. Aprende a auditar vulnerabilidades críticas como SQL Injection, XSS, CSRF, autenticaciones rotas y escalamiento de privilegios en Linux.',
        imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        price: 89.99,
        discountPrice: 28.99,
        category: catMap['ciberseguridad'],
        isFeatured: false,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Ethical_Hacking_OWASP_Pentesting',
        syllabus: [
          {
            title: 'Módulo 1: Laboratorio de Seguridad con Kali Linux y Docker',
            description: 'Instalación de máquinas virtuales vulnerables (DVWA, Metasploitable), configuración de redes aisladas y herramientas esenciales.'
          },
          {
            title: 'Módulo 2: Reconocimiento y Enumeración de Redes',
            description: 'Escaneo con Nmap, detección de servicios, fingerprinting con WhatWeb y enumeración de subdominios.'
          },
          {
            title: 'Módulo 3: Ataques OWASP Top 10 en Entornos Controlados',
            description: 'Inyecciones SQL (manuales y con SQLMap), Cross-Site Scripting (Reflected, Stored, DOM), manipulación de sesiones y bypass de WAF.'
          },
          {
            title: 'Módulo 4: Redacción de Informes Técnicos de Auditoría',
            description: 'Clasificación de riesgo según métricas CVSS v3.1, planes de remediación para desarrolladores y buenas prácticas de divulgación responsable.'
          }
        ]
      },

      // --- MARKETING & NEGOCIOS ---
      {
        title: 'Lanzamiento de Negocios Digitales & Estrategias de Tráfico con Meta Ads y TikTok',
        slug: 'lanzamiento-negocios-digitales-trafico-pago',
        description: 'Estrategia completa para validar, estructurar y escalar productos digitales y servicios. Aprende a crear ofertas irresistibles, redactar copywriting de alta conversión y estructurar campañas de pauta publicitaria rentables.',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
        price: 59.99,
        discountPrice: 19.99,
        category: catMap['negocios-marketing'],
        isFeatured: false,
        driveUrl: 'https://drive.google.com/drive/folders/1Omnitron_Marketing_Digital_Funnel_Ads',
        syllabus: [
          {
            title: 'Módulo 1: Validación de Oferta y Avatar de Cliente Ideal',
            description: 'Investigación de nichos desatendidos, formulación de propuesta de valor única y fijación de precios psicológicos.'
          },
          {
            title: 'Módulo 2: Copywriting y Creación de Embudos de Conversión',
            description: 'Estructura de Landing Pages de alta conversión, ganchos de atención, llamados a la acción y automatización por correo.'
          },
          {
            title: 'Módulo 3: Campañas de Tráfico Pago en Meta Ads y TikTok Ads',
            description: 'Configuración de Pixel y CAPI, segmentaciones avanzadas, pruebas A/B de creativos en video y optimización de CPA/ROAS.'
          },
          {
            title: 'Módulo 4: Métricas Clave y Retención de Clientes',
            description: 'Análisis de LTV (Lifetime Value), CAC (Costo de Adquisición), upsells automáticos y fidelización a largo plazo.'
          }
        ]
      }
    ];

    const createdCourses = await Course.insertMany(coursesData);
    console.log(`✅ ${createdCourses.length} cursos online creados exitosamente.`);

    console.log('\n🎉 Base de datos de cursos inicializada a la perfección!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar cursos:', error);
    process.exit(1);
  }
};

seedDB();
