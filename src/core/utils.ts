export function extend<T, U>(first: T, second: U): T & U {
  let result = <T & U>{};
  for (let id in first) {
      (<any>result)[id] = (<any>first)[id];
  }
  for (let id in second) {
      if (!result.hasOwnProperty(id)) {
          (<any>result)[id] = (<any>second)[id];
      }
  }
  return result;
}

export function commaSeparatedSpacedString(strings: string[]): string {
    const totalLength = strings.length;
    return strings.map((x, i) => {
        return i === totalLength - 1
            ? x
            : `${x},`;
    }).join(' ')
}

export function injectAllButLastString(strings: string[], toInject: string) {
    const totalLength = strings.length;
    return strings.map((x, i) => {
        return i === totalLength - 1
            ? x
            : `${x}${toInject}`;
    }).join('')
}