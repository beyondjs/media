---
trigger: manual
---


# general-module

## ¿Qué es un módulo?

Un módulo en BeyondJS es una unidad que encapsula funcionalidad (lógica, vistas, estilos, etc.) organizada por tipo de contenido, usando procesadores. Se define mediante un archivo `module.json`.

---

## Estructura básica

```json
{
  "name": "utils/math",
  "platforms": ["*"],
  "bundle": "ts",
  "files": "*"
}
````

O usando subestructura por procesador:

```json
{
  "subpath": "fs",
  "description": "Core utilities",
  "platforms": "*",
  "ts": {
    "path": ".",
    "files": ["*"]
  }
}
```

---

## ¿Qué es un procesador?

Un **procesador** indica el tipo de contenido de un bundle. Define cómo se organiza, compila y carga ese contenido. Cada procesador requiere una propiedad en `module.json` con su `path` y `files`.

---

## Procesadores disponibles

| Procesador | Propósito                             |
| ---------- | ------------------------------------- |
| `ts`       | Código TypeScript o JavaScript        |
| `scss`     | Estilos SASS/SCSS                     |
| `txt`      | Archivos de texto o idiomas           |
| `widget`   | Componentes visuales (pages, layouts) |

---

## Cómo agregar un procesador

1. Define su nombre como clave en `module.json`.
2. Especifica `"path"` y `"files"`.

### Ejemplo

```json
{
  "name": "tools/image-utils",
  "platforms": ["*"],
  "ts": {
    "path": "ts",
    "files": ["*"]
  },
  "scss": {
    "path": "scss",
    "files": ["styles.scss"]
  }
}
```

---

## Reglas

* Cada procesador debe tener su carpeta con los archivos especificados.
* No uses `"processor"` como propiedad.
* No es necesario definir `exports`; se generan automáticamente.
* Puedes combinar múltiples procesadores en un mismo módulo.
