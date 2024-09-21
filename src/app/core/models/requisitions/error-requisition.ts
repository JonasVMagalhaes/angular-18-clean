import { CodeErrors } from "@enums/primitives/code-errors-enum";

export interface ErrorRequisition<T> {
    status: number;
    code: CodeErrors | T;
    message: string;
}