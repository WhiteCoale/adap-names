import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        if (delimiter !== undefined) {
            if (typeof delimiter !== 'string' || delimiter.length !== 1) {
                throw new Error("Delimiter must be a single character string");
            }
            this.delimiter = delimiter;
        }
        this.name = source;
        this.noComponents = this.calculateNoComponents();
    }

    public asString(delimiter: string = this.delimiter): string {
        if (delimiter === this.delimiter) {
            return this.name;
        }
        // Convert to different delimiter
        const components = this.getComponents();
        return components.join(delimiter);
    }

    public asDataString(): string {
        if (this.delimiter === DEFAULT_DELIMITER) {
            return this.name;
        }
        const components = this.getComponents();
        return components.join(DEFAULT_DELIMITER);
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.noComponents === 0;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(x: number): string {
        if (!Number.isInteger(x) || x < 0 || x >= this.noComponents) {
            throw new Error(`Index ${x} out of bounds [0, ${this.noComponents - 1}]`);
        }
        const components = this.getComponents();
        return components[x];
    }

    public setComponent(n: number, c: string): void {
        if (!Number.isInteger(n) || n < 0 || n >= this.noComponents) {
            throw new Error(`Index ${n} out of bounds [0, ${this.noComponents - 1}]`);
        }
        const components = this.getComponents();
        components[n] = c;
        this.name = components.join(this.delimiter);
    }

    public insert(n: number, c: string): void {
        if (!Number.isInteger(n) || n < 0 || n > this.noComponents) {
            throw new Error(`Index ${n} out of bounds [0, ${this.noComponents}]`);
        }
        const components = this.getComponents();
        components.splice(n, 0, c);
        this.name = components.join(this.delimiter);
        this.noComponents++;
    }

    public append(c: string): void {
        if (this.noComponents === 0) {
            this.name = c;
        } else {
            this.name += this.delimiter + c;
        }
        this.noComponents++;
    }

    public remove(n: number): void {
        if (!Number.isInteger(n) || n < 0 || n >= this.noComponents) {
            throw new Error(`Index ${n} out of bounds [0, ${this.noComponents - 1}]`);
        }
        const components = this.getComponents();
        components.splice(n, 1);
        this.name = components.join(this.delimiter);
        this.noComponents--;
    }

    public concat(other: Name): void {
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
    }

    private getComponents(): string[] {
        if (this.noComponents === 0) {
            return [];
        }
        return this.name.split(this.delimiter);
    }

    private calculateNoComponents(): number {
        if (this.name === "") {
            return 0;
        }
        return this.name.split(this.delimiter).length;
    }

}