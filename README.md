# BudgetFlow

Herramienta interactiva de presupuesto personal centrada en un gráfico circular grande y en tiempo real, con cambio instantáneo entre estrategias, análisis del porqué de cada método y generación de un documento imprimible / PDF con diagnóstico y plan de mejora.

## Características

- **Diseño céntrico e interactivo:** El gráfico principal ocupa el centro de atención y se actualiza en vivo al modificar ingresos, porcentajes o montos.
- **Estrategias intercambiables:** Cambia en un clic entre **50/30/20**, **70/20/10**, **60/20/20**, **45/25/30 (Ahorro acelerado)** o **Personalizado**, con auto-equilibrio opcional al 100%.
- **Desglose de rubros reales:** Detalla gastos específicos por categoría y aplícalos directamente al presupuesto.
- **El porqué & qué mejorar:** Explica el fundamento de la estrategia elegida, calcula un índice de salud financiera (0–100) y genera acciones concretas de mejora y proyección anual.
- **Documento imprimible / PDF:** Vista previa ejecutiva limpia lista para imprimir o guardar como PDF (`@media print`).

## Ejecución local

Es un proyecto 100% estático (HTML, CSS y JS sin dependencias externas de compilación). Puedes abrir `index.html` directamente o iniciar un servidor local:

```bash
python3 -m http.server 8080
```
