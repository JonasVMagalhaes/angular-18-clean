export class StringUtils {
    static isEmpty(value: string): boolean {
        return !Boolean(value);
    }

    static isLessThen(value: string, size: number): boolean {
        return value.length < size;
    }

    static isLessOrEqualThen(value: string, size: number): boolean {
        return value.length <= size;
    }

    static isMoreThen(value: string, size: number): boolean {
        return value.length > size;
    }

    static isMoreOrEqualThen(value: string, size: number): boolean {
        return value.length >= size;
    }

    static hasNumber(value: string): boolean {
        return /\d/.test(value);
    }

    static hasLowercase(value: string): boolean {
        return /[a-z]/.test(value);
    }

    static hasUppercase(value: string): boolean {
        return /[A-Z]/.test(value);
    }

    static hasSpecialCharacter(value: string): boolean {
        return /\W/.test(value);
    }

    static hasWhiteSpace(value: string): boolean {
        return value.includes(" ");
    }

    static isEqual(value1: string, value2: string): boolean {
        return value1 === value2;
    }
};
