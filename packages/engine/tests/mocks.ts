/* eslint-disable max-classes-per-file */
import App from 'engine/lib/terraform/app';
import Stack from 'engine/lib/terraform/stack';
import Entity from 'engine/lib/entity';
import Parser from 'engine/lib/parsers';
import { Attribute } from 'engine/lib/decorators';
import { stackName, appName } from 'tests/fixtures/generic';
import { CloudStack, AttributeParsers, Validations } from 'engine/types';

export const getMockApp = (name: string) => (
  new App(name)
);

export const getMockStack = ({ app = getMockApp(appName), name = stackName } = {}): CloudStack => (
  new Stack(app, name)
);

export const multiply = (value: number, { times = 5 } = {}) => (
  value * times
);

export class MockEntity extends Entity {
  public validationMessage: string = 'The entity is invalid';

  @Attribute name: string;

  @Attribute number: number;

  parsers(): AttributeParsers {
    return {
      name: Parser.parseString,
      number: multiply,
    };
  }

  validations(): Validations {
    return {
      name: {
        presence: {
          allowEmpty: false,
          message: 'You have to specify a name to use',
        },
      },
      number: {
        numericality: {
          message: 'The number provided is invalid',
        },
      },
    };
  }
}

export class ExtendedMockEntity extends MockEntity {
  @Attribute email: string;

  parsers(): AttributeParsers {
    return {
      ...super.parsers(),
      email: Parser.parseString,
    };
  }

  validations(): Validations {
    return {
      ...super.validations(),
      email: {
        presence: {
          allowEmpty: false,
          message: 'You have to specify an email',
        },
      },
    };
  }
}
