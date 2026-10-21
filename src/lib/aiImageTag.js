// ─── AI IMAGE TAG ─────────────────────────────────────────────────────────────
// Marks a JPEG as AI-generated in a machine-readable way (EU AI Act Art. 50(2))
// by embedding an XMP packet with the IPTC Digital Source Type
// "trainedAlgorithmicMedia", the standard tag photo tools and platforms read
// for AI-generated images. No visible stamp; nothing leaves the device.
const DIGITAL_SOURCE_TYPE = "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia";
const XMP_HEADER = "http://ns.adobe.com/xap/1.0/\0";

const XMP_PACKET =
  '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>' +
  '<x:xmpmeta xmlns:x="adobe:ns:meta/">' +
  '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
  '<rdf:Description rdf:about=""' +
  ' xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"' +
  ' xmlns:dc="http://purl.org/dc/elements/1.1/"' +
  ' Iptc4xmpExt:DigitalSourceType="' + DIGITAL_SOURCE_TYPE + '">' +
  '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">AI-generated image</rdf:li></rdf:Alt></dc:description>' +
  '</rdf:Description></rdf:RDF></x:xmpmeta>' +
  '<?xpacket end="r"?>';

// Takes a data:image/jpeg;base64 URI and returns the same image with the XMP
// segment inserted after the JPEG header (and after a JFIF APP0 segment, if
// present, which must come first). Anything that isn't a JPEG data URI is
// returned unchanged.
export function tagJpegAsAI(dataURI) {
  const m = /^data:image\/jpeg;base64,(.*)$/.exec(dataURI || "");
  if (!m) return dataURI;
  const bin = atob(m[1]);
  const src = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) src[i] = bin.charCodeAt(i);
  if (src[0] !== 0xFF || src[1] !== 0xD8) return dataURI;

  let at = 2;
  if (src[2] === 0xFF && src[3] === 0xE0) at = 4 + ((src[4] << 8) | src[5]);

  const payload = new TextEncoder().encode(XMP_HEADER + XMP_PACKET);
  const segLen = payload.length + 2;
  const out = new Uint8Array(src.length + 2 + segLen);
  out.set(src.subarray(0, at), 0);
  out.set([0xFF, 0xE1, segLen >> 8, segLen & 0xFF], at);
  out.set(payload, at + 4);
  out.set(src.subarray(at), at + 4 + payload.length);

  let s = "";
  for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
  return "data:image/jpeg;base64," + btoa(s);
}
