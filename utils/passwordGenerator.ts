/**
 * Password Generator Utility
 * Generates secure random passwords for student accounts
 */

export const PasswordGenerator = {
    /**
     * Generate a random password
     * Format: NFSU + 4 random digits + 2 random letters
     * Example: NFSU7234Ab
     */
    generate: (): string => {
        const digits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const letter1 = letters.charAt(Math.floor(Math.random() * letters.length));
        const letter2 = letters.charAt(Math.floor(Math.random() * letters.length));

        return `NFSU${digits}${letter1}${letter2}`;
    },

    /**
     * Generate multiple unique passwords
     */
    generateBatch: (count: number): string[] => {
        const passwords = new Set<string>();
        while (passwords.size < count) {
            passwords.add(PasswordGenerator.generate());
        }
        return Array.from(passwords);
    },

    /**
     * Validate password strength
     */
    isStrong: (password: string): boolean => {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password);
    }
};
