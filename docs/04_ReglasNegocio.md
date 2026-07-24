# 04_ReglasNegocio

**Versión:** 1.0\
**Estado:** En desarrollo

------------------------------------------------------------------------

# Objetivo

Definir el comportamiento funcional de la aplicación. Estas reglas son
la referencia para el frontend y el backend.

------------------------------------------------------------------------

## RB-001 · Perfil activo

-   Existe un único perfil activo.
-   No existe sistema de login.
-   El perfil se guarda en el dispositivo.
-   Todas las acciones se realizan sobre ese perfil.

## RB-002 · Registrar tarea

Al registrar una tarea:

1.  Crear registro en Histórico.
2.  Actualizar última realización.
3.  Actualizar último usuario.
4.  Recalcular valor actual de la tarea.
5.  Actualizar Dashboard.
6.  Recalcular estadísticas.
7.  Comprobar logros.
8.  Mostrar confirmación.

La operación debe ejecutarse de forma atómica.

## RB-003 · Confirmación

Tras registrar una tarea:

-   Mostrar "Tarea registrada".
-   Mostrar puntos obtenidos.
-   Permitir deshacer durante unos segundos.

## RB-004 · Deshacer

Si el usuario deshace:

-   Eliminar el registro creado.
-   Restaurar estado anterior.
-   Recalcular estadísticas.
-   Actualizar Dashboard.

## RB-005 · Puntos

Puntos obtenidos = Puntos base + Bonus.

El bonus nunca se almacena; siempre se calcula.

## RB-006 · Bonus

-   +5 puntos.
-   Cada 7 días sin realizar la tarea.
-   Valores configurables desde Configuración.

## RB-007 · Programación

Una tarea aparece en "Hoy" únicamente si:

-   Está activa.
-   Su programación coincide con la fecha actual.

## RB-008 · Tareas de hoy

Si no hay tareas programadas se mostrará:

> No hay tareas programadas para hoy.

## RB-009 · Más habituales

Se calculan usando:

-   Ambos usuarios.
-   Últimos 6 meses.
-   Máximo 5 tareas.
-   Excluyendo las tareas de "Hoy".

## RB-010 · Orden de categorías

Categorías ordenadas automáticamente por frecuencia de uso conjunta de
los últimos 6 meses.

## RB-011 · Orden de tareas

Dentro de cada categoría, las tareas se ordenan automáticamente por
frecuencia de uso conjunta de los últimos 6 meses.

## RB-012 · Desactivar tarea

Una tarea desactivada:

-   No aparece en Registrar.
-   No aparece en Hoy.
-   No genera recurrencias.
-   Conserva el histórico.
-   Puede reactivarse.

## RB-013 · Eliminar tarea

Solo podrá eliminarse una tarea sin histórico.

## RB-014 · Histórico

El histórico es la fuente de verdad de la aplicación.

## RB-015 · Dashboard

El Dashboard es de solo lectura y se genera automáticamente.

## RB-016 · Estadísticas

Todas las estadísticas se calculan desde el Histórico.

## RB-017 · Cambio de perfil

Cambiar de perfil únicamente cambia el contexto del usuario activo.

## RB-018 · Navegación

Cada funcionalidad tiene un único lugar:

-   Registrar → Registrar
-   Editar → Tareas
-   Consultar → Estadísticas
-   Configurar → Ajustes

## RB-019 · Rendimiento

Minimizar llamadas a Google Sheets utilizando datos precalculados cuando
sea posible.

## RB-020 · Simplicidad

Ante dos soluciones equivalentes se elegirá siempre la que requiera
menos interacción del usuario.
