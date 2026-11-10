# Design overlay

The design overlay lays your design images (mockups, exports from a design tool) over the live page so you can compare them pixel by pixel.

## Open it

Choose **Design overlay** in the **More tools** menu, or press `O`.

## Add images

In the panel, **Drop, paste or click to choose design images**:

- drop image files on the box,
- paste an image with `Ctrl+V` while the overlay is open,
- or click the box to pick files.

You can keep up to 5 images. Once one is added, the **+** button (**Add another image…**) adds more. Thumbnails at the top of the panel show the images; click one (or the image itself) to select it.

Images are not saved: they disappear when you turn PixelLens off.

## Move and resize

- Drag the middle of an image to move it; drag a corner to resize it.
- Arrow keys nudge the selected image 1px (`Shift`: 10px).
- **Scale %** sets the size as a percentage of the image's natural size.
- **Pin to screen** keeps the image fixed while the page scrolls.
- **Visible** / **Hidden** shows or hides the selected image.
- **Remove** deletes it.

## Blend modes

**Blend** sets how the selected image mixes with the page:

| Mode           | Result                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| **Normal**     | The image on top, with the **Opacity** you set.                                  |
| **Difference** | Identical pixels turn black, so any offset stands out. Opacity is fixed at 100%. |
| **Onion skin** | A see-through layer, at most 60% opacity, with a tint of your choice.            |

With **Onion skin**, pick the tint:

- **Normal**: the image as is.
- **Invert**: inverted colors.
- **Two-tone**: a single colored tone, easy to tell apart from the page.

New images start with the last blend mode you picked.

## Before/after split

Turn on **Before/after split** to show the design on one side of a divider and the live page on the other. Drag the divider to compare. **Design on the left** chooses which side shows the design.

The blend mode, onion tint, split setting, divider position and side are remembered for next time.
