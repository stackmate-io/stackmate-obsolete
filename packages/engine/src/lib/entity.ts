import { isEmpty, isFunction, pick, uniq } from 'lodash';

import { validate } from '@stackmate/lib/validation';
import { BaseEntity } from '@stackmate/interfaces';
import { AttributeParsers, EntityAttributes, Validations } from '@stackmate/types';
import { ValidationError } from '@stackmate/lib/errors';

abstract class Entity implements BaseEntity {
  /**
   * @var {Object} _state the state of the attributes
   * @private
   */
  protected state: EntityAttributes = {};

  /**
   * @constructor
   * @param {Object} attributes the entity's attributes
   */
  constructor(attributes: EntityAttributes) {
    this.attributes = attributes || {};
  }

  /**
   * @var {String} validationMessage the validation message to use
   */
  public readonly abstract validationMessage: string;

  /**
   * @returns {Array} the list of attribute names assigned to the entity
   */
  public get attributeNames(): Array<string> {
    const attributeNames = Reflect.getOwnMetadata(this.metadataKey, this) || [];

    let baseClass = Reflect.getPrototypeOf(this);
    while (baseClass instanceof Entity) {
      const baseMetadataKey = Reflect.get(baseClass, 'metadataKey');

      attributeNames.push(
        ...(Reflect.getOwnMetadata(baseMetadataKey, baseClass) || []),
      );

      baseClass = Reflect.getPrototypeOf(baseClass);
    }

    return uniq(attributeNames);
  }

  /**
   * @returns {Object} the attributes
   */
  public get attributes(): EntityAttributes {
    return this.state;
  }

  /**
   * @param {Object} values the attribute values to set
   */
  public set attributes(values: EntityAttributes) {
    Object.keys(pick(values, this.attributeNames)).forEach((attributeKey) => {
      this.setAttribute(attributeKey, values[attributeKey]);
    });
  }

  /**
   * @returns {Object} the parsers for the attributes
   */
  parsers(): AttributeParsers {
    return {};
  }

  /**
   * @returns {Object} the validations to use for the entity
   */
  validations(): Validations {
    return {};
  }

  /**
   * Validates an entity's attributes
   *
   * @param {Object} attributes the entity's attributes to be validated
   * @throws {ValidationError} when the attributes are invalid
   * @void
   */
  validate(): void {
    const errors = validate.validate(this.state, this.validations(), {
      fullMessages: false,
    });

    if (!isEmpty(errors)) {
      throw new ValidationError(this.validationMessage, errors);
    }
  }

  /**
   * Returns the value for an attribute
   *
   * @param {String} name the name of the attribute to get
   * @returns {Any}
   */
  getAttribute(name: string): any {
    return this.state[name];
  }

  /**
   * Sets an attribute value
   *
   * @param {String} name the name of the attribute to set
   * @param {Any} value the value of the attribute to set
   */
  setAttribute(name: string, value: any): void {
    const { [name]: parser } = this.parsers();

    if (!isFunction(parser)) {
      throw new Error(`No parser has been specified for attribute “${name}”`);
    }

    this.state[name] = parser(value);
  }

  /**
   * @param {String} name the attribute name to register
   */
  registerAttribute(name: string) {
    const attributeMetadata = Reflect.getOwnMetadata(this.metadataKey, this) || [];
    Reflect.defineMetadata(this.metadataKey, [...attributeMetadata, name], this);
  }

  /**
   * @returns {String} the metadata key to use
   */
  get metadataKey(): string {
    return `attributes:${this.constructor.name}`.toLowerCase();
  }
}

export default Entity;
