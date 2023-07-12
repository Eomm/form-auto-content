import { expectAssignable } from 'tsd';
import formAutoContent, {FormMethodOptions} from ".";
import { Readable } from "stream";

{ // no options supplied
  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  })

  expectAssignable<{payload: Readable, headers: Record<string, string>}>(myForm)
}

{ // object options with type FormMethodOptions specified
  const option: FormMethodOptions = { payload: 'body', headers: 'head' } as const
  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option);

  expectAssignable<{[x: string]: Record<string, string> | Readable | undefined}>(myForm)
}

{ // object options with satysfing FormMethodOptions
  const option = { payload: 'body', headers: 'head' } as const satisfies FormMethodOptions;

  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option);

  expectAssignable<{body: Readable, head: Record<string, string>}>(myForm)
}

{ // object options as const
  const option = { payload: 'body', headers: 'head' } as const

  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option)

  expectAssignable<{body: Readable, head: Record<string, string>}>(myForm)
}

{ // object options as const and only payload defined
  const option = { payload: 'body' } as const

  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option)

  expectAssignable<{body: Readable, headers: Record<string, string>}>(myForm)
}

{ // object options as const and only headers defined
  const option = { headers: 'head' } as const

  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option)

  expectAssignable<{payload: Readable, head: Record<string, string>}>(myForm)
}

{ // object options without as const
  const option = { payload: 'body', headers: 'head' }

  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, option)

  expectAssignable<{[x: string]: Readable | Record<string, string> | undefined}>(myForm)
}

{ // inline object
  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, { payload: 'body', headers: 'head' });

  expectAssignable<{body: Readable, head: Record<string, string>}>(myForm)
}

{ // inline object with payload property
  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, { payload: 'body' });

  expectAssignable<{body: Readable, headers: Record<string, string>}>(myForm)
}

{ // inline object with headers property
  const myForm = formAutoContent({
    field1: 'value1',
    field2: ['value2', 'value2.2']
  }, { headers: 'head' });

  expectAssignable<{payload: Readable, head: Record<string, string>}>(myForm)
}
