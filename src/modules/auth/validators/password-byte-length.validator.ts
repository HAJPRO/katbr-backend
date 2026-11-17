import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function MaxPasswordBytes(
  maxBytes: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'maxPasswordBytes',
      target: object.constructor,
      propertyName,
      constraints: [maxBytes],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') {
            return false;
          }

          return Buffer.byteLength(value, 'utf8') <= maxBytes;
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not exceed ${maxBytes} bytes`;
        },
      },
    });
  };
}