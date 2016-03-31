const UuidSearchRegex = /[xy]/g;


export function getTypeName(obj) {

  if (!obj) { throw new Error('obj argument cannot be null or undefined.'); }

  const ctor = obj.constructor;

  if (!ctor) { throw new Error('Object constructor not found.'); }

  if (ctor.name) { return ctor.name; }

  throw new Error('Object type name could not be determined.');

}

export function createUuidV4() {

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(UuidSearchRegex, function (c) {

    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
    const v = (c == 'x') ? r : (r & 0x3 | 0x8);

    return v.toString(16);

  });

}
