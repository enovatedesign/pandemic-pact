export interface Dictionary<Type> {
    [key: string]: Type,
}

export type StringDictionary = Dictionary<string>;
