import fs from 'fs/promises';
import GL from '@devzolo/node-native-gl';
import Jpeg from 'jpeg-js';
import PNG from 'pngjs';
import Bmp from 'bmp-js';

export class Texture {
  public id = 0;

  public static async detectMimeType(data: Buffer): Promise<string> {
    const magic = data.slice(0, 2);
    if (Buffer.from([0xff, 0xd8]).equals(magic)) {
      return 'image/jpeg';
    }
    if (Buffer.from([0x89, 0x50]).equals(magic)) {
      return 'image/png';
    }
    if (Buffer.from([0x47, 0x49]).equals(magic)) {
      return 'image/gif';
    }
    if (Buffer.from([0x42, 0x4d]).equals(magic)) {
      return 'image/bmp';
    }
    if (Buffer.from([0x00, 0x00]).equals(magic)) {
      return 'image/ico';
    }
    throw new Error('Unsupported file type');
  }

  public static async load(path: string): Promise<Texture> {
    const data = await fs.readFile(path);
    const mimeType = await Texture.detectMimeType(data);
    if (mimeType === 'image/jpeg') {
      return this.loadFromJpg(data);
    }
    if (mimeType === 'image/png') {
      return this.loadFromPng(data);
    }
    if (mimeType === 'image/bmp') {
      return this.loadFromBmp(data);
    }
    throw new Error('Unsupported file type');
  }

  public static async loadFromJpg(jpegData: Buffer): Promise<Texture> {
    const texture = new Texture();

    const jpeg = Jpeg.decode(jpegData, {
      formatAsRGBA: true,
    });

    let result = new Uint8Array(jpeg.data.length);
    for (let i = 0; i < jpeg.data.length; i += 4) {
      result[i + 0] = jpeg.data[i + 3];
      result[i + 1] = jpeg.data[i + 2];
      result[i + 2] = jpeg.data[i + 1];
      result[i + 3] = jpeg.data[i + 0];
    }
    result = result.reverse();

    texture.id = GL.genTextures(1)[0];
    GL.bindTexture(GL.TEXTURE_2D, texture?.id ?? 0);
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      jpeg.width,
      jpeg.height,
      0,
      GL.RGBA,
      GL.UNSIGNED_BYTE,
      Buffer.from(result) as any,
    );
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    return texture;
  }

  public static async loadFromPng(pngData: Buffer): Promise<Texture> {
    const texture = new Texture();

    const png = PNG.PNG.sync.read(pngData);

    texture.id = GL.genTextures(1)[0];
    GL.bindTexture(GL.TEXTURE_2D, texture?.id ?? 0);
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      png.width,
      png.height,
      0,
      GL.RGBA,
      GL.UNSIGNED_BYTE,
      Buffer.from(png.data) as any,
    );
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    return texture;
  }

  public static async loadFromBmp(bmpData: Buffer): Promise<Texture> {
    const texture = new Texture();
    const bmp = Bmp.decode(bmpData);

    let result = new Uint8Array(bmp.data.length);
    for (let i = 0; i < bmp.data.length; i += 4) {
      result[i + 3] = bmp.data[i + 3];
      result[i + 2] = bmp.data[i + 2];
      result[i + 1] = bmp.data[i + 1];
      result[i + 0] = bmp.data[i + 0];
    }
    result = result.reverse();

    texture.id = GL.genTextures(1)[0];

    GL.bindTexture(GL.TEXTURE_2D, texture?.id ?? 0);
    GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, bmp.width, bmp.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, result as any);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    return texture;
  }
}
