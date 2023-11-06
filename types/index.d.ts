import { Readable } from "stream";

export type FormMethodOptions = {
  readonly payload?: string,
  readonly headers?: string,
  readonly forceMultiPart?: boolean
}

type FormMethodDefaultOptions = {
  readonly payload: 'payload',
  readonly headers: 'headers'
}

type Neverify<T> = {
  [K in keyof T]: never
}

type WithoutExtraProperties<BaseType, Arg extends BaseType> = Arg & Neverify<Omit<Arg, keyof BaseType>>

type ComputedFormProperty<T extends FormMethodOptions, Property extends keyof T, DefaultValue extends string, ReturnType> = {
    [K in T[Property] as keyof T[Property] extends never 
    ? DefaultValue
    : K extends PropertyKey 
        ? K 
        : never
    ]: ReturnType
}

type FormMethodResult<T extends FormMethodOptions, K extends keyof T = keyof T> = string extends T[K]
  ? ComputedFormProperty<T, 'headers', string, Record<string, string> | undefined> | ComputedFormProperty<T, 'payload', string, Readable | undefined>
  : ComputedFormProperty<T, 'headers', 'headers', Record<string, string>> & ComputedFormProperty<T, 'payload', 'payload', Readable>

/**
 * @param {Record<string, unknown>}  json -  A JSON object that defines the fields of the form.
 * @param {FormMethodOptions}  opts - An object containing properties to modify the output field names.
 * @returns {FormMethodResult} A JSON object with a payload field representing the data stream and a headers field containing the content-type set to "application/json".
 */
export default function formMethod<T extends FormMethodOptions = FormMethodDefaultOptions>(
  json: Record<string, unknown>,
  opts?: T & WithoutExtraProperties<FormMethodOptions, T>
): FormMethodResult<T>

