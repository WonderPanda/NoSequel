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

export function snakeCase(input: string): string {
    const STRING_DECAMELIZE_REGEXP = (/([a-z\d])([A-Z])/g);
    return input.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
}

/**
 * Converts a string to camel case format
 * @param str Input string
 */
function camelCase(str: string): string {
    return str.replace(/(\-|_\w)/g, (m: string) => m[1].toUpperCase());
}
