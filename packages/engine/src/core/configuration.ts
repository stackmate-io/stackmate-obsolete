import { readFileSync } from 'fs';
import { clone, has, isEmpty, isObject, merge, omit } from 'lodash';
import validate from 'validate.js';
import YAML from 'yaml';

import { PROVIDER, SERVICE_TYPE } from '@stackmate/core/constants';
import { ConfigurationFileContents, ProviderChoice, Validations } from '@stackmate/types';
import { Validatable } from '@stackmate/interfaces';
import { ValidationError } from '@stackmate/core/errors';

class Configuration implements Validatable {
  /**
   * @var {Object} contents the configuration file's contents;
   */
  protected contents: ConfigurationFileContents;

  constructor(contents: ConfigurationFileContents = {}) {
    this.contents = contents;
    this.validate();
    this.normalize();
  }

  /**
   * Validates the configuration file's structure.
   * The subsequent service values will be validated during service initialization.
   */
  validate() {
    const errors = validate.validate(this.contents, this.validations(), {
      fullMessages: false,
    });

    if (errors) {
      throw new ValidationError('The project’s configuration is not valid', errors);
    }
  }

  /**
   * Returns a list of validations to validate the structure of the configuration file with
   *
   * @returns {Validations} the list of validations to use for the config file
   */
  validations(): Validations {
    const providers = Object.values(PROVIDER);

    /**
     * Validates the project's stages
     *
     * @param {Object} stages The stages configuration
     * @returns {String|undefined} The validation error message (if any)
     */
    validate.validators.validateStages = (stages: any) => {
      if (isEmpty(stages)) {
        return 'You have to provide a set of stages for the project';
      }

      if (!isObject(stages) || Object.values(stages).some(s => !isObject(s))) {
        return 'The stages for the project should be an object whose every member is an object';
      }

      const stagesHaveServiceTypesDefined = Object.values(stages).every(
        stage => (has(stage, 'type') && Object.values(SERVICE_TYPE).includes(stage.type)),
      );

      if (!stagesHaveServiceTypesDefined) {
        return 'You have to specify a type for every service in the stages';
      }
    };

    /**
     * Validates the project's defaults
     *
     * @param {Object} defaults the defaults to validate
     * @returns {String|undefined} the validation error message (if any)
     */
    validate.validators.validateDefaults = (defaults: any) => {
      // Allow defaults not being defined or empty objects
      if (!defaults || (isObject(defaults) && isEmpty(defaults))) {
        return;
      }

      if (!isObject(defaults) || Object.keys(defaults).some(prov => !providers.includes(prov as ProviderChoice))) {
        return 'The "defaults" entry should contain valid cloud providers in the mapping';
      }
    };

    return {
      name: {
        presence: {
          allowEmpty: false,
          message: 'You have to provide a name for the project',
        },
      },
      provider: {
        presence: {
          message: 'A default cloud provider should be specified',
        },
        inclusion: {
          within: providers,
          message: `The default cloud provider is invalid. Available options are ${providers.join(', ')}`,
        },
      },
      region: {
        presence: {
          message: 'A default region (that corresponds to the regions that the default cloud provider provides) should be specified',
        },
      },
      stages: {
        validateStages: true,
      },
      defaults: {
        validateDefaults: true,
      },
    };
  }

  /**
   * Applies arguments in stage services that were skipped for brevity
   */
  normalize() {
    const { provider, region } = this.contents;
    Object.keys(this.contents.stages || []).forEach(stageName => {
      if (!this.contents.stages) {
        throw new Error('You have to provide a list of stages');
      }

      const declaration = this.contents.stages[stageName];

      // Assign the default provider to the services that imply it
      if (!declaration.provider) {
        Object.assign(declaration, { provider });
      }

      // Assign the default region to the services that imply it
      if (!declaration.region) {
        Object.assign(declaration, { region });
      }

      // Copy the full attributes to stages that copy each other
      if (declaration.from) {
        const source = clone(
          // Omit any services that the copied stage doesn't need
          omit(this.contents.stages[declaration.from], ...(declaration.skip || []))
        );

        Object.assign(this.contents.stages, {
          [stageName]: merge(source, omit(declaration, 'from', 'skip')),
        });
      }
    });
  }

  /**
   * Loads a configuration file
   *
   * @param {String} path the path to load the configuration from
   * @returns {Configuration} the project configuration, validated and normalized
   */
  static async load(path: string) {
    let fileContents;

    try {
      fileContents = readFileSync(path);
    } catch (error) {
      throw new Error('The path for the configuration file specified is invalid');
    }

    let contents;
    try {
      contents = YAML.parse(fileContents.toString());
    } catch (error) {
      throw new Error('The configuration file should be a valid YAML file');
    }

    if (!contents || !isObject(contents)) {
      throw new Error('The configuaration file’s content is invalid');
    }

    return new Configuration(contents as ConfigurationFileContents);
  }
}

export default Configuration;