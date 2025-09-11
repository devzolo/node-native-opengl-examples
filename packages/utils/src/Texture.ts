import fs from "fs/promises";
import GL from "@devzolo/node-native-gl";
import Jpeg from "jpeg-js";
import PNG from "pngjs";
import Bmp from "bmp-js";

export class Texture {
  public id = 0;

  static #magicMimeMap = {
    jpeg: { magic: Buffer.from([0xff, 0xd8]), mime: "image/jpeg" },
    png: { magic: Buffer.from([0x89, 0x50]), mime: "image/png" },
    gif: { magic: Buffer.from([0x47, 0x49]), mime: "image/gif" },
    bmp: { magic: Buffer.from([0x42, 0x4d]), mime: "image/bmp" },
    ico: { magic: Buffer.from([0x00, 0x00]), mime: "image/ico" },
  };

  public static async detectMimeType(data: Buffer): Promise<string> {
    const magic = new Uint8Array(data.subarray(0, 2));
    for (const value of Object.values(this.#magicMimeMap)) {
      if (value.magic.equals(magic)) return value.mime;
    }
    throw new Error("Unsupported file type");
  }

  public static async load(path: string): Promise<Texture> {
    const data = await fs.readFile(path);
    const mimeType = await Texture.detectMimeType(data);
    if (mimeType === "image/jpeg") {
      return this.loadFromJpg(data);
    }
    if (mimeType === "image/png") {
      return this.loadFromPng(data);
    }
    if (mimeType === "image/bmp") {
      return this.loadFromBmp(data);
    }
    throw new Error("Unsupported file type");
  }

  public static async loadFromJpg(jpegData: Buffer): Promise<Texture> {
    const texture = new Texture();

    const jpeg = Jpeg.decode(jpegData, {
      formatAsRGBA: true,
    });

    //FLIP Y AXIS
    let flipped = new Uint8Array(jpeg.data.length);
    let lineSize = jpeg.width * 4;
    for (let i = 0; i < jpeg.height; i++) {
      let offset = i * lineSize;
      let offsetFlipped = (jpeg.height - i - 1) * lineSize;
      flipped.set(jpeg.data.subarray(offset, offset + lineSize), offsetFlipped);
    }

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
      flipped as any
    );

    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
    GL.bindTexture(GL.TEXTURE_2D, 0);
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
      new Uint8Array(png.data) as any
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
    GL.texImage2D(
      GL.TEXTURE_2D,
      0,
      GL.RGBA,
      bmp.width,
      bmp.height,
      0,
      GL.RGBA,
      GL.UNSIGNED_BYTE,
      result as any
    );
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
    GL.texParameterf(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    return texture;
  }
}
