import { CloudService } from 'engine/types';
import { PROVIDER, SERVICE_TYPE, STORAGE } from 'engine/constants';

// Utility types
export type ConstructorOf<T> = Function & { new(...args: any[]): T };
export type FactoryOf<T> = { factory(...args: any[]): T; }
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;
export type ValueOf<T> = T[keyof T];
export type ChoiceOf<T> = T[keyof T];
export type OneOf<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer OneOf> ? OneOf : never;
export type ServiceTypeChoice = ChoiceOf<typeof SERVICE_TYPE>;
export type ProviderChoice = ChoiceOf<typeof PROVIDER>;
export type StorageChoice = ChoiceOf<typeof STORAGE>;
export type ServiceScopeChoice = OneOf<['deployable', 'preparable', 'destroyable']>;

// Config file types
export type ServiceAssociationDeclarations = string[];
export type EnvironmentVariablesDeclaration = Record<string, string | number>;

export type CredentialsObject = {
  username?: string;
  password?: string;
};

export type CredentialsCollection = {
  [service: string]: CredentialsObject;
}

export type ServiceAssociation = {
  lookup: (a: CloudService) => boolean;
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
  projectName: string;
  stageName: string;
  profile?: string;
  links?: ServiceAssociationDeclarations;
};

// The final attributes that the Service class should expect
export type ServiceAttributes = ServiceConfigurationDeclarationNormalized;

export type CloudAttributes = {
  regions: Array<string>;
  defaults?: ProviderDefaults;
};

export type ServiceList = Map<string, CloudService>;

export type RegionList = {
  [name: string]: string;
};

export type ProviderDefaults = {
  [name: string]: string | number;
};

export type AwsDefaults = ProviderDefaults & {
  'vpc-cidr'?: string;
  'vpc-prefix'?: string;
};

export type ProjectDefaults = {
  aws?: AwsDefaults;
};

export type StageConfiguration = {
  [srv: string]: ServiceConfigurationDeclaration;
};

export type StageDeclarations = {
  [name: string]: StageConfiguration & { from?: string; skip?: Array<string> };
};

export type VaultConfiguration = {
  provider?: ProviderChoice;
  key?: string;
  region?: string;
  path?: string;
};

export type StateConfiguration = {
  provider?: ProviderChoice;
  key?: string;
  region?: string;
  bucket?: string;
}

export type ProjectConfiguration = {
  name?: string;
  provider?: string;
  secrets?: VaultConfiguration;
  state?: StateConfiguration;
  region?: string;
  stages?: StageDeclarations;
  defaults?: ProjectDefaults;
};

export type StagesAttributes = {
  [name: string]: {
    [serviceName: string]: ServiceAttributes;
  };
};

export type NormalizedStage = {
  [serviceName: string]: ServiceConfigurationDeclarationNormalized;
}

export type StagesNormalizedAttributes = {
  [name: string]: NormalizedStage;
};

export type NormalizedStages = {
  [name: string]: ServiceConfigurationDeclarationNormalized;
};

export type NormalizedProjectConfiguration = {
  name: string;
  provider: ProviderChoice,
  region: string,
  stages: StagesNormalizedAttributes;
  secrets: VaultConfiguration,
  state: StateConfiguration,
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
  provider: 'aws';
  key: string;
  region: string;
  namespace: string;
};

export type ConfigurationAttributes = {
  storage: StorageChoice;
  [name: string]: any;
};

export type ResourceProfile = {
  [attribute: string]: object;
};

export type VaultAttributes = ConfigurationAttributes & {
  key?: string;
  region?: string;
};

export type VaultCredentialOptions = {
  length?: number;
  root?: Boolean;
  special?: Boolean;
  exclude?: string[],
};

import { App as TerraformApp, TerraformProvider, TerraformStack } from 'cdktf';

import {
  ProviderChoice, ServiceAssociation, AttributeParsers,
  ServiceScopeChoice, AbstractConstructor, ConstructorOf,
  ServiceTypeChoice, Validations, EntityAttributes, CredentialsObject, VaultCredentialOptions,
} from 'engine/types';

export interface BaseEntity {
  validationMessage: string;
  attributes: EntityAttributes;
  parsers(): AttributeParsers;
  validate(): void;
  validations(): Validations;
  getAttribute(name: string): any;
  setAttribute(name: string, value: any): void;
}

export interface CloudService extends BaseEntity {
  readonly name: string;
  readonly provider: ProviderChoice;
  readonly type: ServiceTypeChoice;
  region: string;
  links: Array<string>;
  identifier: string;
  providerService: ProviderService;
  vault: VaultService;
  get isRegistered(): boolean;
  link(...targets: CloudService[]): CloudService;
  associations(): ServiceAssociation[];
  isDependingUpon(service: CloudService): boolean;
  parsers(): AttributeParsers & Required<{ name: Function, links: Function }>;
  validations(): Validations & Required<{ name: object, links: object }>;
  register(stack: CloudStack): void;
  scope(name: ServiceScopeChoice): CloudService;
  onPrepare(stack: CloudStack): void;
  onDeploy(stack: CloudStack): void;
  onDestroy(stack: CloudStack): void;
}

export interface BaseEntityConstructor<T extends BaseEntity> extends Function {
  prototype: T;
  new(...args: any[]): T;
  factory(this: ConstructorOf<T>, ...args: any[]): T;
}

export interface Sizeable extends BaseEntity {
  size: string;
  parsers(): AttributeParsers & Required<{ size: Function }>;
  validations(): Validations & Required<{ size: object }>;
}

export interface Storable extends BaseEntity {
  storage: number;
  parsers(): AttributeParsers & Required<{ size: Function }>;
  validations(): Validations & Required<{ storage: object }>;
}

export interface Mountable extends BaseEntity {
  volumes: string; // TODO
  parsers(): AttributeParsers & Required<{ volumes: Function }>;
  validations(): Validations & Required<{ volumes: object }>;
}

export interface MultiNode extends BaseEntity {
  nodes: number;
  parsers(): AttributeParsers & Required<{ nodes: Function }>;
  validations(): Validations & Required<{ nodes: object }>;
}

export interface Versioned extends BaseEntity {
  version: string;
  parsers(): AttributeParsers & Required<{ version: Function }>;
  validations(): Validations & Required<{ version: object }>;
}

export interface Profilable extends BaseEntity {
  profile: string;
  overrides: object;
}

export interface StorageAdapter {
  deserialize(serialized: string | object): object;
  read(): Promise<object>;
}

export interface CloudStack extends TerraformStack {
  readonly name: string;
  readonly app: TerraformApp;
  readonly appName: string;
  readonly outputPath: string;
}

export interface CloudApp extends TerraformApp {
  readonly name: string;
  stack(name: string): CloudStack;
}

export interface VaultService extends CloudService {
  credentials(stack: CloudStack, service: string, opts?: VaultCredentialOptions): CredentialsObject;
}

export interface ProviderService extends CloudService {
  resource: TerraformProvider;
  bootstrap(stack: CloudStack): void;
  prerequisites(stack: CloudStack): void;
}

export interface StateService extends CloudService {
  backend(stack: CloudStack): void;
  resources(stack: CloudStack): void;
}

export interface SubclassRegistry<T> {
  items: Map<string, T>;
  get(attributes: object): T | undefined;
  add(classConstructor: T, ...attrs: string[]): void;
}

export interface CloudServiceConstructor extends AbstractConstructor<CloudService> { }

export interface Queueable<T> {
  items: [T, number][];
  size: number;
  isEmpty: boolean;
  all: T[];
  insert(item: T, priority: number): void;
  peek(): T | null;
  pop(): T | null;
}

export interface Provisionable {
  services: CloudService[];
  readonly app: CloudApp;
  readonly stack: CloudStack;
  readonly queue: Queueable<CloudService>;
  process(): void;
}

export interface Operatable {
  readonly provisioner: Provisionable;
  run(): void;
}
