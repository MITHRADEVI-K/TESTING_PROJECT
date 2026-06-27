# QAForge

## Intelligent Test Automation Platform

QAForge is a Java-based automation framework scaffold built with Selenium, TestNG, and Maven.

### Project structure

- `src/main/java` - framework code
- `src/test/java` - automation tests
- `src/test/resources` - configuration files
- `reports`, `screenshots`, `logs` - generated test artifacts

### Getting started

1. Install Java 17 and Maven.
2. Run `mvn test`.

### First milestone

- `DriverManager` to manage browser instances.
- `ConfigManager` to read test settings.
- `LoggerUtil` for structured logging.
- `SanityTest` as the first smoke test.
