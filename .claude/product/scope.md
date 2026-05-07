# Alcance del sistema

## Dentro del alcance

1. Emisión de certificaciones POA/PAI con validación previa contra la cédula MEF.
2. Modificaciones al POA sobre actividades existentes.
3. Flujo combinado bienes → modificación POA → certificación.
4. Importación de cédula presupuestaria MEF desde Excel exportado de ESIGEF.
5. Versionado de cédula MEF.
6. Versionado del POA.
7. Control de saldos en tiempo real al centavo.
8. Liquidación parcial o total de certificaciones.
9. Liquidación modo A: devolver saldo a la actividad.
10. Liquidación modo B: retirar saldo para reforma.
11. Anulación de certificaciones no utilizadas.
12. Registro de devoluciones del financiero.
13. Paneles para unidad requirente y Dirección.
14. Generación de PDF de certificación, memorando e informe técnico de modificación.
15. Auditoría completa.
16. Exportación a Excel para financiero.

## Fuera del alcance inicial

1. Elaboración inicial del POA anual.
2. Integración API directa con ESIGEF.
3. Integración directa con Quipux.
4. Firma electrónica avanzada del Estado.
5. Motor completo de reformas presupuestarias.

## Criterio de diseño

Aunque algunos procesos estén fuera del alcance, el modelo debe dejar espacio para integrarlos luego sin reescribir el núcleo.
