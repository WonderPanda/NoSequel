import { Serializer, getDataType } from './serializer';
import { ColumnType } from '../decorators/column.decorator';
import { types } from 'cassandra-driver';
import { DataType } from '../core/domain';

const serializerMap = new Map<ColumnType, Map<DataType, Serializer>>();
const deserialzerMap = new Map<ColumnType, Map<DataType, Serializer>>();

function addSerializer(colType: ColumnType, dataType: DataType, serializer: Serializer) {
    let colTypeSerializers = serializerMap.get(colType);
    if (!colTypeSerializers) {
        colTypeSerializers = new Map<DataType, Serializer>();
        serializerMap.set(colType, colTypeSerializers);
    }

    colTypeSerializers.set(dataType, serializer);
}   

function addDeserializer(colType: ColumnType, dataType: DataType, serializer: Serializer) {
    let colTypeSerializers = deserialzerMap.get(colType);
    if (!colTypeSerializers) {
        colTypeSerializers = new Map<DataType, Serializer>();
        deserialzerMap.set(colType, colTypeSerializers);
    }

    colTypeSerializers.set(dataType, serializer);
}

addSerializer('text', 'object', (input: object) => { return JSON.stringify(input) });
addSerializer('timeuuid', 'date', (input: Date) => { return types.TimeUuid.fromDate(input) });
addSerializer('timestamp', 'date', (input: Date) => { return types.generateTimestamp(input) });

addDeserializer('text', 'object', (input: string) => { return JSON.parse(input) });
addDeserializer('timeuuid', 'date', (input: types.TimeUuid) => { return input.getDate() });
addDeserializer('timestamp', 'date', (input: string) => { return new Date(input) });

export function serialize(colType: ColumnType, input: any, dataType?: DataType): any {
    dataType = dataType || getDataType(input);
    if (!dataType) {
        return input;
    }

    const colTypeSerializers = serializerMap.get(colType);
    if (!colTypeSerializers) {
        return input;
    } 

    const serializer = colTypeSerializers.get(dataType);
    return serializer ? serializer(input) : input;
}

