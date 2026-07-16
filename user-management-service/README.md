# User Management Service

Spring Boot service for Bike Done user management.

## Local development

Use Java 21.

The application uses the `dev` profile by default and imports secrets from:

```text
config/dev/secrets.properties
```

Add your Neon dev database settings there:

```properties
UMS_DB_URL=jdbc:postgresql://<host>/<database>?sslmode=require
UMS_DB_USERNAME=<username>
UMS_DB_PASSWORD=<password>
```

Run:

```bash
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./mvnw spring-boot:run
```

Useful endpoints:

```text
http://localhost:8081/actuator/health
http://localhost:8081/swagger-ui.html
http://localhost:8081/swagger-ui/index.html
```
