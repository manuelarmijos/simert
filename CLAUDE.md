# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Watch mode
npm run start:debug     # Debug + watch

# Build
npm run build           # Compile TypeScript (prebuild cleans dist/)

# Code quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier

# Testing
npm test                # Jest unit tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage
npm run test:e2e        # End-to-end tests

# Infrastructure
docker-compose up -d    # Start PostgreSQL (PostGIS)
```

Single test: `npx jest --testPathPattern=<path-or-name>`

## Architecture

La documentación completa de arquitectura vive en [README.md](README.md). Ahí está todo lo que antes estaba aquí:

- Capas modulares (`src/admin/`, `src/client/`, `src/api/`, `src/auth/`, `src/common/`).
- Conexiones TypeORM multi-DB (default, `tracking`, `tracking_controller`) y cache Redis con prefijos por entorno (`P|` prod, `D|` dev).
- Jerarquía del dominio Parking: `Zone → Block → Slot → Fraction → FractionStatus → RangeSalePointTransaction → Card → Bank`.
- Diagrama Entidad-Relación (Mermaid) con las 24 tablas de [`src/admin/`](src/admin/) y sus FKs declaradas en TypeORM.
- Autenticación dual Keycloak/GIM: realms `GIM2_REALM_SERVICE_HUB` (clientes, `password`) y `GIM2_REALM_MUNICIPIO_K` (empleados municipales, `client_credentials`).
- Variables de entorno, scripts, despliegue con PM2.

### Reglas rápidas para Claude

- Las conexiones no-default requieren nombre explícito en `@Entity({ … })` y en `TypeOrmModule.forFeature([], 'tracking' | 'tracking_controller')`.
- `CheckboxUser` saldo:
  - **Incremento** (`+=`): al comprar en `RangeSalePointTransaction` o al asignar en `CheckboxService`.
  - **Decremento** (`-=`): en `simert.service.ts` al estacionar (`parking`, solo si `isPaidParking = true`) y al incrementar tiempo (`incrementTime`, siempre). Ambos usan `pessimistic_write` lock.
- `KeycloakService.getToken()` usa caché (ServiceHub). `getTokenMunicipalityK()` siempre fresco vía `client_credentials`.
- `KeycloakTokenGuard` decide el realm según el rol detectado (`ADMIN`/`CONTROLLER`/`SUPERVISOR` → municipio K).
- DTOs, interfaces y servicios compartidos siempre van en [`src/common/`](src/common/).
