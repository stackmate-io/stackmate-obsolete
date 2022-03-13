import FileStorage from 'engine/core/storage/file';
import { StorageChoice } from 'engine/types';
import { STORAGE } from 'engine/constants';
import { StorageAdapter } from 'engine/interfaces';

const getStoragAdaptereByType = (type: StorageChoice, attributes: object): StorageAdapter => {
  let adapter;

  if (type === STORAGE.FILE) {
    adapter = new FileStorage();
  }

  if (!adapter) {
    throw new Error(
      `Invalid storage type ${type} provided. Available options are ${Object.values(STORAGE).join(', ')}`,
    );
  }

  adapter.attributes = attributes;
  adapter.validate()

  return adapter;
};

export {
  getStoragAdaptereByType,
  FileStorage,
};
