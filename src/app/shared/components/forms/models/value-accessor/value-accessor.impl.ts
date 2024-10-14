export abstract class ValueAccessorImpl {
    abstract value: string;
    abstract onChange: Function;
    abstract onTouched: Function;
    abstract writeValue: (value: string) => void;
    abstract registerOnChange: (fn: Function) => void;
    abstract registerOnTouched: (fn: Function) => void;
    abstract setDisabledState: (isDisabled: boolean) => void;
    abstract updateValue: (newValue: string) => void;
}
