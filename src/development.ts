import * as PIXI from 'pixi.js';

export type VariableTypes = {
    playerSpeed: number,
    handOffset: number,

    stageWidth: number,
    stageHeight: number,

    civilianSpeed: number,
    civilianWanderMinMS: number,
    civilianWanderMaxMS: number,
    civilianWanderMinDist: number,
    civilianWanderMaxDist: number,
}

export type Variables = {
    [K in keyof VariableTypes]: Variable<VariableTypes[K]>
}

export abstract class Variable<T> extends PIXI.utils.EventEmitter<'change'> {
    public readonly defaultValue: T;

    protected constructor(private _value: T) {
        super();
        this.defaultValue = _value;
    }

    public get value(): T {
        return this._value;
    }

    public override emit(event: 'change', newValue: T, oldValue: T): boolean {
        return super.emit(event, newValue, oldValue);
    }

    public set value(value: T) {
        if (value === this._value) {
            return;
        }

        const old = this._value;
        this._value = value;
        this.emit('change', value, old);
    }

    // Specialize for EventTypeMap
    public on(
        eventName: 'change',
        listener: (this: this, newValue: T, oldValue: T) => void,
    ): this {
        return super.on(eventName, listener);
    }

    public render(): HTMLElement {
        const node = document.createElement("input");
        node.type = "text";
        node.value = this.formatValue(this.value);
        node.onchange = (_) => this.inputChanged(node.value);
        return node;
    }

    protected inputChanged(raw: string) {
        let newValue: T;
        try {
            newValue = this.parseValue(raw);
        } catch (e) {
            console.error(e);
            return;
        }
        this.value = newValue;
    }

    public formatValue(value: T): string {
        return value.toString();
    }

    public abstract parseValue(raw: string): T;
}

export class RangeVariable extends Variable<number> {
    public constructor(value: number, private _range: number = value, private _steps: number = 100) {
        super(value);
    }

    public override render(): HTMLElement {
        const node = super.render() as HTMLInputElement;
        node.type = "range";
        node.min = (this.defaultValue - this._range).toString();
        node.max = (this.defaultValue + this._range).toString();
        node.step = ((2 * this._range) / this._steps).toString();
        return node;
    }

    public parseValue(raw: string): number {
        return parseFloat(raw);
    }
}

export class DevelopmentPanel {
    private _container: HTMLElement;
    private _debugging: Record<string, HTMLElement>;
    private static _instance: DevelopmentPanel;

    public static init(variables: Variables, root: HTMLElement) {
        DevelopmentPanel._instance = new DevelopmentPanel(variables);
        DevelopmentPanel._instance.mount(root);
    }

    private constructor(public readonly variables: Variables) {
        this._container = document.createElement('div');
        this._debugging = {};
    }

    private mount(root: HTMLElement) {
        Object.entries(this.variables).forEach(([name, variable]) => {
            const variableNode = variable.render();
            const labelNode = document.createElement('label');
            labelNode.innerText = name;
            labelNode.appendChild(variableNode);

            const textNode = document.createElement('span');
            textNode.innerText = variable.formatValue(variable.value);
            variable.on('change', function(newValue) {
                textNode.innerText = this.formatValue(newValue);
            });

            const rowNode = document.createElement('div');
            rowNode.appendChild(labelNode);
            rowNode.appendChild(textNode);

            this._container.appendChild(rowNode);
        });

        const resetBtn = document.createElement('button');
        resetBtn.innerText = 'Reset';
        resetBtn.onclick = () => this.reset();
        const btnRow = document.createElement('div');
        btnRow.appendChild(resetBtn);
        this._container.appendChild(btnRow);

        root.appendChild(this._container);
    }

    public static debugValue(name: string, value: any) {
        const instance = DevelopmentPanel._instance;
        if (!(name in instance._debugging)) {
            const debugNode = document.createElement('span');
            const labelNode = document.createElement('label');
            labelNode.innerText = name;
            labelNode.appendChild(debugNode);
            const rowNode = document.createElement('div');
            rowNode.appendChild(labelNode);
            instance._container.appendChild(rowNode);
            instance._debugging[name] = debugNode;
        }
        instance._debugging[name].innerText = value.toString();
    }

    public reset() {
        Object.values(this.variables).forEach(v => v.value = v.defaultValue);
    }
}