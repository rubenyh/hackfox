# 🔧 Guía de Debugging - Voiceover No Funciona

Si el voiceover no funciona, sigue estos pasos para diagnosticar el problema:

## Paso 1: Verifica que el Botón Existe ✅

1. Abre la app
2. Ve a cualquier pantalla (Mapa, Rutas o Reportes)
3. Mira **arriba a la derecha** del encabezado
4. **¿Ves un icono de persona en silla de ruedas ♿?**

**Si NO lo ves:**
- Reinicia la app completamente
- Si sigue sin aparecer, el AccessibilityProvider podría no estar montado correctamente
- Abre la consola (Chrome DevTools) y busca errores

**Si SÍ lo ves:** → Continúa al Paso 2

---

## Paso 2: Abre el Modal ✅

1. Toca el icono ♿
2. **¿Se abre un modal desde abajo?**
3. **¿Ves el título "Accesibilidad"?**
4. **¿Ves dos interruptores/switches?**

**Si NO se abre nada:**
- Abre la consola y busca mensajes de error
- Verifica que el Modal de React Native esté importado correctamente
- Revisa si hay errores JavaScript

**Si SÍ se abre:** → Continúa al Paso 3

---

## Paso 3: Intenta Activar el Switch ✅

1. En el modal abierto, busca "Activar Voiceover"
2. **Toca el interruptor/switch al lado derecho**
3. El interruptor debe cambiar de color (normalmente a verde/azul)

**¿Qué debería pasar?**
- El switch se activa/desactiva
- Deberías escuchar: "Voiceover activado" (si el audio funciona)
- En la consola verás logs como: `"Voiceover toggle: true"`

**Si el switch NO responde:**
- El problema está en el Switch component
- Abre la consola → verifica que `handleVoiceoverToggle` se ejecuta
- Verifica que `setVoiceoverEnabled` funciona

**Si el switch SÍ responde pero no hay audio:** → Continúa al Paso 4

---

## Paso 4: Verifica que el Audio Está Habilitado ✅

1. Asegúrate de que tu dispositivo/emulador:
   - **NO está en modo silencioso** (Mira el botón físico en iOS)
   - Tiene **volumen activado**
   - **No está en "No Molestar"**

2. Prueba con otro app que use audio (YouTube, Spotify)

3. Si otro app reproduce audio → el problema está en expo-speech

---

## Paso 5: Debugging en Consola ✅

Abre la consola de tu navegador (F12) o terminal y busca estos logs:

```
✅ Si ves estos mensajes, todo funciona:
- "AccessibilitySettings montado"
- "Voiceover toggle: true" (cuando tocas el switch)
- "Speech completed: Voiceover activado"

❌ Si ves estos errores, hay un problema:
- "Text-to-speech error: ..."
- "Error de contexto: ..."
- Undefined is not a function
```

---

## Soluciones Rápidas

### Problema: No se ve el botón ♿
```
→ Abre app/(tabs)/_layout.tsx
→ Busca: "headerRight: () => ("
→ Verifica que el TouchableOpacity esté ahí
→ Reinicia la app
```

### Problema: El switch existe pero no funciona
```
→ Abre components/AccessibilitySettings.tsx
→ Verifica que handleVoiceoverToggle sea llamado
→ En la consola, toca el switch y verifica el log
```

### Problema: Escuchas el audio pero está silenciado
```
→ Verifica volumen del dispositivo
→ En emulador Android: abre Developer Options
→ En emulador iOS: menu → I/O → Audio Output
```

---

## 📞 Info para Reportar

Si nada funciona, recolecta esta información:

1. **¿Qué ves en consola?** (Copia-pega los errores)
2. **¿El botón ♿ aparece?** (Sí/No)
3. **¿El switch responde?** (Sí/No)
4. **¿Hay sonido en otros apps?** (Sí/No)
5. **¿Qué dispositivo?** (iPhone/Android/Emulador)
6. **¿Qué versión de Expo?** (54.0.34)

---

## ✅ Checklist de Verificación

- [ ] El botón ♿ está visible en la esquina superior derecha
- [ ] Al tocarlo, se abre un modal
- [ ] El modal tiene un título "Accesibilidad"
- [ ] El modal tiene 2 interruptores
- [ ] El primer interruptor se llama "Activar Voiceover"
- [ ] Al tocar el switch, cambia de color
- [ ] La consola muestra logs cuando tocas el switch
- [ ] El dispositivo tiene sonido activado
- [ ] Otros apps reproducen sonido correctamente

Si todos estos puntos ✅, entonces expo-speech debería funcionar y escucharías audio.

