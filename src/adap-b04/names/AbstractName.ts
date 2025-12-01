import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    protected constructor(delimiter: string = DEFAULT_DELIMITER) {
        IllegalArgumentException.assert(this.isValidDelimiter(delimiter), "delimiter must be single character");

        this.delimiter = delimiter;

        MethodFailedException.assert(this.getDelimiterCharacter() === delimiter, "delimiter not set correctly");
    }

    public clone(): Name{

        return this;
    }

    public asString(delimiter: string = this.delimiter): string {
        IllegalArgumentException.assert(this.isValidDelimiter(delimiter), "delimiter must be single character");

        const parts: string[] = [];
        const count = this.getNoComponents();
        for(let i = 0; i < count; i++) {
            parts.push(this.getUnmaskedComponent(this.getComponent(i)));
        }
        return parts.join(delimiter);
    }

    public toString(): string {

        return this.asDataString();
    }

    public asDataString(): string {
        let name: string = "";

        const length: number = this.getNoComponents();

        for (let i: number = 0; i < length - 1; i++) {
            name += this.getComponent(i) + this.delimiter;
        }

        if (length > 0) {
            name += this.getComponent(length - 1);
        }

        return name;
    }

    public isEqual(other: Name): boolean {

        return this.getHashCode() === other.getHashCode();
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
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        InvalidStateException.assert(this.delimiter.length === 1, "delimiter state invalid");

        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        IllegalArgumentException.assert(other.getDelimiterCharacter() === this.delimiter, "Delimiters do not match");
        IllegalArgumentException.assert(this.isValidName(other.asDataString()), "other name is not valid");

        const initialComponentCount = this.getNoComponents();
        const otherCount = other.getNoComponents();

        for(let i = 0; i < otherCount; i++) {
            this.append(other.getComponent(i));
        }

        MethodFailedException.assert(this.getNoComponents() === initialComponentCount + otherCount, "concat failed to append all components");
        InvalidStateException.assert(this.isValidName(this.asDataString()), "resulting name state is invalid");
    }

    // helper methods

    protected checkBounds(index: number): void {
        const maxIndex = this.getNoComponents();
        if (index < 0 || index >= maxIndex) {
            throw new IllegalArgumentException(`Index out of bounds: ${index} for length ${maxIndex}`);
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

    protected static isEscapedComponent(s: string, delimiter: string): boolean {
        const escapeMarker: string = "ඞ";
        const delimMarker: string = "숫";
        const masked: string = s.replaceAll(ESCAPE_CHARACTER + ESCAPE_CHARACTER, escapeMarker)
                              .replaceAll(ESCAPE_CHARACTER + delimiter, delimMarker);
        return !masked.includes(ESCAPE_CHARACTER) && !masked.includes(delimiter);
    }

    protected checkEscapement(s: string): void {
        if (!AbstractName.isEscapedComponent(s, this.getDelimiterCharacter())) {
            throw new IllegalArgumentException(`string not escaped! -> ${s}`);
        }
    }

    // helper methods for validation and unmasking

    protected getUnmaskedComponent(component: string): string {
        IllegalArgumentException.assert(this.isValidComponent(component), "component is not valid");

        const maskedDelimiter: string = ESCAPE_CHARACTER + this.getDelimiterCharacter();
        const maskedEscapeCharacter: string = ESCAPE_CHARACTER + ESCAPE_CHARACTER;

        return component
            .replaceAll(maskedDelimiter, this.getDelimiterCharacter())
            .replaceAll(maskedEscapeCharacter, ESCAPE_CHARACTER);
    }

    protected isValidIndex(i: number): boolean {
        return i >= 0 && i < this.getNoComponents();
    }

    protected isValidDelimiter(delimiter: string): boolean {
        return delimiter.length === 1;
    }

    protected isValidComponent(c: string): boolean {
        // if delimiter is ESCAPE_CHARACTER, validation is not possible
        if (this.delimiter === ESCAPE_CHARACTER) {
            return true;
        }

        let escapedCounter: number = 0;

        for (let i: number = 0; i < c.length; i++) {
            const char: string = c[i];

            switch (char) {
                case this.delimiter: {
                    if (escapedCounter === 1) {
                        escapedCounter = 0;
                    } else {
                        return false;
                    }
                    break;
                }

                case ESCAPE_CHARACTER: {
                    escapedCounter++;

                    if (escapedCounter === 2) {
                        escapedCounter = 0;
                    }

                    break;
                }

                default: {
                    if (escapedCounter !== 0) {
                        return false;
                    }
                }
            }
        }

        return escapedCounter === 0;
    }

    protected isValidName(n: string): boolean {
        // if delimiter is ESCAPE_CHARACTER, validation is not possible
        if (this.delimiter === ESCAPE_CHARACTER) {
            return true;
        }

        let escapedCounter: number = 0;

        for (let i: number = 0; i < n.length; i++) {
            const char: string = n[i];

            switch (char) {
                case this.delimiter: {
                    if (escapedCounter === 1) {
                        escapedCounter = 0;
                    }
                    break;
                }

                case ESCAPE_CHARACTER: {
                    escapedCounter++;

                    if (escapedCounter === 2) {
                        escapedCounter = 0;
                    }

                    break;
                }

                default: {
                    if (escapedCounter !== 0) {
                        return false;
                    }
                }
            }
        }

        return escapedCounter === 0;
    }
}