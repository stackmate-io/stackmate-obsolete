import { isUndefined } from 'lodash';
import { Memoize } from 'typescript-memoize';
import { DbInstance, DbParameterGroup } from '@cdktf/provider-aws/lib/rds';

import Database from '@stackmate/core/services/database';
import AwsService from '@stackmate/providers/aws/mixins';
import { OneOf } from '@stackmate/types';
import { CloudStack } from '@stackmate/interfaces';
import {
  RDS_ENGINES,
  RDS_INSTANCE_SIZES,
  RDS_PARAM_FAMILY_MAPPING,
  RDS_MAJOR_VERSIONS_PER_ENGINE,
  RDS_LOG_EXPORTS_PER_ENGINE,
} from '@stackmate/providers/aws/constants';

const AwsDatabaseService = AwsService(Database);

class AwsRdsService extends AwsDatabaseService {
  /**
   * @var {Array<string>} sizes the list of RDS instance sizes
   */
  readonly sizes = RDS_INSTANCE_SIZES;

  /**
   * @var {String} engine the database engine to use
   */
  engine: OneOf<typeof RDS_ENGINES>;

  /**
   * @var {Array<String>} engines the list of database engines available for this service
   */
  readonly engines: ReadonlyArray<string> = RDS_ENGINES;

  /**
   * @var {DbInstance} instance the rds instance, in case we're deploying a single instance
   */
  public instance: DbInstance;

  /**
   * @var {DbParameterGroup} paramGroup the parameter group to use when deploying an RDS resource
   */
  public paramGroup: DbParameterGroup;

  /**
   * @returns {Boolean} whether the service is registered
   */
  get isRegistered(): boolean {
    return !isUndefined(this.instance) && !isUndefined(this.paramGroup);
  }

  @Memoize() public get paramGroupFamily() {
    const triad = RDS_PARAM_FAMILY_MAPPING.find(
      ([engine, version]) => engine === this.engine && this.version.startsWith(version),
    );

    if (!triad) {
      throw new Error(
        'We couldn’t determine the parameter group family to use based on your database’s version and engine',
      );
    }

    return triad[2];
  }

  /**
   * Returns the validations for the service
   *
   * @returns {Validations} the validations to run
   */
  validations() {
    return {
      ...super.validations(),
      version: {
        presence: {
          allowEmpty: false,
          message: 'You have to specify the database version to run',
        },
        validateVersion: {
          availableVersions: RDS_MAJOR_VERSIONS_PER_ENGINE.get(this.engine) || [],
        },
      },
    };
  }

  onDeploy(stack: CloudStack): void {
    const { instance, params } = this.resourceProfile;
    const { username, password } = this.vault.credentials(stack, this.name, { root: true });

    this.paramGroup = new DbParameterGroup(stack, `${this.identifier}-params`, {
      ...params,
      family: this.paramGroupFamily,
    });

    this.instance = new DbInstance(stack, this.name, {
      ...instance,
      allocatedStorage: this.storage,
      count: this.nodes,
      enabledCloudwatchLogsExports: RDS_LOG_EXPORTS_PER_ENGINE.get(this.engine),
      engine: this.engine,
      engineVersion: this.version,
      identifier: this.identifier,
      instanceClass: this.size,
      name: this.database,
      parameterGroupName: this.paramGroup.name,
      port: this.port,
      provider: this.providerService.resource,
      dbSubnetGroupName: `db-subnet-${this.identifier}`,
      username,
      password,
      lifecycle: {
        createBeforeDestroy: true,
      },
    });
  }
}

export default AwsRdsService;
