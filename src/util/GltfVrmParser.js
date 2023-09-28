import { validateBytes } from 'gltf-validator';
import * as GltfParserUtils from './GltfParserUtils';

export default class GltfVrmParser {
  fileName;

  fileDataView;

  version;

  jsonChunk;

  binaryChunk;

  get jsonString() {
    const decoder = new TextDecoder('utf8');
    const jsonString = decoder.decode(this.jsonChunk.chunkUint8Array);
    return this.jsonChunk ? jsonString : null;
  }

  get json() {
    return this.jsonChunk ? GltfParserUtils.parseJson(this.jsonChunk) : null;
  }

  set json(json) {
    const jsonString = JSON.stringify(json);
    const jsonStringLength = GltfParserUtils.calculateChunkLength(
      jsonString.length,
    );
    // This chunk MUST be padded with trailing Space chars (0x20) to satisfy alignment requirements.
    const paddedJsonString = jsonString.padEnd(jsonStringLength);
    console.log('NEW JSON STRING LENGTH:', JSON.stringify(json).length);
    console.log('OLD CHUNK LENGTH:', this.jsonChunk.chunkLength);
    console.log('NEW JSON LENGTH:', jsonStringLength);
    console.log('NEW PADDED JSON LENGTH:', paddedJsonString.length);
    const encodedJsonString = new TextEncoder().encode(paddedJsonString);
    console.log('ENCODED LENGTH:', encodedJsonString.length);

    this.jsonChunk = {
      chunkLength: jsonStringLength,
      chunkUint8Array: encodedJsonString,
    };
  }

  async parseFile(file) {
    console.log(file);
    this.fileName = file.name;

    const fileDataView = new DataView(await file.arrayBuffer());

    console.log('VALIDATING IMPORTED FILE...');
    const report = await validateBytes(new Uint8Array(fileDataView.buffer), {
      ignoredIssues: ['BUFFER_VIEW_TARGET_MISSING'],
    });
    console.info('VALIDATION SUCCEEDED: ', report);
    // if (report.issues.numErrors > 0) {
    //   throw new Error('Invalid GLTF.');
    // }

    const { version } = GltfParserUtils.parseHeader({
      fileDataView,
    });

    this.version = version;
    this.jsonChunk = GltfParserUtils.parseJsonChunk({
      fileDataView,
      header: this.header,
    });

    this.binaryChunk = GltfParserUtils.parseBinaryChunk({
      fileDataView,
      jsonChunkLength: this.jsonChunk.chunkLength,
    });

    console.log('JSON:', GltfParserUtils.parseJson(this.jsonChunk));
  }

  async buildFile() {
    console.log('BUILDING FILE');
    const file = GltfParserUtils.buildGltfFile({
      fileName: this.fileName,
      jsonChunk: this.jsonChunk,
      binaryChunk: this.binaryChunk,
      version: this.version,
    });

    console.log('VALIDATING BUILT FILE...');
    const report = await validateBytes(
      new Uint8Array(await file.arrayBuffer()),
      {
        ignoredIssues: ['BUFFER_VIEW_TARGET_MISSING'],
      },
    );
    console.info('VALIDATION SUCCEEDED: ', report);
    // if (report.issues.numErrors > 0) {
    //   throw new Error('Invalid GLTF.');
    // }

    return file;
  }
}
