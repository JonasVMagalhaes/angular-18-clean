export class UUID {
    private static readonly characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    private static readonly sizeId = 20;

    static generate(): string {
        let id = '';
        for (let i = 0; i < this.sizeId; i++) {
            id += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
        }
        return id;
    }

    static validate(id: string): boolean {
        if (id.length !== this.sizeId) {
            return false;
        }
        for (let i = 0; i < id.length; i++) {
            if (!this.characters.includes(id[i])) {
                return false;
            }
        }
        return true;
    }
}
