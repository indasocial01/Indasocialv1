## IndaSocial

IndaSocial es un marketplace Web3 que conecta marcas y creadores de contenido para descubrir oportunidades, colaborar en campañas y construir relaciones de largo plazo. La plataforma combina herramientas sociales, gestión de campañas, contenido educativo y recompensas con IndaToken.

Este repositorio contiene el prototipo funcional presentado para un hackathon.

## Propuesta de valor

- **Para creadores:** encontrar colaboraciones, mostrar su perfil, comunicarse con marcas y consultar sus ganancias y alcance.
- **Para marcas:** descubrir creadores, publicar y gestionar campañas, recibir propuestas y seguir el rendimiento de sus acciones.
- **Para la comunidad:** conectar mediante matching, chat, eventos, publicaciones y contenido Learn & Earn.
- **Para el ecosistema Web3:** utilizar una wallet Phantom y tokens SPL en Solana Devnet para representar recompensas y pagos dentro del producto.

## Funcionalidades principales

### Acceso y perfiles

1. El usuario inicia sesión con Google mediante Supabase Auth.
2. En el onboarding selecciona el rol **Creator** o **Brand**.
3. El perfil se guarda en Supabase y el usuario accede a un dashboard adaptado a su rol.
4. Desde Settings puede actualizar su información, avatar, wallet y preferencias.

### Marketplace y colaboración

- Dashboard con campañas activas, propuestas y métricas.
- Flujo de creación, revisión y seguimiento de campañas.
- Matching tipo swipe entre marcas y creadores.
- Chat privado para conversaciones después de un match.
- Estados de propuesta como aceptada, completada y pagada.

### Comunidad y aprendizaje

- Blog público e interno.
- Publicaciones con contenido gratuito y premium.
- Desbloqueo de contenido mediante una función RPC de Supabase.
- Eventos y registro de asistentes.
- Notificaciones y widget para enviar feedback.

### Integración Web3

- Conexión de wallet Phantom.
- Consulta de saldo SOL en **Solana Devnet**.
- Consulta y transferencia de IndaToken como token SPL.
- Registro de la dirección de wallet en el perfil del usuario.
- IDL y helper de Anchor preparados para operaciones de campañas escrow.

> El flujo visible de wallet y transferencias está conectado a Devnet. El helper de escrow (`utils/solanaEscrow.js`) y su IDL (`src/idl/inda_campaigns.json`) están incluidos como base de integración; no se debe interpretar que el programa Anchor está desplegado o conectado a todas las pantallas del prototipo.

## Stack tecnológico

### Frontend y aplicación

- [Next.js](https://nextjs.org/) `16.2.10` con App Router.
- [React](https://react.dev/) `19.2.4`.
- TypeScript para configuración y layout raíz; vistas y componentes principalmente en JSX.
- Tailwind CSS `4` mediante PostCSS.
- Lucide React para iconos.

### Backend y autenticación

- [Supabase](https://supabase.com/) para autenticación, base de datos, Storage y funciones RPC.
- Supabase SSR para clientes de navegador y servidor.
- Google OAuth como método de acceso.

### Blockchain

- Solana Devnet.
- `@solana/web3.js` y `@solana/spl-token` para operaciones de wallet y tokens.
- Anchor para la preparación del flujo de escrow.
- Phantom como wallet compatible en el prototipo.

### Calidad y tooling

- ESLint `9` con `eslint-config-next`.
- Node.js y npm.
- `package-lock.json` para instalaciones reproducibles.

## Arquitectura del proyecto

```text
app/
	(public)/              Rutas públicas: landing, blog y login
	(auth)/onboarding/     Configuración inicial del rol
	(dashboard)/           Layout y rutas protegidas de la aplicación
	auth/callback/         Callback de OAuth de Supabase
src/
	components/            Componentes reutilizables de UI y flujos
	context/               Estado global de autenticación y perfil
	data/                  Datos de blog y datos mock del prototipo
	idl/                   IDL del programa Anchor
	views/                 Vistas principales de cada módulo
utils/supabase/          Clientes Supabase para navegador y servidor
utils/solanaEscrow.js    Helper de operaciones escrow con Anchor
public/                  Imágenes, logos y recursos multimedia
```

Las páginas de `app/` funcionan como puntos de entrada y renderizan vistas de `src/views`. El layout del dashboard controla la sesión y dirige al usuario al login o al onboarding cuando corresponde.

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Landing page y propuesta de IndaSocial |
| `/blog` | Blog público |
| `/login` | Inicio de sesión con Google |
| `/onboarding` | Selección de rol y aceptación de términos |
| `/dashboard` | Panel principal personalizado |
| `/sales` | Campañas y actividad comercial |
| `/connect` | Descubrimiento y conexión con perfiles |
| `/chat` | Conversaciones entre matches |
| `/community` | Espacio social de la comunidad |
| `/events` | Eventos y registros |
| `/internal-blog` | Contenido para usuarios autenticados |
| `/learnearn` | Contenido educativo y recompensas |
| `/notifications` | Notificaciones |
| `/settings` | Perfil, preferencias y wallet |

## Requisitos

- Node.js 20 o superior recomendado.
- npm.
- Un proyecto de Supabase.
- Google OAuth configurado en Supabase Auth.
- Phantom instalado para probar las funciones Web3.
- SOL e IndaToken de prueba en Solana Devnet para realizar transferencias.

## Instalación y ejecución

```bash
npm install
```

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Inicia el entorno de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).


## Scripts disponibles

```bash
npm run dev      # Servidor local de desarrollo
npm run lint     # Análisis estático con ESLint
npm run build    # Compilación de producción
npm start        # Servidor con la compilación generada
```

## Estado del prototipo y próximos pasos

### Implementado en el repositorio

- Navegación pública y dashboard con rutas separadas.
- Autenticación Google y persistencia de perfiles en Supabase.
- Onboarding por rol.
- Campañas, propuestas, matching, chat, blog, eventos y Learn & Earn.
- Conexión de Phantom y operaciones de prueba sobre Solana Devnet.
- Base de integración Anchor para campañas escrow.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
