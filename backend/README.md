# Mathematics Game — Java Backend

Spring Boot REST API that mirrors the Supabase Edge Function API used by the React frontend.

## Requirements

- Java 21 or newer (Java 26 is supported)
- Maven 3.9+ (or use the downloaded Maven binary as shown below)

## Quick start

### 1. Start the backend

From the `backend` folder:

```powershell
# If Maven is not installed, download it once:
# Invoke-WebRequest -Uri "https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.zip" -OutFile maven.zip
# Expand-Archive maven.zip -DestinationPath .
# .\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run

mvn spring-boot:run
```

The server starts at **http://localhost:8081** (port 8081 avoids conflicts with other services on 8080).

On first run it automatically:

- Seeds **19 math questions**
- Creates admin: `admin@example.com` / `admin123`

Manual seed (optional):

```powershell
curl -X POST http://localhost:8081/make-server-769bc21d/seed
```

Health check:

```powershell
curl http://localhost:8081/make-server-769bc21d/health
```

### 2. Connect the frontend

Copy `.env.example` to `.env` in the project root:

```
VITE_API_BASE_URL=http://localhost:8081/make-server-769bc21d
```

Then run the React app:

```powershell
npm run dev
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/seed` | Seed admin + questions |
| POST | `/auth/signup` | Register |
| POST | `/auth/signin` | Login (returns JWT) |
| GET | `/auth/session` | Current session |
| POST | `/auth/signout` | Logout |
| GET | `/user/{id}` | Profile |
| PUT | `/user/{id}` | Update profile |
| DELETE | `/user/{id}` | Delete account |
| PUT | `/progress/{id}` | Update progress |
| GET | `/leaderboard` | Rankings |
| GET/POST/PUT/DELETE | `/questions` | Question bank (admin for write) |
| GET | `/admin/users` | All users (admin) |
| GET/POST/PUT/DELETE | `/rewards` | Rewards (admin for write) |
| POST | `/ai/chat` | AI tutor (needs `OPENAI_API_KEY`) |

All paths are prefixed with `/make-server-769bc21d`.

## Configuration

Edit `src/main/resources/application.properties`:

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8081` | HTTP port |
| `app.jwt.secret` | (built-in) | Change in production |
| `openai.api-key` | empty | Set `OPENAI_API_KEY` env var for AI chat |
| `app.cors.allowed-origins` | `localhost:3000` | Frontend origins |

Data is stored in `backend/data/mathgame.mv.db` (H2 file database).

## Build JAR

```powershell
mvn clean package -DskipTests
java -jar target/math-game-backend-1.0.0.jar
```
