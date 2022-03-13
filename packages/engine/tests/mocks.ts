/* eslint-disable max-classes-per-file */
import { inspect } from 'util';

import App from '@stackmate/lib/terraform/app';
import Stack from '@stackmate/lib/terraform/stack';
import Entity from '@stackmate/lib/entity';
import Parser from '@stackmate/lib/parsers';
import { AttributeParsers, CloudPrerequisites, Validations } from '@stackmate/types';
import { CloudStack } from '@stackmate/interfaces';
import { Attribute } from '@stackmate/lib/decorators';
import { PROVIDER } from '@stackmate/constants';
import { AWS_REGIONS } from '@stackmate/providers/aws/constants';
import { stackName, appName } from 'tests/fixtures';

export const getMockApp = (name: string) => (
  new App(name)
);

export const getMockStack = ({ app = getMockApp(appName), name = stackName } = {}): CloudStack => (
  new Stack(app, name)
);

export const getAwsPrerequisites = (): CloudPrerequisites => {
  let aws;
  try {
    aws = getCloudByProvider(PROVIDER.AWS, { regions: Object.values(AWS_REGIONS) });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(inspect(error, { depth: 20 }));
    throw new Error('Failure when instantiating the AWS cloud provider');
  }

  return aws.prerequisites();
};

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
