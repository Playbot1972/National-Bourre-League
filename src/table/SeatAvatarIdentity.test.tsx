import React from "react";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { SeatAvatarIdentity } from "./SeatAvatarIdentity";

describe("SeatAvatarIdentity", () => {
  it("renders fallback media and centered label when no photo", () => {
    const html = renderToStaticMarkup(
      <SeatAvatarIdentity
        displayName="Owen bot"
        onTogglePeek={() => {}}
        onBlurPeek={() => {}}
      />,
    );

    assert.match(html, /bseat__avatar-unit/);
    assert.match(html, /bseat__avatar-frame/);
    assert.match(html, /bseat__avatar--fallback/);
    assert.match(html, /bseat__avatar-label/);
    assert.match(html, />Owen</);
    assert.doesNotMatch(html, /bseat__name-plate/);
    assert.doesNotMatch(html, /bseat__avatar--initials/);
  });

  it("renders profile image inside the same media container", () => {
    const html = renderToStaticMarkup(
      <SeatAvatarIdentity
        displayName="Alex"
        photoURL="https://example.com/photo.jpg"
        onTogglePeek={() => {}}
        onBlurPeek={() => {}}
      />,
    );

    assert.match(html, /bseat__avatar--image/);
    assert.match(html, /src="https:\/\/example.com\/photo.jpg"/);
    assert.match(html, /bseat__avatar-label/);
    assert.doesNotMatch(html, /bseat__avatar--fallback/);
  });
});
