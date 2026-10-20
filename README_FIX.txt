FIX: persistencia de tareas del administrador

Archivo a reemplazar: services/dataService.ts

Cambios:
- saveProfiles usa PUT /profiles/:id para reemplazar cada perfil.
- getProfiles en modo API devuelve lo persistido, sin restaurar defaultTasks ni escribir durante GET.
- getProfiles en modo local respeta lo almacenado sin restaurar tareas borradas.

Aplicacion en GitHub web:
1. Crear una rama desde main: fix/admin-tasks.
2. En esa rama, abrir services/dataService.ts y sustituir su contenido por el del archivo incluido.
3. Hacer commit y crear Pull Request sin fusionarlo aun.
4. Probar con datos de prueba: editar, eliminar, guardar y recargar.
5. Respaldar datos de produccion antes de desplegar.

Este ZIP es un parche de un solo archivo, no el repositorio completo.
No se ha desplegado ni probado contra el backend de produccion.
