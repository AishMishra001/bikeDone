package com.bikedone.usermanagement.common.security;

import com.bikedone.usermanagement.exception.BadRequestException;

public final class PasswordSimilarityValidator {

    private static final String ERROR_MESSAGE =
            "New password is too similar to the current password.";

    private PasswordSimilarityValidator() {
    }

    public static void validate(String currentPassword,
                                String newPassword) {

        checkAlphabeticPart(currentPassword, newPassword);
        checkContains(currentPassword, newPassword);
        checkCommonSuffix(currentPassword, newPassword);
    }

    private static void checkAlphabeticPart(String currentPassword,
                                            String newPassword) {

        String currentLetters = extractLetters(currentPassword);
        String newLetters = extractLetters(newPassword);

        if (!currentLetters.isBlank()
                && currentLetters.equalsIgnoreCase(newLetters)) {

            throw new BadRequestException(ERROR_MESSAGE);
        }
    }

    private static void checkContains(String currentPassword,
                                      String newPassword) {

        String current = normalize(currentPassword);
        String updated = normalize(newPassword);

        if (updated.startsWith(current)
                || current.startsWith(updated)
                || updated.contains(current)
                || current.contains(updated)) {

            throw new BadRequestException(ERROR_MESSAGE);
        }
    }

    private static void checkCommonSuffix(String currentPassword,
                                          String newPassword) {

        String current = normalize(currentPassword);
        String updated = normalize(newPassword);

        int i = current.length() - 1;
        int j = updated.length() - 1;
        int same = 0;

        while (i >= 0 && j >= 0
                && current.charAt(i) == updated.charAt(j)) {

            same++;
            i--;
            j--;
        }

        if (same >= 5) {
            throw new BadRequestException(ERROR_MESSAGE);
        }
    }

    private static String extractLetters(String password) {

        return password.replaceAll("[^A-Za-z]", "");
    }

    private static String normalize(String password) {

        return password
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
    }
}