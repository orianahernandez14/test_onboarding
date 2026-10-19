# Piloto Navegador de Onboarding – Contrato y Lineamientos de API

## 1. Alcance del documento

El presente documento describe las decisiones de diseño del **contrato de API** utilizado en el piloto del *Navegador de Onboarding del Gobierno de la Ciudad de Buenos Aires (GCBA)*.

Su objetivo es:

- Explicitar el modelo de dominio adoptado.
- Formalizar los endpoints considerados canónicos.
- Asegurar consistencia entre frontend y backend.
- Facilitar una futura implementación productiva alineada a estándares institucionales.
- Reducir ambigüedades técnicas en etapas posteriores al piloto.

El contrato formal de la API se encuentra definido en:

- `docs/openapi-specification.yaml`

La documentación técnica interactiva se encuentra disponible en:

- `/api/v1/docs` (Swagger UI)

---

## 2. Contexto del piloto

Durante el piloto:

- Se implementó una API REST basada en el contrato OpenAPI.
- El frontend se encuentra completamente alineado con dicho contrato.
- La persistencia se realiza mediante almacenamiento en archivo (file-based persistence), exclusivamente con fines de prueba.
- La autenticación se encuentra actualmente mockeada mediante el endpoint `/api/v1/me`.

La implementación backend productiva no forma parte del alcance inmediato del piloto, pero el diseño del contrato fue concebido para permitir su implementación en una arquitectura backend estándar (por ejemplo, Java + base de datos relacional).

El piloto tiene carácter exploratorio y su objetivo principal es validar el modelo funcional y técnico de la herramienta antes de evaluar eventuales escenarios de implementación institucional.

---

## 3. Modelo de dominio

El modelo de dominio del Navegador de Onboarding se estructura en torno a los siguientes conceptos:

### 3.1 Perfil de ingresante (`Profile`)

Representa a la persona que ingresa a la organización.

Incluye:

- Identificador único (`profileId`, tipo string).
- Información del puesto y del equipo (`info`).
- Plan de tareas de onboarding.
- Documentación administrativa asociada.

### 3.2 Información del perfil (`OnboardingInfo`)

Contiene los datos descriptivos del ingreso:

- Nombre del ingresante.
- Puesto.
- Equipo.
- Responsable directo.
- Fecha de inicio del onboarding.
- Información administrativa y organizacional relevante.

### 3.3 Tareas de onboarding (`Task`)

Las tareas se modelan como un **recurso propio**, asociado a un perfil.

Cada tarea incluye:

- Identificador único (`taskId`).
- Semana y día de onboarding.
- Tipo de tarea.
- Referente.
- Estado de completitud.
- Posible vinculación a recursos de conocimiento.

### 3.4 Repositorio de conocimiento (`KnowledgeItem`)

Conjunto de recursos informativos disponibles durante el onboarding.

Los recursos pueden ser:

- Institucionales (globales).
- Asociados a un equipo.
- Asociados a un perfil específico.

Incluyen:

- Categoría.
- Descripción.
- URL o adjunto.
- Regla de visibilidad por día de onboarding (`visibleOnDay`).

---

## 4. Decisiones clave de diseño

Las siguientes decisiones se consideran definiciones de dominio y no deberían modificarse sin evaluar impacto en el frontend:

### 4.1 Tareas como recurso independiente

- Las tareas se gestionan mediante endpoints específicos:
  - `POST /profiles/{id}/tasks`
  - `PATCH /profiles/{id}/tasks/{taskId}`
  - `DELETE /profiles/{id}/tasks/{taskId}`

Esto permite:

- Mayor claridad en el modelo.
- Mejor escalabilidad.
- Mejor trazabilidad y potencial auditoría.

### 4.2 Actualización parcial de información del perfil

- Los datos descriptivos del perfil se actualizan mediante:
  - `PATCH /profiles/{id}/info`

Esto evita reemplazos completos innecesarios y reduce riesgo de inconsistencias.

### 4.3 Creación y actualización de perfiles

- `POST /profiles` se utiliza exclusivamente para creación.
- `PUT /profiles/{id}` se prevé para actualización completa con fines administrativos o de importación.

### 4.4 Identificadores

- Todos los identificadores (`profileId`, `taskId`, `knowledgeItemId`) son de tipo string.
- No se asume el uso de identificadores numéricos autoincrementales, favoreciendo flexibilidad tecnológica.

### 4.5 Reglas de visibilidad

- `visibleOnDay`: determina a partir de qué día un recurso o tarea es visible.
- `isGlobal`: indica si el recurso es institucional (global) o específico.

---

## 5. Endpoints canónicos

### Perfiles

- `GET /api/v1/profiles`
- `POST /api/v1/profiles`
- `GET /api/v1/profiles/{id}`
- `PUT /api/v1/profiles/{id}`
- `PATCH /api/v1/profiles/{id}/info`

### Tareas

- `POST /api/v1/profiles/{id}/tasks`
- `PATCH /api/v1/profiles/{id}/tasks/{taskId}`
- `DELETE /api/v1/profiles/{id}/tasks/{taskId}`

### Repositorio de conocimiento

- `GET /api/v1/knowledge-items`
- `POST /api/v1/knowledge-items`
- `PATCH /api/v1/knowledge-items/{id}`
- `DELETE /api/v1/knowledge-items/{id}`

### Contexto de usuario

- `GET /api/v1/me`

---

## 6. Consideraciones de seguridad y entorno

Durante el piloto:

- La autenticación se encuentra mockeada mediante `/api/v1/me`.
- No se gestionan datos sensibles.
- La persistencia es local (archivo `db.json`).
- No se implementa aún integración con SSO institucional.

El acceso a la aplicación en etapa de piloto se limita a usuarios autorizados en entornos de prueba.

En una implementación productiva se prevé:

- Integración con SSO institucional.
- Gestión de roles y permisos.
- Persistencia en base de datos relacional.
- Posible incorporación de trazabilidad y auditoría de operaciones.
- Despliegue en infraestructura institucional.

---

## 7. Implementación actual del piloto

La implementación actual utiliza:

- Node.js + Express.
- Persistencia basada en archivo (file-based).
- Swagger UI disponible en `/api/v1/docs`.

Esta implementación respeta el contrato OpenAPI definido en:

`docs/openapi-specification.yaml`

El frontend se encuentra desacoplado del backend concreto, dependiendo exclusivamente del contrato OpenAPI.

---

## 8. Implementación backend futura

Para una implementación productiva se asume:

- Lenguaje backend alineado a lineamientos tecnológicos institucionales (ej. Java).
- Base de datos relacional.
- Separación de entidades:
  - Perfil
  - Información del perfil
  - Tareas
  - Subtareas
  - Recursos de conocimiento

El contrato definido permite implementar el backend sin requerir cambios en el frontend desarrollado para el piloto.

---

## 9. Consideraciones finales

El presente documento:

- Formaliza el modelo de dominio adoptado.
- Preserva decisiones arquitectónicas.
- Reduce dependencia de conocimiento tácito.
- Facilita la continuidad técnica del proyecto.

Cualquier modificación al contrato deberá evaluarse considerando su impacto en el frontend y en la coherencia del modelo de dominio.

---

## 10. Evaluación de riesgo del piloto

El presente piloto ha sido concebido como una instancia de validación funcional y técnica, con alcance acotado y bajo impacto operativo.

En su estado actual:

- No consume datos provenientes de sistemas productivos institucionales.
- No se integra con sistemas core del GCBA (por ejemplo, sistemas de gestión de personal, financieros o administrativos).
- No requiere acceso a bases de datos institucionales.
- No gestiona credenciales reales ni autenticación institucional.
- No almacena datos sensibles ni información personal real.
- No expone servicios hacia redes externas.

La persistencia utilizada durante el piloto es de tipo local (file-based), exclusivamente con fines de prueba.

En consecuencia, el riesgo operativo, de seguridad o de integridad de datos institucionales se considera bajo, dado que el piloto opera de manera desacoplada del ecosistema productivo.

Cualquier evolución que implique integración con sistemas institucionales requerirá evaluación técnica y validación por las áreas competentes.

---

## 11. Condiciones de despliegue en entorno interno

En caso de desplegar el piloto en infraestructura institucional, se propone que dicho despliegue se realice bajo las siguientes condiciones:

- Entorno de prueba o preproductivo.
- Acceso restringido a usuarios autorizados.
- Sin integración a bases de datos institucionales.
- Sin autenticación SSO en esta etapa.
- Sin exposición a redes externas.
- Persistencia local o temporal sin impacto en sistemas productivos.

El despliegue tendría como único objetivo validar:

- accesibilidad en red interna,
- compatibilidad con infraestructura institucional,
- comportamiento general de la aplicación en entorno controlado.

No se prevé uso masivo ni carácter productivo en esta instancia.

---

## 12. Marco de gobernanza del piloto

El piloto del Navegador de Onboarding se enmarca como una iniciativa exploratoria orientada a:

- evaluar la viabilidad técnica de una herramienta digital de planificación de onboarding,
- validar el modelo de dominio propuesto,
- analizar potenciales beneficios organizacionales.

Para una eventual institucionalización del piloto se sugiere definir formalmente:

- Área promotora del piloto.
- Responsable funcional.
- Responsable técnico.
- Alcance temporal del piloto.
- Criterios de evaluación.
- Condiciones de cierre, continuidad o escalamiento.

En esta etapa, el piloto no implica compromiso de implementación productiva ni integración obligatoria con sistemas existentes.

Cualquier decisión de escalamiento deberá contar con validación técnica y aprobación institucional correspondiente.

---

## 13. Ruta de transición a implementación productiva (escenario futuro)

En caso de avanzar hacia una implementación productiva, se prevé:

- integración con sistema de autenticación institucional (SSO),
- gestión de roles y permisos,
- persistencia en base de datos relacional,
- separación formal de entidades (perfil, información, tareas, subtareas, recursos),
- registro de operaciones y trazabilidad,
- despliegue en infraestructura institucional acorde a lineamientos tecnológicos vigentes.

El contrato OpenAPI definido durante el piloto permite realizar dicha transición sin necesidad de rediseñar el frontend desarrollado.