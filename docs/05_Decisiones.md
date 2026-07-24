# 05_Decisiones

**Versión:** 1.0

## Objetivo

Registrar las decisiones de diseño y arquitectura del proyecto.

------------------------------------------------------------------------

## D-001 · Sin login

**Decisión:** La aplicación no tendrá sistema de autenticación.

**Motivo:** Solo existen dos usuarios.

------------------------------------------------------------------------

## D-002 · Perfil activo

Solo existirá un perfil activo al mismo tiempo.

------------------------------------------------------------------------

## D-003 · Google Sheets

Google Sheets será la base de datos.

Motivos:

-   Gratuito.
-   Fácil mantenimiento.
-   Suficiente para dos usuarios.

------------------------------------------------------------------------

## D-004 · Apps Script

Toda la lógica de negocio residirá en Apps Script.

------------------------------------------------------------------------

## D-005 · Registrar

La acción principal de la aplicación se llamará **Registrar**.

------------------------------------------------------------------------

## D-006 · Sin favoritos

No existirá sistema de favoritos.

La sección "Más habituales" cubre esa necesidad.

------------------------------------------------------------------------

## D-007 · Sin archivar

Solo existirá el estado **Activa**.

------------------------------------------------------------------------

## D-008 · Desactivar tareas

Las tareas desactivadas conservan todo su histórico.

------------------------------------------------------------------------

## D-009 · Orden automático

Categorías y tareas se ordenan automáticamente usando el histórico
conjunto de los últimos 6 meses.

------------------------------------------------------------------------

## D-010 · Más habituales

Se calcula utilizando ambos usuarios.

------------------------------------------------------------------------

## D-011 · Exclusión de "Hoy"

Las tareas mostradas en "Hoy" no aparecen en "Más habituales".

------------------------------------------------------------------------

## D-012 · Penalización

Incremento automático de +5 puntos cada 7 días.

------------------------------------------------------------------------

## D-013 · Dashboard

Existirá una hoja Dashboard generada automáticamente.

------------------------------------------------------------------------

## D-014 · Histórico

El Histórico es la única fuente de verdad.

------------------------------------------------------------------------

## D-015 · Simplicidad

Siempre se elegirá la solución más simple.

------------------------------------------------------------------------

## D-016 · Optimizada para dos usuarios

Toda la aplicación se diseña específicamente para Elena y Tomás.
