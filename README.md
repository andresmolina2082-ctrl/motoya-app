# MotoYa 🏍️ — App Móvil de MotoTaxi (Estilo inDriver)

Aplicación móvil desarrollada con **Expo Router** y **React Native** para el servicio urbano de mototaxis en **Riohacha, La Guajira**, implementando la mecánica de **negociación de tarifas (inDriver)** entre pasajeros y mototaxistas.

---

## 🌟 Características Principales

1. **Negociación Justa de Tarifas (inDriver)**:
   - El pasajero propone su tarifa en pesos colombianos (`COP`), con botones rápidos de incremento (`+$500`, `+$1.000`, `+$2.000`).
   - Selección de métodos de pago colombianos: **Efectivo**, **Nequi** y **Daviplata**.
2. **Radar de Ofertas en Vivo (Ventana Modal)**:
   - Despliega las contraofertas y postulaciones en tiempo real de mototaxistas cercanos.
   - Muestra modelo de moto (Boxer CT 100, GN 125, YBR 125), placa colombiana, tiempo de llegada y calificación.
3. **Expediente del Mototaxista (Ruta Dinámica `driver/[id].tsx`)**:
   - Lee el parámetro `id` mediante `useLocalSearchParams`.
   - Muestra ficha técnica de la motocicleta, verificación de 2 cascos reglamentarios, SOAT y revisión tecnomecánica vigente.
4. **Monitoreo de Carrera Activa (Ruta Dinámica `trip/[id].tsx`)**:
   - Código PIN de seguridad obligatorio para abordar (`PIN: 8421`).
   - Botón de compartir carrera por WhatsApp y botón de asistencia SOS.
5. **Navegación Ergonómica por Pestañas (Tabs)**:
   - **Pedir Moto** (Solicitud rápida con selección de origen/destino).
   - **Mis Viajes** (Historial de carreras activas y completadas).
   - **Mi Perfil** (Billetera y switch a Modo Conductor).

---

## 🚀 Cómo Ejecutar la Aplicación

Abre tu terminal en la carpeta del proyecto:

```bash
cd C:\Users\andre\Documents\motoya-app
npx expo start
```

Opciones de visualización:
- Presiona **`w`** para abrir en el **Navegador Web** (con encuadre automático de smartphone).
- Escanea el código QR con la app **Expo Go** en tu celular Android o iOS.

---

## 🏗️ Estructura del Proyecto (Feature-First)

```
motoya-app/
├── app/                          # Capa de Ruteo Delgado (Expo Router)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab Navigator (Pedir Moto, Viajes, Perfil)
│   │   ├── index.tsx             # -> re-export RideRequestScreen
│   │   ├── trips.tsx             # -> re-export TripsScreen
│   │   └── profile.tsx           # -> re-export ProfileScreen
│   ├── driver/
│   │   └── [id].tsx              # -> re-export DriverDetailScreen (Ruta dinámica)
│   ├── trip/
│   │   └── [id].tsx              # -> re-export TripDetailScreen (Ruta dinámica)
│   ├── modal.tsx                 # -> re-export OfferRadarModal (Modal nativo)
│   ├── _layout.tsx                # Root Stack Navigator + SafeAreaProvider
│   └── +not-found.tsx
│
└── src/                          # Código Fuente y Lógica de Negocio
    ├── features/
    │   ├── ride/                 # Solicitud de carrera y Radar de ofertas
    │   ├── driver/               # Perfil y ficha técnica del mototaxista
    │   ├── trips/                # Historial y seguimiento de carrera
    │   └── profile/              # Perfil de pasajero y billetera
    ├── components/               # Card, Badge, FareCounter
    └── theme.ts                  # Paleta verde inDriver, radios y sombras
```

Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para el análisis técnico detallado de la navegación y la arquitectura del sistema.
