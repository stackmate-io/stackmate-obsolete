import { pick } from 'lodash';
import { Memoize } from 'typescript-memoize';

import Operation from 'engine/core/operation';
import ServicesRegistry from 'engine/core/registry';
import { CloudService } from 'engine/types';
import { PROVIDER, SERVICE_TYPE } from 'engine/constants';

class PrepareOperation extends Operation {
  /**
   * @returns {CloudService} the local state service
   */
  @Memoize() get localState(): CloudService {
    const attrs = { type: SERVICE_TYPE.STATE, provider: PROVIDER.LOCAL };
    return ServicesRegistry.get(pick(attrs, 'type', 'provider')).factory(attrs);
  }

  /**
   * Prepares the services for provisioning
   */
  run() {
    this.provisioner.services = [
      this.localState.scope('deployable'),
      ...this.services.map(srv => srv.scope('preparable')),
    ];

    this.provisioner.process();
  }
}

export default PrepareOperation;
