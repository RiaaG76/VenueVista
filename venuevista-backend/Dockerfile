# ==============================================================================
# VenueVista Backend - Multi-stage Production Dockerfile for Render Deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build the Spring Boot application using Maven & Eclipse Temurin JDK 21
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy Maven Project Object Model (POM) first to leverage Docker layer caching
COPY pom.xml .

# Download dependencies offline before copying full source code
RUN mvn dependency:go-offline -B

# Copy project source code
COPY src ./src

# Compile, package, and build the executable Spring Boot fat JAR
# Note: Unit tests requiring a live MySQL instance are executed during CI
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Minimal Production Runtime using Eclipse Temurin JRE 21
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

# Create a dedicated non-root system group and user for secure container execution
RUN groupadd -r venuevista && useradd -r -g venuevista -s /bin/false venuevista

# Copy the packaged executable JAR from the builder stage
COPY --from=builder /build/target/*.jar /app/app.jar

# Set ownership of application assets to the non-root user
RUN chown -R venuevista:venuevista /app

# Run the container as the non-root user
USER venuevista

# Render injects PORT dynamically; 8081 serves as the local fallback default
ENV PORT=8081
EXPOSE 8081

# Launch the Spring Boot executable JAR with container-optimized JVM flags
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
