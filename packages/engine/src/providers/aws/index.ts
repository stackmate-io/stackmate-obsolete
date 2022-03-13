import AwsProvider from 'engine/providers/aws/services/aws';
import AwsRdsService from 'engine/providers/aws/services/database';
import AwsSsmParamsService from 'engine/providers/aws/services/vault';
import AwsS3State from 'engine/providers/aws/services/state';

export {
  AwsProvider as Provider,
  AwsRdsService as Database,
  AwsSsmParamsService as Vault,
  AwsS3State as State,
};
