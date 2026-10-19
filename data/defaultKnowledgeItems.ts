import { KnowledgeItem } from '../types';

export const defaultKnowledgeItems: KnowledgeItem[] = [
  // INSTITUTIONAL & CULTURE
  {
    id: 'ki-1',
    title: 'Bienvenida institucional y Mensaje del Director',
    description:
      'Un mensaje de bienvenida de la máxima autoridad, junto con la misión, visión y estructura general del organismo.',
    category: 'INSTITUTIONAL',
    url: 'https://drive.google.com/file/d/1mTr6zGaRhFkMWWarrWTGEOlVAvWH41tz/view',
    isGlobal: true,
  },
  {
    id: 'ki-2',
    title: 'Nuestra Cultura y Valores',
    description:
      'Descubre los valores que nos guían, nuestra cultura de trabajo, estilo de comunicación y buenas prácticas internas.',
    category: 'INSTITUTIONAL',
    url: 'https://example.com/cultura',
    isGlobal: true,
  },
  {
    id: 'ki-3',
    title: 'Guía Administrativa Esencial (RRHH)',
    description:
      'Todo lo que necesitas para empezar: acceso a sistemas (correo, VPN), guías de licencias, beneficios y calendario laboral.',
    category: 'INSTITUTIONAL',
    url: 'https://equipoba.buenosaires.gob.ar/',
    isGlobal: true,
  },

  // TEAM & ROLES
  {
    id: 'ki-4',
    title: 'Organigrama del Equipo y Contactos Clave',
    description:
      'Conoce la estructura de tu área, quién es quién y encuentra un directorio con roles y contactos relevantes.',
    category: 'TEAM',
    url: 'https://cdn2.buenosaires.gob.ar/organigrama/Organigrama_GCBA_2026.pdf',
    isGlobal: true,
  },

  // TOOLS & PROCEDURES
  {
    id: 'ki-5',
    title: 'Herramientas Digitales Principales',
    description:
      'Listado de las herramientas digitales que más usamos (Microsoft Sharepoint, Teams, SADE) con enlaces a tutoriales.',
    category: 'TOOLS',
    url: 'https://example.com/herramientas',
    isGlobal: true,
  },
  {
    id: 'ki-6',
    title: 'Glosario Técnico y Acrónimos',
    description:
      'Un diccionario con la terminología y los acrónimos más comunes del área para que te familiarices con nuestro lenguaje.',
    category: 'TOOLS',
    url: 'https://example.com/glosario',
    isGlobal: true,
  },
  {
    id: 'ki-7',
    title: 'Documentación de Arquitectura',
    description: 'Documentación técnica detallada sobre la arquitectura de nuestro sistema principal, "Proyecto Phoenix".',
    category: 'TOOLS',
    url: 'https://example.com/arquitectura-phoenix',
    isGlobal: true,
  },

  // ROLE GUIDE
  {
    id: 'ki-8',
    title: 'Guía de Estilo de Código Frontend',
    description:
      'Nuestras mejores prácticas y convenciones para escribir código limpio, consistente y mantenible en el frontend.',
    category: 'ROLE_GUIDE',
    url: 'https://example.com/frontend-style-guide',
    isGlobal: true,
  },
  {
    id: 'ki-9',
    title: 'Hoja de Ruta: Primeros 30 Días',
    description: 'Tus objetivos y principales hitos para el primer mes. Un mapa claro para asegurar un arranque exitoso.',
    category: 'ROLE_GUIDE',
    url: 'https://example.com/hoja-de-ruta',
    isGlobal: true,
  },

  // MILESTONES & FOLLOW-UP
  {
    id: 'ki-10',
    title: 'Hitos y Reuniones Clave de Onboarding',
    description:
      'Un calendario con las fechas de las reuniones clave: bienvenida, seguimiento semanal y cierre del primer mes.',
    category: 'MILESTONES',
    url: 'https://example.com/hitos',
    isGlobal: true,
  },
  
  // SUPPORT & QUESTIONS  
  {
    id: 'ki-11',
    title: 'Canales de Comunicación del Equipo',
    description:
      'Acceso directo a nuestros canales de Slack/Teams para preguntas rápidas, anuncios y charlas informales.',
    category: 'SUPPORT',
    url: 'https://slack.com/team-channel',
    isGlobal: true,
  },
  {
    id: 'ki-12',
    title: 'Encuesta de Calidad del Onboarding',
    description:
      'Tu feedback es clave. Al final del proceso, te pediremos que completes esta encuesta sobre tu experiencia.',
    category: 'SUPPORT',
    url: 'https://forms.gle/TTWAT1qJtqUC6VCN8',
    visibleOnDay: 20,
    isGlobal: true,
  },
  {
    id: 'ki-13',
    title: 'Cómo llegar al lugar de trabajo',
    description:
      'Indicaciones de acceso al edificio, transporte público cercano y referencias útiles para la presencialidad.',
    category: 'INSTITUTIONAL',
    url: 'https://example.com/ubicacion',
    isGlobal: true,
  },
  {
    id: 'ki-14',
    title: 'Nomenclador de Puestos del GCBA',
    description:
      'Descripción de cargos, roles y nomenclaturas utilizadas dentro de la estructura del Gobierno de la Ciudad.',
    category: 'INSTITUTIONAL',
    url: 'https://example.com/nomenclador',
    isGlobal: true,
  }
];
