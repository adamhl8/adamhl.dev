import sharp from "sharp"

const image = sharp("./public/favicon.svg")

await image
  .resize({
    width: 32,
    height: 32,
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 0 },
  })
  .toFile("./public/favicon-32x32.png")
