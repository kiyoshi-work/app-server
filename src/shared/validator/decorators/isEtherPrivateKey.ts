import {
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Wallet } from 'ethers';

@ValidatorConstraint({ async: false })
class IsEtherPrivateKeyConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    try {
      new Wallet(value);
    } catch (e) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return `Invalid Ether Private Key`;
  }
}

// Create Decorator for the constraint that was just created
export function IsEtherPrivateKey() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      validator: IsEtherPrivateKeyConstraint,
    });
  };
}
