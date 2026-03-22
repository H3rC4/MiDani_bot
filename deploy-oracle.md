# Guía de Despliegue en Oracle Cloud (Always Free)

Este archivo contiene las instrucciones para desplegar el bot de Daniela (`midani-bot`) en una máquina virtual de Oracle Cloud.

## Requisitos Previos

1. Tener una cuenta en [Oracle Cloud](https://cloud.oracle.com/).
2. Haber creado una instancia "Always Free" (preferiblemente Ampere A1, ARM de 4 cores / 24 GB de RAM, o en su defecto E2.Micro de 1GB).
    - **Imagen del sistema:** Ubuntu 22.04 o 24.04 (recomendado).
    - **Claves SSH:** Asegúrate de descargar la clave privada (`.key` o `.pem`) al crear la instancia para poder conectarte.

## Paso 1: Conectarse al Servidor por SSH

Abre una terminal en tu computadora (PowerShell o Git Bash) y conéctate a la IP pública de tu servidor de Oracle:

```bash
# Si descargaste una llave .key, dale permisos primero (solo en Mac/Linux):
# chmod 400 mi-llave-oracle.key

ssh -i /ruta/a/tu/llave.key ubuntu@<IP_PUBLICA_DE_ORACLE>
```

## Paso 2: Instalar Dependencias (Node.js, Git, PM2)

Una vez dentro de tu servidor en Oracle, actualiza el sistema e instala las herramientas necesarias:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (usaremos la versión 20 que es LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential

# Verificar instalación (debe mostrar las versiones)
node -v
npm -v

# Instalar PM2 globalmente (el gestor de procesos)
sudo npm install -g pm2
```

## Paso 3: Clonar el Repositorio

Clona tu código fuente desde GitHub (asegúrate de que los cambios más recientes estén en la rama principal):

```bash
git clone <URL_DE_TU_REPOSITORIO> openGravity
cd openGravity
```

## Paso 4: Restaurar los Archivos Secretos

Como `.env` y `service-account.json` NO están (y no deben estar) en GitHub, debes crearlos manualmente en el servidor.

**1. Para el archivo `.env`:**

```bash
nano .env
```
*Pega el contenido exacto de tu `.env` de tu computadora aquí. Luego presiona `Ctrl + O` para guardar, `Enter` para confirmar, y `Ctrl + X` para salir.*

**2. Para el archivo de Firebase:**

```bash
nano service-account.json
```
*Pega el contenido íntegro de tu archivo de Firebase. Luego `Ctrl + O`, `Enter` y `Ctrl + X`.*

## Paso 5: Instalar y Compilar el Proyecto

```bash
# Instalar los paquetes del proyecto
npm install

# Compilar TypeScript (esto genera la carpeta /dist)
npm run build
```

## Paso 6: Iniciar el Bot con PM2

Utilizaremos el archivo `ecosystem.config.js` que ya está preparado en el código. Esto arrancará el bot y lo reiniciará si ocurre algún error o excepción:

```bash
pm2 start ecosystem.config.js
```

Para verificar que está funcionando y ver sus logs, lanza:
```bash
pm2 logs midani-bot
```
*(Para salir de los logs presiona `Ctrl + C`)*.

## Paso 7: Configurar que el bot inicie tras reiniciar el servidor

Si Oracle alguna vez reinicia la instancia, necesitamos que el bot arranque solo:

```bash
# Ejecuta el comando para preparar el arranque:
pm2 startup

# (ATENCIÓN: EL COMANDO ANTERIOR TE DEVOLVERÁ UN TEXTO QUE DEBES COPIAR Y EJECUTAR EN TU TERMINAL, EJECÚTALO)

# Y finalmente guarda el estado actual
pm2 save
```

¡Listo! Daniela estará online las 24 horas.
