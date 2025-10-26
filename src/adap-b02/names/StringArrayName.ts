import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        for (let i = 0; i < source.length; i++) {
            if (typeof source[i] !== 'string') {
                throw new Error(`Invalid component at index ${i}: expected string, got ${typeof source[i]}`);
            }
        }
        this.components = [...source];
        if (delimiter !== undefined) {
            if (typeof delimiter !== 'string' || delimiter.length !== 1) {
                throw new Error("Delimiter must be a single character string");
            }
            this.delimiter = delimiter;
        }
    }

    public asString(delimiter: string = this.delimiter): string {
        return this.components.join(delimiter);
    }

    public asDataString(): string {
        return this.components.join(DEFAULT_DELIMITER);
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.components.length === 0;
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
            throw new Error(`Index ${i} out of bounds [0, ${this.components.length - 1}]`);
        }
        return this.components[i];
    }

    public setComponent(i: number, c: string): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
            throw new Error(`Index ${i} out of bounds [0, ${this.components.length - 1}]`);
        }
        this.components[i] = c;
    }

    public insert(i: number, c: string): void {
        if (!Number.isInteger(i) || i < 0 || i > this.components.length) {
            throw new Error(`Index ${i} out of bounds [0, ${this.components.length}]`);
        }
        this.components.splice(i, 0, c);
    }

    public append(c: string): void {
        this.components.push(c);
    }

    public remove(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
            throw new Error(`Index ${i} out of bounds [0, ${this.components.length - 1}]`);
        }
        this.components.splice(i, 1);
    }

    public concat(other: Name): void {
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.components.push(other.getComponent(i));
        }
    }

}