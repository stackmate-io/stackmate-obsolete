import { promises as fsPromises } from 'fs';

import BaseStorageAdapter from '@stackmate/adapters/storage/base';
import { AttributeParsers, Validations } from '@stackmate/types';
import { parseFileName } from '@stackmate/lib/parsers';
import { Attribute } from '@stackmate/lib/decorators';

class LocalFileAdapter extends BaseStorageAdapter {
  /**
   * @var {Object} options the options for the storage
   */
  @Attribute path: string;

  /**
   * @returns {String} the error message
   */
  public get validationMessage(): string {
    return 'The file information provided is not valid';
  }

  parsers(): AttributeParsers {
    return {
      ...super.parsers(),
      path: parseFileName,
    };
  }

  validations(): Validations {
    return {
      ...super.validations(),
      path: {
        presence: {
          allowEmpty: false,
          message: 'You have to provide a file path for the project',
        },
        validateFileExistence: {},
      },
    };
  }

  /**
   * Reads the file contents
   *
   * @returns {String}
   * @async
   */
  async read(): Promise<string> {
    const contents = await fsPromises.readFile(this.path);
    return contents.toString();
  }

  /**
   * Writes a file given a stringified content
   *
   * @param {String} contents the file contents to write out
   * @void
   * @async
   */
  async write(contents: string): Promise<void> {
    await fsPromises.writeFile(this.path, contents, { encoding: 'utf-8' });
  }
}

export default LocalFileAdapter;
