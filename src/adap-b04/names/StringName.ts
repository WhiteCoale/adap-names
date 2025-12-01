import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);

        IllegalArgumentException.assert(this.isValidName(source), "source name is not valid");

        const sourceComponentCount: number = AbstractName.escapedArray(source, this.delimiter).length;

        this.name = source;
        this.noComponents = sourceComponentCount;

        InvalidStateException.assert(this.isValidName(this.name) && this.noComponents >= 0, "invalid state after construction");
        MethodFailedException.assert(this.name === source && this.noComponents === sourceComponentCount, "construction failed");
    }

    public clone(): StringName {
        const cloned: StringName = new StringName(this.name, this.delimiter);

        const originalCount: number = this.getNoComponents();
        const clonedCount: number = cloned.getNoComponents();
        MethodFailedException.assert(clonedCount === originalCount, "clone failed");

        return cloned;
    }

    public getNoComponents(): number {
        const componentCount: number = this.noComponents;

        InvalidStateException.assert(componentCount >= 0, "component count cannot be negative");

        return componentCount;
    }

    public getComponent(i: number): string {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");

        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        const component: string = parts[i];

        InvalidStateException.assert(this.isValidComponent(component), "component state invalid");

        return component;
    }
    public setComponent(i: number, c: string): void {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts[i] = c;
        this.name = parts.join(this.delimiter);

        InvalidStateException.assert(this.isValidName(this.name), "resulting name state invalid");

        const resultComponent: string = this.getComponent(i);

        InvalidStateException.assert(this.isValidComponent(resultComponent), "resulting component state invalid");
        MethodFailedException.assert(resultComponent === c, "setComponent failed");
    }

    public insert(i: number, c: string): void {
        IllegalArgumentException.assert(this.isValidIndex(i) || i === this.noComponents, "index out of bounds");
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        const countBefore: number = this.noComponents;

        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts.splice(i, 0, c);
        this.name = parts.join(this.delimiter);

        this.increaseComponentCount();

        InvalidStateException.assert(this.isValidName(this.name), "resulting name state invalid");

        const insertedComponent: string = this.getComponent(i);

        InvalidStateException.assert(this.isValidComponent(insertedComponent), "resulting component state invalid");
        MethodFailedException.assert(this.noComponents === countBefore + 1 && insertedComponent === c, "insert failed");
    }
    public append(c: string): void {
        IllegalArgumentException.assert(this.isValidComponent(c), "component is not valid");

        const initialCount: number = this.noComponents;

        this.name += this.delimiter + c;

        this.increaseComponentCount();

        InvalidStateException.assert(this.isValidName(this.name), "resulting name state invalid");

        const appendedComponent: string = this.getComponent(this.noComponents - 1);

        InvalidStateException.assert(this.isValidComponent(appendedComponent), "resulting component state invalid");
        MethodFailedException.assert(this.noComponents === initialCount + 1 && appendedComponent === c, "append failed");
    }
    public remove(i: number): void {
        IllegalArgumentException.assert(this.isValidIndex(i), "index out of bounds");

        const previousCount: number = this.noComponents;

        const parts: string[] = AbstractName.escapedArray(this.name, this.delimiter);
        parts.splice(i, 1);
        this.name = parts.join(this.delimiter);

        this.decreaseComponentCount();

        InvalidStateException.assert(this.isValidName(this.name), "resulting name state invalid");
        MethodFailedException.assert(this.noComponents === previousCount - 1, "remove failed");
    }

    private increaseComponentCount(): void {
        InvalidStateException.assert(this.noComponents >= 0, "component count cannot be negative before increment");

        const countBefore: number = this.noComponents;

        this.noComponents += 1;

        const countAfter: number = this.noComponents;

        InvalidStateException.assert(countAfter >= 0, "component count cannot be negative after increment");
        MethodFailedException.assert(countAfter === countBefore + 1, "increment failed");
    }

    private decreaseComponentCount(): void {
        InvalidStateException.assert(this.noComponents >= 0, "component count cannot be negative before decrement");

        const countBefore: number = this.noComponents;

        this.noComponents -= 1;

        const countAfter: number = this.noComponents;

        InvalidStateException.assert(countAfter >= 0, "component count cannot be negative after decrement");
        MethodFailedException.assert(countAfter === countBefore - 1, "decrement failed");
    }
}