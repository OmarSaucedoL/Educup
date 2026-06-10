# Sistema de Gestión Académica - Instalación Local

Este proyecto está construido con **Laravel (PHP)** en el backend y **React (Inertia.js)** en el frontend.
Dado que no es un proyecto en Python, no utiliza un archivo `requirements.txt`. En su lugar, las dependencias se gestionan a través de `composer.json` (PHP) y `package.json` (Node.js).

Sigue esta guía paso a paso para levantar el proyecto en tu máquina local.

## 1. Requisitos Previos (Prerrequisitos)

Antes de empezar, asegúrate de tener instalados los siguientes programas en tu computadora:

* **PHP** (v8.2 o superior)
* **Composer** (Gestor de paquetes de PHP)
* **Node.js** y **npm** (v18 o superior)
* **PostgreSQL** (v14 o superior)
* **Git**

## 2. Pasos para la Instalación

Abre tu terminal (PowerShell, CMD o Bash) y ejecuta los siguientes comandos en orden:

### Paso 1: Clonar el repositorio
Descarga el código del proyecto a tu computadora:
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DE_LA_CARPETA>
```

### Paso 2: Instalar dependencias de PHP
Esto descargará las dependencias del backend especificadas en el archivo `composer.json`:
```bash
composer install
```

### Paso 3: Instalar dependencias de Node.js (Frontend)
Esto descargará las dependencias de React y Tailwind especificadas en el archivo `package.json`:
```bash
npm install
```

### Paso 4: Configurar el entorno (.env)
Duplica el archivo de configuración de ejemplo para crear el tuyo propio:
```bash
cp .env.example .env
```
Luego, abre el archivo `.env` en tu editor de código y configura la conexión a tu base de datos de PostgreSQL:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=nombre_de_tu_base_de_datos
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_de_postgres
```

### Paso 5: Generar la clave de la aplicación
Laravel necesita una clave de encriptación para la seguridad de la app:
```bash
php artisan key:generate
```

### Paso 6: Migrar y poblar la Base de Datos
Crea las tablas en la base de datos y llénalas con los datos de prueba (usuarios, roles, materias, etc.):
```bash
php artisan migrate:fresh --seed
```

### Paso 7: Compilar el Frontend y correr el servidor

Necesitas ejecutar **dos comandos** al mismo tiempo (abre dos pestañas o ventanas en tu terminal):

**Terminal 1 (Compilador de Frontend):**
```bash
npm run dev
```

**Terminal 2 (Servidor Backend):**
```bash
php artisan serve
```

## 3. ¡Listo para usar!

Una vez ejecutados ambos comandos, abre tu navegador web e ingresa a:
👉 **http://localhost:8000**

### Credenciales de Prueba por defecto
Puedes iniciar sesión usando alguna de las cuentas de prueba creadas por el *seeder*:
- **Administrador:** `admin` | Contraseña: `password`
- **Coordinador:** `coordinador` | Contraseña: `password`

*(Si necesitas usuarios adicionales o un estudiante/docente, puedes ver los datos autogenerados en la base de datos tras correr el comando `--seed`)*.
