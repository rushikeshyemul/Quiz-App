import assert from "node:assert/strict";
import test from "node:test";
import { buildCertificateNumber, qualifiesForCertificate } from "../lib/certificates.js";

test("a certificate requires a perfect server score", () => {
  assert.equal(qualifiesForCertificate(5, 5), true);
  assert.equal(qualifiesForCertificate(4, 5), false);
  assert.equal(qualifiesForCertificate(0, 0), false);
  assert.equal(qualifiesForCertificate(5.5, 5), false);
});

test("certificate numbers are stable for an attempt", () => {
  const issuedAt = new Date("2026-10-17T00:00:00.000Z");
  const number = buildCertificateNumber("507f1f77bcf86cd799439011", issuedAt);
  assert.equal(number, "QM-2026-99439011");
  assert.equal(buildCertificateNumber("507f1f77bcf86cd799439011", issuedAt), number);
});
