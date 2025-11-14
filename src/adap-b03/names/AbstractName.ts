import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.delimiter = delimiter;
    }

    public abstract clone(): Name;

    public asString(delimiter: string = this.delimiter): string {
        const parts: string[] = [];
        const count = this.getNoComponents();
        for(let i = 0; i < count; i++) {
            parts.push(this.getComponent(i));
        }
        return parts.map(s => AbstractName.unescaped(s)).join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        const parts: string[] = [];
        const count = this.getNoComponents();
        for(let i = 0; i < count; i++) {
            parts.push(this.getComponent(i));
        }
        return parts.map(
                s => AbstractName.escaped(
                    AbstractName.unescaped(s), DEFAULT_DELIMITER)
            ).join(DEFAULT_DELIMITER);
    }

    public isEqual(other: Name): boolean {
        return this.delimiter == other.getDelimiterCharacter()
            && this.asDataString() == other.asDataString();
    }

    public getHashCode(): number {
        let hash: number = 0;
        const dataStr: string = this.asDataString();
        for (let i = 0; i < dataStr.length; i++) {
            const charCode = dataStr.charCodeAt(i);
            hash = (hash << 5) - hash + charCode;
            hash |= 0;
        }
        return hash;
    }

    public isEmpty(): boolean {
        return this.asDataString() == "";
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        if (other.getDelimiterCharacter() !== this.delimiter) {
            throw new Error("Delimiters do not match");
        }
        const otherCount = other.getNoComponents();
        for(let i = 0; i < otherCount; i++) {
            this.append(other.getComponent(i));
        }
    }

    // helper methods

    protected checkBounds(index: number): void {
        const maxIndex = this.getNoComponents();
        if (index < 0 || index >= maxIndex) {
            throw new Error(`Index out of bounds: ${index} for length ${maxIndex}`);
        }
    }

    // add escape characters to a string
    protected static escaped(s: string, delimiter: string): string {
        return s.replaceAll(ESCAPE_CHARACTER, ESCAPE_CHARACTER + ESCAPE_CHARACTER) // \ -> \\
                .replaceAll(delimiter, ESCAPE_CHARACTER + delimiter);              // . -> \.
    }

    // remove escape characters from a string, reconstructing the original
    protected static unescaped(s: string): string {
        const tempMarker: string = "ඞ"; // placeholder to distinguish \. from \\.
        const masked: string = s.replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, tempMarker);
        return masked.replaceAll(ESCAPE_CHARACTER, "").replaceAll(tempMarker, ESCAPE_CHARACTER);
    }

    // remove escape characters and construct string array
    protected static unescapedArray(s: string, delimiter: string): string[] {
        const escapeMarker: string = "ඞ";
        const delimMarker: string = "숫";
        const masked: string = s.replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, escapeMarker)
                              .replaceAll(ESCAPE_CHARACTER + delimiter, delimMarker)
                              .replaceAll(ESCAPE_CHARACTER, "");
        const parts: string[] = masked.split(delimiter);
        return parts.map(c => c.replaceAll(escapeMarker, ESCAPE_CHARACTER).replaceAll(delimMarker, delimiter));
    }

    // construct string array, but keep escape characters
    protected static escapedArray(s: string, delimiter: string): string[] {
        const escapeMarker: string = "ඞ";
        const delimMarker: string = "숫";
        const masked: string = s.replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, escapeMarker)
                              .replaceAll(ESCAPE_CHARACTER + delimiter, delimMarker);
        const parts: string[] = masked.split(delimiter);
        return parts.map(c => c.replaceAll(escapeMarker, ESCAPE_CHARACTER + ESCAPE_CHARACTER)
                                    .replaceAll(delimMarker, ESCAPE_CHARACTER + delimiter));
    }
}