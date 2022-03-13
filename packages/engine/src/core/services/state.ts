import Service from '@stackmate/core/service';
import { ServiceTypeChoice } from '@stackmate/types';
import { SERVICE_TYPE } from '@stackmate/constants';
import { CloudStack } from '@stackmate/interfaces';

abstract class State extends Service {
  /**
   * @var {ServiceTypeChoice} type the service's type
   */
  type: ServiceTypeChoice = SERVICE_TYPE.STATE;

  /**
   * Provisions the state storage itself
   *
   * @param {CloudStack} stack the stack to deploy the resource to
   */
  abstract resource(stack: CloudStack): void;

  /**
   * Provisions a data resource for the state
   *
   * @param {CloudStack} stack the stack to deploy the resource to
   */
  abstract data(stack: CloudStack): void;

  /**
   * Provisioning when we initially prepare a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onPrepare(stack: CloudStack): void {
    this.resource(stack);
  }

  /**
   * Provisioning when we deploy a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onDeploy(stack: CloudStack): void {
    this.data(stack);
  }

  /**
   * Provisioning on when we destroy destroy a stage
   *
   * @param {CloudStack} stack the stack to provision the service in
   * @void
   */
  onDestroy(stack: CloudStack): void {
    // The state has to be present when destroying resources
    this.data(stack);
  }
}

export default State;
