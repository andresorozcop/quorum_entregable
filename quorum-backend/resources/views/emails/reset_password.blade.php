<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperación de contraseña — QUORUM</title>
    <style>
        /* Estilos básicos para que el correo se vea bien en la mayoría de clientes */
        body {
            font-family: Arial, sans-serif;
            background-color: #F5F5F5;
            margin: 0;
            padding: 20px;
            color: #333333;
        }
        .contenedor {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .cabecera {
            background-color: #3DAE2B;
            padding: 24px;
            text-align: center;
        }
        .cabecera h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
        }
        .cabecera p {
            color: #E8F5E9;
            margin: 4px 0 0;
            font-size: 13px;
        }
        .cuerpo {
            padding: 32px 28px;
        }
        .cuerpo p {
            line-height: 1.6;
            margin: 0 0 16px;
            font-size: 15px;
        }
        .boton-contenedor {
            text-align: center;
            margin: 28px 0;
        }
        .boton {
            display: inline-block;
            background-color: #3DAE2B;
            color: #ffffff;
            text-decoration: none;
            padding: 13px 32px;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
        }
        .enlace-texto {
            font-size: 12px;
            color: #9E9E9E;
            word-break: break-all;
            margin-top: 8px;
        }
        .aviso {
            background-color: #FFF8E1;
            border-left: 4px solid #F9A825;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 13px;
            color: #555;
            margin-top: 24px;
        }
        .pie {
            background-color: #F5F5F5;
            padding: 16px 28px;
            text-align: center;
            font-size: 12px;
            color: #9E9E9E;
            border-top: 1px solid #E0E0E0;
        }
    </style>
</head>
<body>
    <div class="contenedor">
        <!-- Cabecera con marca QUORUM SENA -->
        <div class="cabecera">
            <h1>QUORUM</h1>
            <p>Sistema de Control de Asistencia — SENA CPIC</p>
        </div>

        <div class="cuerpo">
            <!-- Saludo personalizado con el nombre del usuario -->
            <p>Hola, <strong>{{ $nombreUsuario }}</strong>.</p>

            <p>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                <strong>QUORUM</strong>. Si fuiste tú, haz clic en el botón de abajo para
                crear una nueva contraseña.
            </p>

            {{-- Enlace de reset: base resuelta en el backend (Origin permitido o FRONTEND_URL) --}}
            @php
                $enlaceReset = $frontendBaseUrl . '/reset?token=' . $token;
            @endphp
            <!-- Botón principal con el enlace de reset -->
            <div class="boton-contenedor">
                <a href="{{ $enlaceReset }}"
                   class="boton">
                    Restablecer contraseña
                </a>
                <!-- Enlace en texto plano por si el botón no carga -->
                <p class="enlace-texto">
                    O copia y pega este enlace en tu navegador:<br>
                    {{ $enlaceReset }}
                </p>
            </div>

            <!-- Aviso de expiración y uso único -->
            <div class="aviso">
                <strong>Importante:</strong> Este enlace expira en <strong>1 hora</strong>
                y solo puede usarse <strong>una vez</strong>.
                Si no solicitaste este cambio, puedes ignorar este correo;
                tu contraseña actual seguirá siendo la misma.
            </div>
        </div>

        <!-- Pie de página -->
        <div class="pie">
            SENA CPIC — QUORUM v1.0 &nbsp;|&nbsp;
            Este correo fue generado automáticamente, no respondas a él.
        </div>
    </div>
</body>
</html>
