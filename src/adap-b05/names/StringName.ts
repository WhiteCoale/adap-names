import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { InvalidStateException } from "../common/InvalidStateException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        this.name = source;
        this.noComponents = AbstractName.escapedArray(source, this.delimiter).length;
    }

    clone(): StringName {
        return new StringName(this.name, this.delimiter);
    }

    getNoComponents(): number {
        return this.noComponents;
    }

    getComponent(i: number): string {
        this.checkBounds(i);
        const parts = AbstractName.escapedArray(this.name, this.delimiter);
        return parts[i];
    }
    setComponent(i: number, c: string) {
        this.checkBounds(i);
        this.checkEscapement(c);
        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts[i] = c;
        this.name = parts.join(this.delimiter);
        this.checkClassInvariants();
    }

    insert(i: number, c: string) {
        this.checkEscapement(c);
        if (i !== this.noComponents) {
            this.checkBounds(i);
        }
        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts.splice(i, 0, c);
        this.name = parts.join(this.delimiter);
        this.noComponents++;
        this.checkClassInvariants();
    }
    append(c: string) {
        this.checkEscapement(c);
        this.name += this.delimiter + c;
        this.noComponents++;
        this.checkClassInvariants();
    }
    remove(i: number) {
        this.checkBounds(i);
        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts.splice(i, 1);
        this.name = parts.join(this.delimiter);
        this.noComponents--;
        this.checkClassInvariants();
    }

    private checkClassInvariants(): void {
        const expectedCount = AbstractName.escapedArray(this.name, this.delimiter).length;
        InvalidStateException.assert(this.noComponents === expectedCount, "Component length broken");
    }
}