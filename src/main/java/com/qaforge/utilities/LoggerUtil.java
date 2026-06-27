package com.qaforge.utilities;

import java.util.logging.Level;
import java.util.logging.Logger;

public final class LoggerUtil {

    private static final Logger LOGGER = Logger.getLogger(LoggerUtil.class.getName());

    private LoggerUtil() {
        // Utility class
    }

    public static void info(String message) {
        LOGGER.log(Level.INFO, message);
    }

    public static void warn(String message) {
        LOGGER.log(Level.WARNING, message);
    }

    public static void error(String message, Throwable throwable) {
        LOGGER.log(Level.SEVERE, message, throwable);
    }
}
