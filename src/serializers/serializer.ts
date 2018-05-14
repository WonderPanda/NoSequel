import { DataType } from "../core/domain";

export type Serializer = (value: any) => any;

export function getDataType(value: any) : DataType | undefined {
    if (typeof(value) === typeof(true)) {
        return 'boolean';
    }
    
    if (!isNaN(value)) {
        return 'number';
    }

    

    return undefined;
}