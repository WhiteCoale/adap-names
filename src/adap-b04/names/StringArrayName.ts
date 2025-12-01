import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        IllegalArgumentException.assert(source.length > 0, "source array must not be empty");

        this.components = source.map(s => AbstractName.unescaped(s));

        const componentCount: number = this.components.length;
        MethodFailedException.assert(componentCount === source.length, "failed to initialize components");
    }

    clone(): StringArrayName {
        const cloned: StringArrayName = new StringArrayName([""], this.delimiter);
        cloned.components = [...this.components];
        
        const originalCount: number = this.getNoComponents();
        const clonedCount: number = cloned.getNoComponents();
        MethodFailedException.assert(clonedCount === originalCount, "clone failed");
        
        return cloned;
    }

    getNoComponents(): number {
        const componentCount: number = this.components.length;

        InvalidStateException.assert(componentCount >= 0, "component count cannot be negative");

        return componentCount;
    }

    getComponent(i: number): string {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");

        const storedComponent: string = this.components[i];
        const escapedComponent: string = AbstractName.escaped(storedComponent, this.delimiter);

        InvalidStateException.assert(this.isValidComponent(escapedComponent), "component state invalid");

        return escapedComponent;
    }
    setComponent(i: number, c: string): void {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        this.components[i] = AbstractName.unescaped(c);

        const resultComponent: string = this.getComponent(i);

        InvalidStateException.assert(this.isValidComponent(resultComponent), "resulting component state invalid");
        MethodFailedException.assert(resultComponent === c, "setComponent failed");
    }

    insert(i: number, c: string): void {
        IllegalArgumentException.assert(this.isValidIndex(i) || i === this.components.length, "index out of bounds");
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        const countBefore: number = this.getNoComponents();

        this.components.splice(i, 0, AbstractName.unescaped(c));

        const countAfter: number = this.getNoComponents();
        const insertedComponent: string = this.getComponent(i);

        InvalidStateException.assert(this.isValidComponent(insertedComponent), "resulting component state invalid");
        MethodFailedException.assert(countAfter === countBefore + 1 && insertedComponent === c, "insert failed");
    }
    append(c: string): void {
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        const initialCount: number = this.getNoComponents();

        this.components.push(AbstractName.unescaped(c));

        const finalCount: number = this.getNoComponents();
        const appendedComponent: string = this.getComponent(finalCount - 1);

        InvalidStateException.assert(this.isValidComponent(appendedComponent), "resulting component state invalid");
        MethodFailedException.assert(finalCount === initialCount + 1 && appendedComponent === c, "append failed");
    }
    remove(i: number): void {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");

        const previousCount: number = this.getNoComponents();

        this.components.splice(i, 1);

        const currentCount: number = this.getNoComponents();

        MethodFailedException.assert(currentCount === previousCount - 1, "remove failed");
    }
}