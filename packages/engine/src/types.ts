import { CloudService } from '@stackmate/interfaces';
import { PROVIDER, SERVICE_TYPE, STORAGE } from '@stackmate/constants';

// Utility types
export type ConstructorOf<T> = { new(...args: any[]): T };
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;
export type ValueOf<T> = T[keyof T];
export type ChoiceOf<T> = T[keyof T];
export type OneOf<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer OneOf> ? OneOf : never;
export type ServiceTypeChoice = ChoiceOf<typeof SERVICE_TYPE>;
export type ProviderChoice = ChoiceOf<typeof PROVIDER>;
export type StorageChoice = ChoiceOf<typeof STORAGE>;

// Config file types
export type ServiceAssociationDeclarations = Array<string>;
export type EnvironmentVariablesDeclaration = Record<string, string|number>;

export type CredentialsObject = {
  username?: string;
  password?: string;
};

export type ServiceAssociation = {
  lookup: ConstructorOf<CloudService>;
  handler: (a: CloudService) => void;
};

export type ServiceConfigurationDeclaration = {
  type: ServiceTypeChoice;
  provider?: ProviderChoice;
  region?: string;
  profile?: string;
  links?: ServiceAssociationDeclarations;
};

export type ServiceConfigurationDeclarationNormalized = {
  type: ServiceTypeChoice;
  provider: ProviderChoice;
  region: string;
  name: string;
  profile?: string;
  links?: ServiceAssociationDeclarations;
  credentials?: CredentialsObject;
  rootCredentials?: CredentialsObject;
};

// The final attributes that the Service class should expect
export type ServiceAttributes = Omit<ServiceConfigurationDeclarationNormalized, 'type' | 'provider'>;

export type ServiceList = Map<string, CloudService>;

export type ServiceMapping = {
  [name: string]: ConstructorOf<CloudService>;
};

export type RegionList = {
  [name: string]: string;
};

export type CloudPrerequisites = {
  [name: string]: CloudService;
};

export type ProviderDefaults = {
  [name: string]: string | number;
}

export type AwsDefaults = ProviderDefaults & {
  'vpc-cidr'?: string;
  'vpc-prefix'?: string;
};

export type ProjectDefaults = {
  aws?: AwsDefaults;
};

export type StageDeclarations = {
  [name: string]: { from?: string; skip?: Array<string> } & {
    [srv: string]: ServiceConfigurationDeclaration;
  };
}

export type VaultConfiguration = {
  storage: StorageChoice;
  key?: string;
  region?: string;
};

export type ProjectConfiguration = {
  name?: string;
  provider?: string;
  vault?: VaultConfiguration;
  region?: string;
  stages?: StageDeclarations;
  defaults?: ProjectDefaults;
};

export type StagesAttributes = {
  [name: string]: {
    [serviceName: string]: ServiceAttributes;
  };
};

export type StagesNormalizedAttributes = {
  [name: string]: {
    [serviceName: string]: ServiceConfigurationDeclarationNormalized;
  };
};

export type NormalizedStages = {
  [name: string]: ServiceConfigurationDeclarationNormalized;
};

export type NormalizedProjectConfiguration = {
  name: string;
  provider: ProviderChoice,
  region: string,
  stages: StagesNormalizedAttributes;
  vault: VaultConfiguration,
  defaults: ProjectDefaults;
};

export interface AttributeParsers {
  [name: string]: Function;
}

export interface EntityAttributes {
  [name: string]: any;
}

export type Validations = {
  [name: string]: object;
};

export type ValidationErrorList = {
  [attribute: string]: Array<string>;
};

export type StorageOptions = {};
export type LocalFileStorageOptions = StorageOptions & {
  path: string;
};
export type AwsParamStorageOptions = StorageOptions & {
  key: string;
  region: string;
}

export type ConfigurationAttributes = {
  storage: StorageChoice;
  path?: string;
};

export type VaultAttributes = ConfigurationAttributes & {
  key?: string;
  region?: string;
};

export type DatabaseServiceAttributes = ServiceAttributes & Required<{
  size: string;
  nodes: number;
  storage: number;
  engine: string;
  database: string;
  version: string;
  port: number;
  rootCredentials: CredentialsObject;
}>;

export type DatabaseProvisioningProfile = {
  instance: object;
  params: object;
};

export type DatabaseServiceDefaults = Pick<DatabaseServiceAttributes, 'nodes' | 'size' | 'engine' | 'storage' | 'rootCredentials'>;

export type NetworkingServiceAttributes = ServiceAttributes & {
  cidr: string;
};

export type NetworkingServiceDefaults = {
  cidr: string;
};
