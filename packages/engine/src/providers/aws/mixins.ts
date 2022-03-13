import { AWS_REGIONS } from 'engine/providers/aws/constants';
import { PROVIDER } from 'engine/constants';
import { AbstractConstructor, ProviderChoice, RegionList } from 'engine/types';
import { Provider as AwsProvider } from 'engine/providers/aws';

const AwsService = <TBase extends AbstractConstructor>(Base: TBase) => {
  abstract class AwsServiceWrapper extends Base {
    /**
     * @var {String} provider the cloud provider used (eg. AWS)
     * @readonly
     */
    readonly provider: ProviderChoice = PROVIDER.AWS;

    /**
     * @var {Object} regions the list of regions available
     * @readonly
     */
    readonly regions: RegionList = AWS_REGIONS;

    /**
     * @var {ProviderService} cloudProvider the cloud provider service
     */
    providerService: AwsProvider;
  }

  return AwsServiceWrapper;
};

export default AwsService;
