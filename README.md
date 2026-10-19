# Navegador de Onboarding – GCBA

Aplicación piloto para visualizar y gestionar el proceso de onboarding de nuevos ingresos en el Gobierno de la Ciudad de Buenos Aires (GCBA).

El sistema permite estructurar tareas, centralizar información del perfil ingresante y gestionar recursos institucionales asociados al proceso de integración.

---

## Objetivo

Brindar una herramienta que permita:

- estructurar el proceso de onboarding desde el primer día,
- centralizar información clave para el ingresante,
- facilitar el seguimiento por parte de líderes y áreas de gestión,
- sentar las bases de un modelo escalable y adaptable a distintas jurisdicciones y perfiles.

---

## Arquitectura del piloto

El repositorio contiene:

- Frontend (React + Vite)
- API REST piloto (Node.js + Express)
- Contrato formal OpenAPI
- Persistencia basada en archivo (entorno de prueba)

La aplicación está diseñada bajo el principio de desacople frontend–backend, utilizando como fuente de verdad el contrato OpenAPI.

---

## Documentación técnica

La documentación del contrato de API y las decisiones de diseño del dominio se encuentran en:

- `docs/piloto-api-contrato.md`
- `docs/openapi-specification.yaml`

La documentación interactiva (Swagger UI) se encuentra disponible al ejecutar la API en:

```
http://localhost:3001/api/v1/docs
```

---

## Stack tecnológico

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- dnd-kit

### Backend (piloto)
- Node.js
- Express
- Persistencia file-based (`server/data/db.json`)
- Swagger UI

---

## Modos de ejecución

La aplicación puede funcionar en dos modos, configurables mediante variables de entorno:

```env
VITE_DATA_SOURCE=api
VITE_DATA_SOURCE=local
```

- `local`: utiliza datos mock internos del frontend.
- `api`: consume la API REST piloto.

---

## Correr localmente

### Prerrequisitos

- Node.js 18+
- npm

---

### 1. Instalar dependencias del frontend

Desde la raíz del proyecto:

```bash
npm install
```

---

### 2. Levantar la API piloto

Desde la carpeta `server`:

```bash
cd server
npm install
npm run dev
```

La API quedará disponible en:

```
http://localhost:3001
```

Swagger UI:

```
http://localhost:3001/api/v1/docs
```

---

### 3. Levantar el frontend

Desde la raíz del proyecto:

```bash
npm run dev
```

Acceder en:

```
http://localhost:5173
```

---

## Estructura del repositorio

```
/components        → Componentes de interfaz
/services          → Acceso a datos (API / local)
/data              → Datos mock frontend
/server            → Implementación API piloto
/docs              → Documentación técnica y contrato OpenAPI
```

---

## Consideraciones del piloto

- La autenticación se encuentra mockeada mediante `/api/v1/me`.
- No se implementa aún integración con SSO institucional.
- La persistencia es local (file DB).
- El contrato OpenAPI permite una futura implementación backend productiva (por ejemplo, Java + base de datos relacional) sin modificar el frontend.

---

## Estado del proyecto

- Piloto funcional con frontend desacoplado.
- API REST implementada en entorno de prueba.
- Contrato OpenAPI formalizado.
- Preparado para evaluación técnica e implementación backend productiva en etapa posterior.

---

## Nota

Este repositorio corresponde a un piloto técnico.  
No contiene datos sensibles ni integración con sistemas institucionales productivos.

---

## Diagrama de arquitectura – Piloto y evolución prevista

```mermaid
flowchart LR

  subgraph Cliente
    U["Usuario GCBA"]
    FE["Frontend<br/>React + Vite<br/>(Vercel)"]
    U --> FE
  end

  subgraph Backend Piloto
    API["API Piloto<br/>Node.js + Express"]
    DB[("File DB<br/>server/data/db.json")]
    OAS["Contrato OpenAPI<br/>/docs/openapi-specification.yaml"]
    SWAGGER["Swagger UI<br/>/api/v1/docs"]

    API --> DB
    SWAGGER --> OAS
  end

  FE -->|"HTTP REST JSON"| API

  %% Evolución futura
  subgraph Backend Productivo Futuro
    SSO["SSO Institucional"]
    JAVA["Backend Java<br/>(Spring / estándar institucional)"]
    RDB[("Base de datos relacional")]
  end

  FE -.->|"Mismo contrato OpenAPI"| JAVA
  JAVA --> RDB
  SSO --> JAVA