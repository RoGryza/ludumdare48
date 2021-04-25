export type VariableTypes = {
    playerSpeed: number,
    handOffset: number,
    stageWidth: number,
    stageHeight: number,
}

export type Variables = {
    [K in keyof VariableTypes]: Variable<VariableTypes[K]>
}

export class VariableChangeEvent<T> extends Event {
    constructor(public oldValue: T, public newValue: T) {
        super("change");
    }
}

export class VariableValidityEvent extends Event {
    constructor(public error: string | null, public raw: string) {
        super("validity");
    }
}

type EventTypeMap<T> = {
    change: VariableChangeEvent<T>,
    validity: VariableValidityEvent,
}

export abstract class Variable<T> extends EventTarget {
    private _error?: string = null;
    public readonly defaultValue: T;

    protected constructor(private _value: T) {
        super();
        this.defaultValue = _value;
    }

    public get value(): T {
        return this._value;
    }

    public set value(value: T) {
        if (value === this._value) {
            return;
        }

        const old = this._value;
        this._value = value;
        if (!this.dispatchEvent(new VariableChangeEvent(old, value))) {
            this._value = old;
        }
    }

    public get valid(): boolean {
        return this._error === null;
    }

    // Specialize for EventTypeMap
    public addEventListener<K extends keyof EventTypeMap<T>>(
        type: K,
        listener: (this: this, ev: EventTypeMap<T>[K]) => void,
        options?: boolean | AddEventListenerOptions,
    ): void {
        super.addEventListener(type, listener, options);
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
        const wasValid = this.valid;
        try {
            newValue = this.parseValue(raw);
        } catch (e) {
            this.dispatchEvent(new VariableValidityEvent(e.toString(), raw));
            return;
        }
        this.value = newValue;
        this._error = null;
        if (!wasValid) {
            this.dispatchEvent(new VariableValidityEvent(null, raw));
        }
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
            variable.addEventListener('change', function(e) {
                textNode.innerText = this.formatValue(e.newValue);
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