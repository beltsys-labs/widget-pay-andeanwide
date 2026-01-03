export default (style) => {
  return (`

    .GraphicWrapper {
      display: block;
      padding: 10px 0;
    }

    .Graphic {
      width: 50%;
      position: relative;
    }

    .GraphicPassiveColor {
      fill: ${style.colors.icons};
    }

    .GraphicActiveColor {
      fill: ${style.colors.icons};
    }
  `)
}
