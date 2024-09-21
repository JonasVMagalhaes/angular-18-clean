export class PasswordUtils {
    static isCommon(value: string): boolean {
        return /password/i.test(value)
            || /123456/i.test(value)
            || /qwerty/i.test(value)
            || /abc123/i.test(value)
            || /password123/i.test(value);
    }
}
