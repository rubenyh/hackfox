# Guía de Accesibilidad - HackFox

## Características de Accesibilidad

HackFox incluye características completas de accesibilidad para usuarios con discapacidad visual o ceguera.

### Voiceover

**Qué es:** Una característica de texto a voz que lee en voz alta los elementos principales de la aplicación.

**Cómo activar:**
1. Toca el botón de accesibilidad (icono de persona) en la esquina superior derecha de cualquier pantalla
2. Activa el interruptor "Activar Voiceover"
3. La aplicación comenzará a leer en voz alta las acciones importantes

**Cuándo se activa:**
- Al cambiar de pantalla
- Al seleccionar una ruta
- Al enviar un reporte
- Al recentrar el mapa

### Lector de Pantalla del Sistema

**Qué es:** Compatibilidad con lectores de pantalla nativos como VoiceOver (iOS) y TalkBack (Android).

**Cómo activar:**
1. Toca el botón de accesibilidad en la esquina superior derecha
2. Activa el interruptor "Activar Lector de Pantalla"
3. Ahora puedes usar los gestos de tu lector de pantalla del sistema

### Etiquetas de Accesibilidad

Todos los botones y elementos principales tienen:
- **Etiquetas (Labels):** Describen qué hace el elemento
- **Sugerencias (Hints):** Información adicional sobre cómo usarlo
- **Roles:** Identifican el tipo de elemento (botón, entrada de texto, lista, etc.)

### Navegación por Pantalla

#### Pantalla de Mapa
- **Campo de búsqueda:** Busca rutas o ubicaciones
- **Botón recentrar:** Centra el mapa en tu ubicación actual
- **Marcador:** Tu ubicación actual en el mapa

#### Pantalla de Rutas
- **Lista de rutas:** Todas las rutas disponibles
- **Seleccionar ruta:** Ver detalles en el mapa
- **Botón volver:** Regresa a la lista

#### Pantalla de Reportes
- **Tipo de incidente:** Dropdown con 5 opciones
- **Descripción:** Campo de texto para detalles
- **Enviar:** Envía el reporte

## Requisitos de Dispositivo

### iOS
- VoiceOver debe estar activado en Configuración > Accesibilidad > VoiceOver
- Versión 14 o superior recomendada

### Android
- TalkBack debe estar activado en Configuración > Accesibilidad > TalkBack
- Versión 10 o superior recomendada

## Gestos de Navegación

### Con VoiceOver (iOS):
- **Un dedo, deslizar derecha:** Siguiente elemento
- **Un dedo, deslizar izquierda:** Elemento anterior
- **Un dedo, deslizar arriba:** Volumen arriba
- **Un dedo, deslizar abajo:** Volumen abajo
- **Dos dedos, tocar:** Activar elemento seleccionado

### Con TalkBack (Android):
- **Deslizar derecha:** Siguiente elemento
- **Deslizar izquierda:** Elemento anterior
- **Deslizar arriba luego abajo:** Leer desde el principio
- **Deslizar abajo luego arriba:** Leer desde aquí
- **Doble toque:** Activar elemento

## Configuración de Accesibilidad

Toca el botón de accesibilidad (♿) en cualquier pantalla para acceder a las configuraciones.

### Opciones disponibles:
1. **Voiceover:** Activa/desactiva la lectura de voz
2. **Lector de Pantalla:** Activa/desactiva compatibilidad con lectores del sistema

## Atajos de Teclado

Todos los elementos pueden activarse usando:
- **Tabulador:** Navegar entre elementos
- **Espacio/Enter:** Activar botón/opción
- **Flechas:** Navegar en listas y menús

## Reportar Problemas de Accesibilidad

Si encuentras algún problema con la accesibilidad, por favor:
1. Abre la Pantalla de Reportes
2. Selecciona "Otro" como tipo de incidente
3. Describe el problema detalladamente
4. Envía el reporte

## Recursos Adicionales

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [Expo Accessibility](https://docs.expo.dev/guides/accessibility/)

---

*Última actualización: 2026-05-28*
*Versión: 1.0*
